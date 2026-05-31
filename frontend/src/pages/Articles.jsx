import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Search, Star, Calendar, Gamepad2, TrendingUp,
  Loader2, ChevronLeft, ChevronRight, Tv, Swords, Filter, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── JEUX ─────────────────────────────────────────────────────────────────────
const GAME_CATS = [
  { key: 'latest',   label: 'Sorties récentes', icon: Calendar },
  { key: 'upcoming', label: 'À venir',           icon: TrendingUp },
  { key: 'popular',  label: 'Populaires',        icon: Gamepad2 },
  { key: 'top',      label: 'Top notés',         icon: Star },
];

// ── SÉRIES ────────────────────────────────────────────────────────────────────
const SERIES_CATS = [
  { key: 'popular',      label: 'Populaires',   icon: Star },
  { key: 'top_rated',    label: 'Top notés',    icon: TrendingUp },
  { key: 'on_the_air',   label: 'En cours',     icon: Tv },
  { key: 'airing_today', label: "Aujourd'hui",  icon: Calendar },
];

// ── ESPORT ────────────────────────────────────────────────────────────────────
const ESPORT_CATS = [
  { key: 'running',  label: 'En direct',    icon: Swords },
  { key: 'upcoming', label: 'À venir',      icon: Calendar },
  { key: 'past',     label: 'Terminés',     icon: TrendingUp },
];

function fmt(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}

// ── CARD JEUX ─────────────────────────────────────────────────────────────────
function GameCard({ game, onClick }) {
  return (
    <Card onClick={onClick}
      className="bg-slate-800/50 border-slate-700 hover:border-salmon-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        {game.background_image
          ? <img src={game.background_image} alt={game.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-12 h-12 text-slate-700" /></div>
        }
        {game.metacritic && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${game.metacritic >= 80 ? 'bg-green-500/90 text-white' : game.metacritic >= 60 ? 'bg-yellow-500/90 text-slate-900' : 'bg-red-500/90 text-white'}`}>
            {game.metacritic}
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-white line-clamp-1 group-hover:text-salmon-400 transition-colors">{game.name}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {game.released && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(game.released)}</span>}
          {game.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{game.rating.toFixed(1)}</span>}
        </div>
        {game.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((g, i) => (
              <Badge key={i} variant="outline" className="border-slate-700 text-slate-400 text-xs px-2 py-0">{g}</Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── CARD SÉRIES ───────────────────────────────────────────────────────────────
function SerieCard({ serie }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        {serie.poster_path
          ? <img src={serie.poster_path} alt={serie.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Tv className="w-12 h-12 text-slate-700" /></div>
        }
        {serie.vote_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-purple-600/90 text-white">
            {serie.vote_average.toFixed(1)}/10
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">{serie.name}</h3>
        {serie.first_air_date && (
          <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(serie.first_air_date)}</p>
        )}
        {serie.overview && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{serie.overview}</p>}
      </div>
    </Card>
  );
}

// ── CARD ESPORT ───────────────────────────────────────────────────────────────
function EsportCard({ match }) {
  const op1 = match.opponents?.[0];
  const op2 = match.opponents?.[1];
  const isLive = match.status === 'running';

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-400 transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {match.game_image && <img src={match.game_image} alt={match.game} className="w-5 h-5 rounded object-cover" />}
            <span className="text-xs text-slate-400 font-medium">{match.game}</span>
          </div>
          {isLive
            ? <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
            : <span className="text-xs text-slate-500">{fmt(match.begin_at)}</span>
          }
        </div>
        <div className="flex items-center justify-between gap-2 my-4">
          <div className="flex-1 text-center">
            {op1?.image && <img src={op1.image} alt={op1.name} className="w-10 h-10 object-contain mx-auto mb-1" />}
            <p className="text-sm font-bold text-white line-clamp-1">{op1?.name || '?'}</p>
          </div>
          <div className="text-center px-2">
            <span className="text-slate-500 font-bold text-lg">VS</span>
            {isLive && match.results?.length === 2 && (
              <p className="text-xs text-cyan-400 font-bold mt-1">
                {match.results[0]?.score ?? 0} — {match.results[1]?.score ?? 0}
              </p>
            )}
          </div>
          <div className="flex-1 text-center">
            {op2?.image && <img src={op2.image} alt={op2.name} className="w-10 h-10 object-contain mx-auto mb-1" />}
            <p className="text-sm font-bold text-white line-clamp-1">{op2?.name || '?'}</p>
          </div>
        </div>
        {(match.league || match.tournament) && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
            {match.league_image && <img src={match.league_image} alt={match.league} className="w-4 h-4 object-contain" />}
            <span className="text-xs text-slate-400 line-clamp-1">{match.league}{match.tournament ? ` — ${match.tournament}` : ''}</span>
          </div>
        )}
        {match.winner && (
          <p className="text-xs text-green-400 mt-2 font-medium">Vainqueur : {match.winner}</p>
        )}
      </div>
    </Card>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────────────────────
export default function Articles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'games');

  // Games state
  const [gameCat, setGameCat] = useState('latest');
  const [gameSearch, setGameSearch] = useState('');
  const [gameSearchInput, setGameSearchInput] = useState('');
  const [gamePage, setGamePage] = useState(1);
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesCount, setGamesCount] = useState(0);
  const [gamesHasNext, setGamesHasNext] = useState(false);
  const [gamesError, setGamesError] = useState('');

  // Series state
  const [serieCat, setSerieCat] = useState('popular');
  const [serieSearch, setSerieSearch] = useState('');
  const [serieSearchInput, setSerieSearchInput] = useState('');
  const [seriePage, setSeriePage] = useState(1);
  const [series, setSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesCount, setSeriesCount] = useState(0);
  const [seriesTotalPages, setSeriesTotalPages] = useState(1);
  const [seriesError, setSeriesError] = useState('');

  // Esport state
  const [esportCat, setEsportCat] = useState('running');
  const [esportPage, setEsportPage] = useState(1);
  const [matches, setMatches] = useState([]);
  const [esportLoading, setEsportLoading] = useState(false);
  const [esportError, setEsportError] = useState('');

  // ── FETCH GAMES ─────────────────────────────────────────────────────────────
  const fetchGames = useCallback(async () => {
    if (tab !== 'games') return;
    setGamesLoading(true); setGamesError('');
    try {
      const params = new URLSearchParams({ category: gameCat, page: gamePage.toString(), page_size: '12' });
      if (gameSearch) params.set('search', gameSearch);
      const res = await axios.get(`${API}/articles?${params}`);
      setGames(res.data.results);
      setGamesCount(res.data.count);
      setGamesHasNext(!!res.data.next);
    } catch { setGamesError('Impossible de charger les jeux.'); }
    finally { setGamesLoading(false); }
  }, [tab, gameCat, gamePage, gameSearch]);

  // ── FETCH SERIES ─────────────────────────────────────────────────────────────
  const fetchSeries = useCallback(async () => {
    if (tab !== 'series') return;
    setSeriesLoading(true); setSeriesError('');
    try {
      let res;
      if (serieSearch) {
        res = await axios.get(`${API}/series/search?q=${encodeURIComponent(serieSearch)}&page=${seriePage}`);
        setSeries(res.data.results); setSeriesCount(res.data.count); setSeriesTotalPages(Math.ceil(res.data.count / 20));
      } else {
        res = await axios.get(`${API}/series?category=${serieCat}&page=${seriePage}`);
        setSeries(res.data.results); setSeriesCount(res.data.count); setSeriesTotalPages(res.data.total_pages);
      }
    } catch { setSeriesError('Impossible de charger les séries. Vérifiez la clé TMDB.'); }
    finally { setSeriesLoading(false); }
  }, [tab, serieCat, seriePage, serieSearch]);

  // ── FETCH ESPORT ─────────────────────────────────────────────────────────────
  const fetchEsport = useCallback(async () => {
    if (tab !== 'esport') return;
    setEsportLoading(true); setEsportError('');
    try {
      const res = await axios.get(`${API}/esport/matches?status=${esportCat}&page=${esportPage}&per_page=12`);
      setMatches(res.data.results);
    } catch { setEsportError('Impossible de charger les matchs esport. Vérifiez le token PandaScore.'); }
    finally { setEsportLoading(false); }
  }, [tab, esportCat, esportPage]);

  useEffect(() => { fetchGames(); }, [fetchGames]);
  useEffect(() => { fetchSeries(); }, [fetchSeries]);
  useEffect(() => { fetchEsport(); }, [fetchEsport]);

  const changeTab = (t) => { setTab(t); setSearchParams({ tab: t }); };

  const tabStyle = (t) => `px-5 py-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
    tab === t ? 'border-salmon-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/"><Button variant="ghost" className="text-white hover:bg-slate-800 hover:text-salmon-400"><ArrowLeft className="w-4 h-4 mr-2" />Portfolio</Button></Link>
          <h1 className="text-xl font-bold text-salmon-400 flex-1 text-center">News Hub</h1>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-slate-800/50">
          <button className={tabStyle('games')} onClick={() => changeTab('games')}>
            <Gamepad2 className="w-4 h-4" /> Jeux vidéo
          </button>
          <button className={tabStyle('series')} onClick={() => changeTab('series')}>
            <Tv className="w-4 h-4" /> Séries
          </button>
          <button className={tabStyle('esport')} onClick={() => changeTab('esport')}>
            <Swords className="w-4 h-4" /> Esport
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ══ ONGLET JEUX ══════════════════════════════════════════════════════ */}
        {tab === 'games' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2"><span className="text-salmon-400">News</span> Jeux Vidéo</h2>
              <p className="text-slate-400 text-sm">Données fournies par RAWG.io</p>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); setGameSearch(gameSearchInput); setGamePage(1); }}
              className="max-w-xl mx-auto mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input value={gameSearchInput} onChange={e => setGameSearchInput(e.target.value)}
                  placeholder="Rechercher un jeu..." className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500" />
              </div>
              <Button type="submit" className="bg-salmon-500 hover:bg-salmon-600 text-white">Rechercher</Button>
              {gameSearch && <Button type="button" variant="ghost" onClick={() => { setGameSearch(''); setGameSearchInput(''); }} className="text-slate-400"><X className="w-4 h-4" /></Button>}
            </form>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {GAME_CATS.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button key={cat.key} onClick={() => { setGameCat(cat.key); setGamePage(1); }}
                    variant={gameCat === cat.key ? 'default' : 'outline'}
                    className={gameCat === cat.key ? 'bg-salmon-500 hover:bg-salmon-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'}>
                    <Icon className="w-4 h-4 mr-2" />{cat.label}
                  </Button>
                );
              })}
            </div>

            {!gamesLoading && !gamesError && <p className="text-center text-sm text-slate-400 mb-6">{gamesCount.toLocaleString('fr-FR')} jeux</p>}

            {gamesLoading ? <Loading /> : gamesError ? <Err msg={gamesError} retry={fetchGames} /> : games.length === 0 ? <Empty msg="Aucun jeu trouvé." /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map(g => <GameCard key={g.id} game={g} onClick={() => navigate(`/news/${g.id}`)} />)}
              </div>
            )}

            <Pagination page={gamePage} hasNext={gamesHasNext} hasPrev={gamePage > 1}
              onPrev={() => setGamePage(p => p - 1)} onNext={() => setGamePage(p => p + 1)} loading={gamesLoading} />

            <p className="text-center text-xs text-slate-500 mt-10">Données : <a href="https://rawg.io" target="_blank" rel="noopener noreferrer" className="text-salmon-400 hover:underline">RAWG.io</a></p>
          </>
        )}

        {/* ══ ONGLET SÉRIES ════════════════════════════════════════════════════ */}
        {tab === 'series' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2"><span className="text-purple-400">Séries</span> TV & Streaming</h2>
              <p className="text-slate-400 text-sm">Netflix, Amazon Prime, Disney+... Données fournies par TMDB</p>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); setSerieSearch(serieSearchInput); setSeriePage(1); }}
              className="max-w-xl mx-auto mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input value={serieSearchInput} onChange={e => setSerieSearchInput(e.target.value)}
                  placeholder="Rechercher une série..." className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500" />
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Rechercher</Button>
              {serieSearch && <Button type="button" variant="ghost" onClick={() => { setSerieSearch(''); setSerieSearchInput(''); }} className="text-slate-400"><X className="w-4 h-4" /></Button>}
            </form>

            {/* Categories */}
            {!serieSearch && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {SERIES_CATS.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <Button key={cat.key} onClick={() => { setSerieCat(cat.key); setSeriePage(1); }}
                      variant={serieCat === cat.key ? 'default' : 'outline'}
                      className={serieCat === cat.key ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'}>
                      <Icon className="w-4 h-4 mr-2" />{cat.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {!seriesLoading && !seriesError && <p className="text-center text-sm text-slate-400 mb-6">{seriesCount.toLocaleString('fr-FR')} séries</p>}

            {seriesLoading ? <Loading color="purple" /> : seriesError ? <Err msg={seriesError} retry={fetchSeries} /> : series.length === 0 ? <Empty msg="Aucune série trouvée." /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {series.map(s => <SerieCard key={s.id} serie={s} />)}
              </div>
            )}

            <Pagination page={seriePage} hasNext={seriePage < seriesTotalPages} hasPrev={seriePage > 1}
              onPrev={() => setSeriePage(p => p - 1)} onNext={() => setSeriePage(p => p + 1)} loading={seriesLoading} color="purple" />

            <p className="text-center text-xs text-slate-500 mt-10">Données : <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">TMDB</a></p>
          </>
        )}

        {/* ══ ONGLET ESPORT ════════════════════════════════════════════════════ */}
        {tab === 'esport' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2"><span className="text-cyan-400">Esport</span> — Matchs</h2>
              <p className="text-slate-400 text-sm">LoL, CS2, Dota2, Valorant... Données fournies par PandaScore</p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {ESPORT_CATS.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button key={cat.key} onClick={() => { setEsportCat(cat.key); setEsportPage(1); }}
                    variant={esportCat === cat.key ? 'default' : 'outline'}
                    className={esportCat === cat.key ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'}>
                    <Icon className="w-4 h-4 mr-2" />{cat.label}
                    {cat.key === 'running' && <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>}
                  </Button>
                );
              })}
            </div>

            {esportLoading ? <Loading color="cyan" /> : esportError ? <Err msg={esportError} retry={fetchEsport} /> : matches.length === 0 ? <Empty msg="Aucun match pour le moment." /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {matches.map(m => <EsportCard key={m.id} match={m} />)}
              </div>
            )}

            <Pagination page={esportPage} hasNext={matches.length >= 12} hasPrev={esportPage > 1}
              onPrev={() => setEsportPage(p => p - 1)} onNext={() => setEsportPage(p => p + 1)} loading={esportLoading} color="cyan" />

            <p className="text-center text-xs text-slate-500 mt-10">Données : <a href="https://pandascore.co" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">PandaScore</a></p>
          </>
        )}

      </main>
    </div>
  );
}

// ── COMPOSANTS UTILITAIRES ────────────────────────────────────────────────────
function Loading({ color = 'salmon' }) {
  const c = { salmon: 'text-salmon-400', purple: 'text-purple-400', cyan: 'text-cyan-400' }[color];
  return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className={`w-6 h-6 animate-spin mr-3 ${c}`} /> Chargement...</div>;
}

function Err({ msg, retry }) {
  return (
    <div className="text-center py-20">
      <p className="text-red-400 mb-4">{msg}</p>
      <Button onClick={retry} className="bg-salmon-500 hover:bg-salmon-600 text-white">Réessayer</Button>
    </div>
  );
}

function Empty({ msg }) {
  return <div className="text-center py-20 text-slate-400"><p>{msg}</p></div>;
}

function Pagination({ page, hasNext, hasPrev, onPrev, onNext, loading, color = 'salmon' }) {
  if (!hasNext && !hasPrev) return null;
  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <Button onClick={onPrev} disabled={!hasPrev || loading} variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent disabled:opacity-30">
        <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
      </Button>
      <span className="text-slate-400 font-mono text-sm">Page {page}</span>
      <Button onClick={onNext} disabled={!hasNext || loading} variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent disabled:opacity-30">
        Suivant <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
