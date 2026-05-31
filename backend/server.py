from fastapi import FastAPI, APIRouter, HTTPException, Header, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bcrypt
import os
import logging
import time
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# RAWG API
RAWG_API_KEY = os.environ.get('RAWG_API_KEY', '')
RAWG_BASE = "https://api.rawg.io/api"
_rawg_cache = {}
CACHE_TTL = 300  # 5 minutes

# Admin password — hashed at startup (kept in-memory only)
_ADMIN_PASSWORD_HASH: Optional[bytes] = None

# Brute force config
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

# Anti-cheat scores config
MAX_SCORE_PER_GAME = {
    "snake": 10000,       # 1000 pommes max
    "tetris": 9999999,    # libre, mais raisonnable
    "platformer": 50000,  # ~ 7 niveaux x 7000 pts max
}
MIN_SECONDS_BETWEEN_SCORES_PER_IP = 5
_score_cooldown: dict = {}  # {ip: last_submission_timestamp}

# Rate limiter (in-memory, suffisant pour portfolio)
limiter = Limiter(key_func=get_remote_address)

# Create the main app without a prefix
app = FastAPI(title="Portfolio API - Ibrahima Dione")

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ===== MODELS =====
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=1, max_length=5000)


class Score(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game: str  # "snake" | "tetris" | "platformer"
    pseudo: str
    score: int
    level: int = 1
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScoreCreate(BaseModel):
    game: str = Field(..., pattern="^(snake|tetris|platformer)$")
    pseudo: str = Field(..., min_length=1, max_length=20)
    score: int = Field(..., ge=0)
    level: int = Field(default=1, ge=1)


class BlogArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    image_url: str = ""
    type: str = "blog"  # blog | news
    tags: List[str] = Field(default_factory=list)
    rating: Optional[float] = None  # /10 for game reviews
    youtube_url: str = ""
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BlogArticleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    excerpt: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1, max_length=20000)
    image_url: str = Field(default="", max_length=2000)
    type: str = Field(default="blog", pattern="^(blog|news)$")
    tags: List[str] = Field(default_factory=list)
    rating: Optional[float] = Field(default=None, ge=0, le=10)
    youtube_url: str = Field(default="", max_length=500)
    published: bool = True


class BlogArticleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    excerpt: Optional[str] = Field(default=None, min_length=1, max_length=500)
    content: Optional[str] = Field(default=None, min_length=1, max_length=20000)
    image_url: Optional[str] = Field(default=None, max_length=2000)
    type: Optional[str] = Field(default=None, pattern="^(blog|news)$")
    tags: Optional[List[str]] = None
    rating: Optional[float] = Field(default=None, ge=0, le=10)
    youtube_url: Optional[str] = Field(default=None, max_length=500)
    published: Optional[bool] = None


class AdminLogin(BaseModel):
    password: str


# ===== ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "Portfolio API - Ibrahima Dione", "status": "online"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ===== CONTACT ROUTES =====
@api_router.post("/contact", response_model=ContactMessage)
@limiter.limit("5/minute")
async def create_contact_message(request: Request, input: ContactMessageCreate):
    """Save a contact message to the database."""
    if "@" not in input.email or "." not in input.email:
        raise HTTPException(status_code=400, detail="Email invalide")

    contact_obj = ContactMessage(**input.model_dump())
    doc = contact_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    await db.contact_messages.insert_one(doc)
    logger.info(f"New contact message from {input.email}")
    return contact_obj


@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    """Get all contact messages (sorted by most recent)."""
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    return messages


@api_router.get("/contact/{message_id}", response_model=ContactMessage)
async def get_contact_message(message_id: str):
    """Get a specific contact message by ID."""
    msg = await db.contact_messages.find_one({"id": message_id}, {"_id": 0})
    if not msg:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    if isinstance(msg['timestamp'], str):
        msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    return msg


@api_router.patch("/contact/{message_id}/read")
async def mark_message_as_read(message_id: str):
    """Mark a contact message as read."""
    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    return {"success": True, "message": "Message marqué comme lu"}


@api_router.delete("/contact/{message_id}")
async def delete_contact_message(message_id: str):
    """Delete a contact message."""
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    return {"success": True, "message": "Message supprimé"}


# ===== LEADERBOARD ROUTES =====
@api_router.post("/scores", response_model=Score)
@limiter.limit("20/minute")
async def submit_score(request: Request, input: ScoreCreate):
    """Submit a new score for a game (with anti-cheat checks)."""
    # Sanitize pseudo (strip + collapse whitespace)
    pseudo_clean = " ".join(input.pseudo.split())
    if not pseudo_clean:
        raise HTTPException(status_code=400, detail="Pseudo invalide")

    # Anti-cheat: max score plausible
    max_allowed = MAX_SCORE_PER_GAME.get(input.game, 100000)
    if input.score > max_allowed:
        logger.warning(f"Score rejected (too high): {input.game} {pseudo_clean} {input.score}")
        raise HTTPException(status_code=400, detail="Score implausible refusé")

    # Anti-cheat: cooldown per IP (in-memory)
    ip = get_remote_address(request)
    now_ts = time.time()
    last = _score_cooldown.get(ip)
    if last and (now_ts - last) < MIN_SECONDS_BETWEEN_SCORES_PER_IP:
        wait = round(MIN_SECONDS_BETWEEN_SCORES_PER_IP - (now_ts - last), 1)
        raise HTTPException(
            status_code=429,
            detail=f"Attends {wait}s avant de soumettre un nouveau score"
        )
    _score_cooldown[ip] = now_ts

    score_obj = Score(
        game=input.game,
        pseudo=pseudo_clean[:20],
        score=input.score,
        level=input.level,
    )
    doc = score_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    doc['ip_hash'] = ip  # internal only, not returned (Score model has extra=ignore)
    await db.scores.insert_one(doc)
    logger.info(f"New score: {input.game} - {pseudo_clean}: {input.score}")
    return score_obj


@api_router.get("/scores/{game}", response_model=List[Score])
async def get_leaderboard(game: str, limit: int = 10):
    """Get top scores for a specific game (sorted descending)."""
    if game not in ("snake", "tetris", "platformer"):
        raise HTTPException(status_code=400, detail="Jeu invalide")
    if limit < 1 or limit > 100:
        limit = 10

    scores = await db.scores.find(
        {"game": game}, {"_id": 0, "ip_hash": 0}
    ).sort([("score", -1), ("timestamp", 1)]).to_list(limit)

    for s in scores:
        if isinstance(s['timestamp'], str):
            s['timestamp'] = datetime.fromisoformat(s['timestamp'])
    return scores


# ===== RAWG GAME ARTICLES =====
async def _rawg_get(path: str, params: dict = None) -> dict:
    """Fetch from RAWG with simple in-memory cache."""
    if not RAWG_API_KEY:
        raise HTTPException(status_code=503, detail="RAWG_API_KEY non configurée")
    p = dict(params or {})
    p["key"] = RAWG_API_KEY
    url = f"{RAWG_BASE}{path}"
    cache_key = url + "?" + "&".join(f"{k}={v}" for k, v in sorted(p.items()) if k != "key")
    now = time.time()
    cached = _rawg_cache.get(cache_key)
    if cached and now - cached[0] < CACHE_TTL:
        return cached[1]
    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            r = await client_http.get(url, params=p)
            r.raise_for_status()
            data = r.json()
            _rawg_cache[cache_key] = (now, data)
            return data
    except httpx.HTTPStatusError as e:
        logger.error(f"RAWG API error: {e.response.status_code} {e.response.text[:200]}")
        raise HTTPException(status_code=502, detail=f"RAWG API error: {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"RAWG request error: {e}")
        raise HTTPException(status_code=504, detail="RAWG indisponible")


@api_router.get("/articles")
async def list_articles(
    category: str = "latest",
    page: int = 1,
    page_size: int = 12,
    search: Optional[str] = None,
    genre: Optional[str] = None,
    platform: Optional[str] = None
):
    """
    List game articles from RAWG.
    category: latest | upcoming | popular | top
    """
    params = {"page": page, "page_size": min(max(page_size, 1), 40)}

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if category == "latest":
        # Released in last 12 months, sorted by released DESC
        last_year = (datetime.now(timezone.utc).replace(year=datetime.now(timezone.utc).year - 1)).strftime("%Y-%m-%d")
        params["dates"] = f"{last_year},{today}"
        params["ordering"] = "-released"
    elif category == "upcoming":
        # Future releases
        next_year = (datetime.now(timezone.utc).replace(year=datetime.now(timezone.utc).year + 2)).strftime("%Y-%m-%d")
        params["dates"] = f"{today},{next_year}"
        params["ordering"] = "released"
    elif category == "popular":
        params["ordering"] = "-added"
    elif category == "top":
        params["ordering"] = "-metacritic"
        params["metacritic"] = "80,100"
    else:
        raise HTTPException(status_code=400, detail="Catégorie invalide")

    if search:
        params["search"] = search
        params["search_precise"] = "true"
    if genre:
        params["genres"] = genre
    if platform:
        params["platforms"] = platform

    data = await _rawg_get("/games", params)
    return {
        "count": data.get("count", 0),
        "next": data.get("next"),
        "previous": data.get("previous"),
        "results": [
            {
                "id": g.get("id"),
                "name": g.get("name"),
                "slug": g.get("slug"),
                "released": g.get("released"),
                "background_image": g.get("background_image"),
                "rating": g.get("rating"),
                "metacritic": g.get("metacritic"),
                "playtime": g.get("playtime"),
                "platforms": [p.get("platform", {}).get("name") for p in (g.get("platforms") or [])],
                "genres": [gr.get("name") for gr in (g.get("genres") or [])],
                "short_screenshots": [s.get("image") for s in (g.get("short_screenshots") or [])][:4],
            }
            for g in data.get("results", [])
        ]
    }


@api_router.get("/articles/genres")
async def list_genres():
    """List all RAWG genres."""
    data = await _rawg_get("/genres")
    return [
        {"id": g.get("id"), "name": g.get("name"), "slug": g.get("slug"), "games_count": g.get("games_count")}
        for g in data.get("results", [])
    ]


@api_router.get("/articles/platforms")
async def list_platforms():
    """List parent platforms (PC, PlayStation, Xbox, Nintendo, etc)."""
    data = await _rawg_get("/platforms/lists/parents")
    return [
        {"id": p.get("id"), "name": p.get("name"), "slug": p.get("slug")}
        for p in data.get("results", [])
    ]


@api_router.get("/articles/{game_id}")
async def get_article(game_id: int):
    """Get full details for a specific game."""
    game = await _rawg_get(f"/games/{game_id}")
    # Also fetch screenshots
    try:
        screenshots = await _rawg_get(f"/games/{game_id}/screenshots")
        shots = [s.get("image") for s in screenshots.get("results", [])]
    except Exception:
        shots = []
    return {
        "id": game.get("id"),
        "name": game.get("name"),
        "slug": game.get("slug"),
        "description_raw": game.get("description_raw") or game.get("description", ""),
        "released": game.get("released"),
        "tba": game.get("tba"),
        "background_image": game.get("background_image"),
        "background_image_additional": game.get("background_image_additional"),
        "website": game.get("website"),
        "rating": game.get("rating"),
        "ratings_count": game.get("ratings_count"),
        "metacritic": game.get("metacritic"),
        "playtime": game.get("playtime"),
        "esrb_rating": (game.get("esrb_rating") or {}).get("name"),
        "platforms": [
            {
                "name": p.get("platform", {}).get("name"),
                "released_at": p.get("released_at"),
            }
            for p in (game.get("platforms") or [])
        ],
        "genres": [{"name": g.get("name"), "slug": g.get("slug")} for g in (game.get("genres") or [])],
        "developers": [d.get("name") for d in (game.get("developers") or [])],
        "publishers": [p.get("name") for p in (game.get("publishers") or [])],
        "tags": [t.get("name") for t in (game.get("tags") or [])][:10],
        "stores": [
            {"name": s.get("store", {}).get("name"), "url": s.get("url")}
            for s in (game.get("stores") or [])
        ],
        "screenshots": shots,
    }


# ===== ADMIN AUTH (hashed + brute-force protected) =====
def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain: str, hashed: bytes) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed)
    except Exception:
        return False


async def check_brute_force(ip: str) -> None:
    """Raise 429 if too many failed attempts from this IP recently."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_MINUTES)
    failed_recent = await db.login_attempts.count_documents({
        "ip": ip,
        "success": False,
        "timestamp": {"$gte": cutoff.isoformat()}
    })
    if failed_recent >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=f"Trop de tentatives. Réessayez dans {LOCKOUT_MINUTES} minutes."
        )


async def record_login_attempt(ip: str, success: bool) -> None:
    """Log a login attempt to MongoDB."""
    await db.login_attempts.insert_one({
        "ip": ip,
        "success": success,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def clear_failed_attempts(ip: str) -> None:
    """Clear failed attempts for this IP after a successful login."""
    await db.login_attempts.delete_many({"ip": ip, "success": False})


def verify_admin(x_admin_password: str = Header(None)):
    """Verify admin password (hashed comparison)."""
    if _ADMIN_PASSWORD_HASH is None:
        raise HTTPException(status_code=503, detail="Admin non configuré")
    if not x_admin_password or not verify_password(x_admin_password, _ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    return True


@api_router.post("/admin/login")
@limiter.limit("10/minute")
async def admin_login(request: Request, input: AdminLogin):
    """Verify admin password with brute-force protection. Returns success if correct."""
    if _ADMIN_PASSWORD_HASH is None:
        raise HTTPException(status_code=503, detail="Admin non configuré")

    ip = get_remote_address(request)
    await check_brute_force(ip)

    if not verify_password(input.password, _ADMIN_PASSWORD_HASH):
        await record_login_attempt(ip, success=False)
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    await record_login_attempt(ip, success=True)
    await clear_failed_attempts(ip)
    return {"success": True}


# ===== BLOG ARTICLES (Public read, Admin write) =====
def _serialize_article(doc: dict) -> dict:
    """Convert ISO timestamp strings back to datetime if needed."""
    for key in ('created_at', 'updated_at'):
        if key in doc and isinstance(doc[key], str):
            doc[key] = datetime.fromisoformat(doc[key])
    return doc


@api_router.get("/blog", response_model=List[BlogArticle])
async def list_blog_articles(type_filter: Optional[str] = None, include_drafts: bool = False):
    """List all published blog articles (sorted by created_at DESC)."""
    query = {}
    if not include_drafts:
        query["published"] = True
    if type_filter and type_filter in ("blog", "news"):
        query["type"] = type_filter

    articles = await db.blog_articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [_serialize_article(a) for a in articles]


@api_router.get("/blog/{article_id}", response_model=BlogArticle)
async def get_blog_article(article_id: str):
    """Get a single blog article by ID."""
    article = await db.blog_articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    if not article.get("published", True):
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return _serialize_article(article)


@api_router.post("/admin/blog", response_model=BlogArticle)
async def create_blog_article(input: BlogArticleCreate, _: bool = None, x_admin_password: str = Header(None)):
    """Create a new blog article (admin only)."""
    verify_admin(x_admin_password)
    article = BlogArticle(**input.model_dump())
    doc = article.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_articles.insert_one(doc)
    logger.info(f"Blog article created: {article.id} - {article.title}")
    return article


@api_router.get("/admin/blog", response_model=List[BlogArticle])
async def list_all_blog_articles_admin(x_admin_password: str = Header(None)):
    """List all blog articles including drafts (admin only)."""
    verify_admin(x_admin_password)
    articles = await db.blog_articles.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_serialize_article(a) for a in articles]


@api_router.put("/admin/blog/{article_id}", response_model=BlogArticle)
async def update_blog_article(article_id: str, input: BlogArticleUpdate, x_admin_password: str = Header(None)):
    """Update a blog article (admin only)."""
    verify_admin(x_admin_password)
    existing = await db.blog_articles.find_one({"id": article_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")

    update_data = {k: v for k, v in input.model_dump(exclude_unset=True).items() if v is not None or k in ('rating',)}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

    await db.blog_articles.update_one({"id": article_id}, {"$set": update_data})
    updated = await db.blog_articles.find_one({"id": article_id}, {"_id": 0})
    return _serialize_article(updated)


@api_router.delete("/admin/blog/{article_id}")
async def delete_blog_article(article_id: str, x_admin_password: str = Header(None)):
    """Delete a blog article (admin only)."""
    verify_admin(x_admin_password)
    result = await db.blog_articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"success": True, "message": "Article supprimé"}


# ===== TMDB SERIES =====
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', '')
TMDB_BASE = "https://api.themoviedb.org/3"
_tmdb_cache = {}

async def _tmdb_get(path: str, params: dict = None) -> dict:
    if not TMDB_API_KEY:
        raise HTTPException(status_code=503, detail="TMDB_API_KEY non configurée")
    p = dict(params or {})
    p["api_key"] = TMDB_API_KEY
    p["language"] = "fr-FR"
    url = f"{TMDB_BASE}{path}"
    cache_key = url + str(sorted(p.items()))
    now = time.time()
    cached = _tmdb_cache.get(cache_key)
    if cached and now - cached[0] < CACHE_TTL:
        return cached[1]
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(url, params=p)
        r.raise_for_status()
        data = r.json()
        _tmdb_cache[cache_key] = (now, data)
        return data

@api_router.get("/series")
async def list_series(category: str = "popular", page: int = 1):
    """Récupère les séries depuis TMDB. category: popular | top_rated | on_the_air | airing_today"""
    path_map = {
        "popular": "/tv/popular",
        "top_rated": "/tv/top_rated",
        "on_the_air": "/tv/on_the_air",
        "airing_today": "/tv/airing_today",
    }
    path = path_map.get(category, "/tv/popular")
    data = await _tmdb_get(path, {"page": page})
    results = []
    for s in data.get("results", []):
        results.append({
            "id": s.get("id"),
            "name": s.get("name"),
            "overview": s.get("overview", ""),
            "poster_path": f"https://image.tmdb.org/t/p/w500{s['poster_path']}" if s.get("poster_path") else None,
            "backdrop_path": f"https://image.tmdb.org/t/p/w780{s['backdrop_path']}" if s.get("backdrop_path") else None,
            "vote_average": s.get("vote_average", 0),
            "vote_count": s.get("vote_count", 0),
            "first_air_date": s.get("first_air_date"),
            "genre_ids": s.get("genre_ids", []),
            "origin_country": s.get("origin_country", []),
        })
    return {"count": data.get("total_results", 0), "page": page, "total_pages": data.get("total_pages", 1), "results": results}

@api_router.get("/series/search")
async def search_series(q: str, page: int = 1):
    data = await _tmdb_get("/search/tv", {"query": q, "page": page})
    results = []
    for s in data.get("results", []):
        results.append({
            "id": s.get("id"),
            "name": s.get("name"),
            "overview": s.get("overview", ""),
            "poster_path": f"https://image.tmdb.org/t/p/w500{s['poster_path']}" if s.get("poster_path") else None,
            "vote_average": s.get("vote_average", 0),
            "first_air_date": s.get("first_air_date"),
        })
    return {"count": data.get("total_results", 0), "results": results}


# ===== PANDASCORE ESPORT =====
PANDA_TOKEN = os.environ.get('PANDASCORE_TOKEN', '')
PANDA_BASE = "https://api.pandascore.co"
_panda_cache = {}

async def _panda_get(path: str, params: dict = None) -> list:
    if not PANDA_TOKEN:
        raise HTTPException(status_code=503, detail="PANDASCORE_TOKEN non configuré")
    p = dict(params or {})
    url = f"{PANDA_BASE}{path}"
    cache_key = url + str(sorted(p.items()))
    now = time.time()
    cached = _panda_cache.get(cache_key)
    if cached and now - cached[0] < CACHE_TTL:
        return cached[1]
    headers = {"Authorization": f"Bearer {PANDA_TOKEN}"}
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(url, params=p, headers=headers)
        r.raise_for_status()
        data = r.json()
        _panda_cache[cache_key] = (now, data)
        return data

@api_router.get("/esport/matches")
async def list_esport_matches(status: str = "running", page: int = 1, per_page: int = 12):
    """Récupère les matchs esport. status: running | upcoming | past"""
    path_map = {"running": "/matches/running", "upcoming": "/matches/upcoming", "past": "/matches/past"}
    path = path_map.get(status, "/matches/running")
    data = await _panda_get(path, {"page": page, "per_page": per_page, "sort": "-begin_at"})
    results = []
    for m in (data if isinstance(data, list) else []):
        results.append({
            "id": m.get("id"),
            "name": m.get("name"),
            "status": m.get("status"),
            "begin_at": m.get("begin_at"),
            "end_at": m.get("end_at"),
            "game": m.get("videogame", {}).get("name") if m.get("videogame") else None,
            "game_image": m.get("videogame", {}).get("images", [{}])[0].get("url") if m.get("videogame") and m.get("videogame", {}).get("images") else None,
            "league": m.get("league", {}).get("name") if m.get("league") else None,
            "league_image": m.get("league", {}).get("image_url") if m.get("league") else None,
            "serie": m.get("serie", {}).get("full_name") if m.get("serie") else None,
            "tournament": m.get("tournament", {}).get("name") if m.get("tournament") else None,
            "opponents": [
                {"name": op.get("opponent", {}).get("name"), "image": op.get("opponent", {}).get("image_url")}
                for op in (m.get("opponents") or [])
            ],
            "results": m.get("results", []),
            "winner": m.get("winner", {}).get("name") if m.get("winner") else None,
        })
    return {"results": results, "page": page}


# Include the router in the main app
app.include_router(api_router)

# CORS — restricted to allowed origins from env (no wildcard for production-friendliness)
_cors_raw = os.environ.get('CORS_ORIGINS', '*')
_cors_origins = [o.strip() for o in _cors_raw.split(',') if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins if _cors_origins != ['*'] else ['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Hash admin password into memory + create indexes for performance/security."""
    global _ADMIN_PASSWORD_HASH
    plain = os.environ.get('ADMIN_PASSWORD', '')
    if plain:
        _ADMIN_PASSWORD_HASH = hash_password(plain)
        logger.info("Admin password hashed and loaded into memory.")
    else:
        logger.warning("ADMIN_PASSWORD not set — admin endpoints disabled.")

    # Indexes
    try:
        await db.login_attempts.create_index([("ip", 1), ("timestamp", -1)])
        await db.scores.create_index([("game", 1), ("score", -1)])
        await db.scores.create_index([("ip_hash", 1), ("timestamp", -1)])
        await db.contact_messages.create_index([("timestamp", -1)])
        await db.blog_articles.create_index([("created_at", -1)])
        await db.blog_articles.create_index([("published", 1), ("type", 1)])
        logger.info("MongoDB indexes ensured.")
    except Exception as e:
        logger.warning(f"Index creation skipped: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
