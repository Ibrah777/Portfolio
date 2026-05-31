import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Star, Calendar, Clock, ExternalLink, Loader2, Newspaper,
  Award, Users, Tag as TagIcon, ShoppingCart
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatDate(iso) {
  if (!iso) return 'Date inconnue';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeShot, setActiveShot] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`${API}/articles/${id}`)
      .then(res => setGame(res.data))
      .catch(err => {
        console.error(err);
        setError('Impossible de charger ce jeu.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-salmon-400" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Jeu introuvable'}</p>
          <Button onClick={() => navigate('/news')} className="bg-salmon-500 hover:bg-salmon-600 text-white">
            Retour aux news
          </Button>
        </div>
      </div>
    );
  }

  const allShots = [game.background_image, ...(game.screenshots || []).filter(s => s !== game.background_image)].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero with background image */}
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
        {game.background_image && (
          <img
            src={allShots[activeShot] || game.background_image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>

        {/* Top bar */}
        <header className="absolute top-0 left-0 right-0 backdrop-blur-md bg-slate-950/40 border-b border-slate-800/40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/news" data-testid="back-to-articles">
              <Button variant="ghost" className="text-white hover:bg-slate-800/60 hover:text-salmon-400">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux news
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-slate-800/60">
                <Newspaper className="w-4 h-4 mr-2" /> Portfolio
              </Button>
            </Link>
          </div>
        </header>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {game.metacritic && (
                <div className={`px-3 py-1 rounded font-bold ${
                  game.metacritic >= 80 ? 'bg-green-500 text-white' :
                  game.metacritic >= 60 ? 'bg-yellow-500 text-slate-900' :
                  'bg-red-500 text-white'
                }`}>
                  Metacritic {game.metacritic}
                </div>
              )}
              {game.esrb_rating && (
                <Badge variant="outline" className="border-slate-500 text-white bg-slate-900/50">
                  {game.esrb_rating}
                </Badge>
              )}
              {game.genres?.map((g, i) => (
                <Badge key={i} className="bg-salmon-500/80 hover:bg-salmon-500 text-white">
                  {g.name}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-3" data-testid="article-title">{game.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-salmon-400" />
                {game.tba ? 'TBA' : formatDate(game.released)}
              </span>
              {game.rating > 0 && (
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {game.rating.toFixed(1)} / 5 ({game.ratings_count?.toLocaleString('fr-FR') || 0} votes)
                </span>
              )}
              {game.playtime > 0 && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-salmon-400" />
                  {game.playtime}h
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Screenshots thumbnails */}
            {allShots.length > 1 && (
              <section>
                <h2 className="text-xl font-bold mb-4 text-salmon-400">Captures d'écran</h2>
                <div className="grid grid-cols-4 gap-2">
                  {allShots.slice(0, 8).map((shot, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveShot(i)}
                      className={`relative aspect-video rounded overflow-hidden border-2 transition-all ${
                        activeShot === i ? 'border-salmon-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      data-testid={`screenshot-${i}`}
                    >
                      <img src={shot} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            {game.description_raw && (
              <section>
                <h2 className="text-xl font-bold mb-4 text-salmon-400">À propos</h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap" data-testid="article-description">
                  {game.description_raw}
                </div>
              </section>
            )}

            {/* Tags */}
            {game.tags?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 text-salmon-400 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((t, i) => (
                    <Badge key={i} variant="outline" className="border-slate-700 text-slate-400">
                      {t}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Platforms */}
            {game.platforms?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm uppercase tracking-wider text-salmon-400 mb-3">Plateformes</h3>
                <div className="space-y-2">
                  {game.platforms.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white">{p.name}</span>
                      {p.released_at && (
                        <span className="text-slate-500 text-xs">{formatDate(p.released_at)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Devs / Publishers */}
            {(game.developers?.length > 0 || game.publishers?.length > 0) && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                {game.developers?.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-salmon-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Développeurs
                    </h3>
                    <ul className="space-y-1 text-sm text-white">
                      {game.developers.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {game.publishers?.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-salmon-400 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Éditeurs
                    </h3>
                    <ul className="space-y-1 text-sm text-white">
                      {game.publishers.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Stores */}
            {game.stores?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm uppercase tracking-wider text-salmon-400 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Où acheter
                </h3>
                <div className="space-y-2">
                  {game.stores.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-white hover:text-salmon-400 transition-colors group"
                    >
                      <span>{s.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Official website */}
            {game.website && (
              <a href={game.website} target="_blank" rel="noopener noreferrer" data-testid="article-website-link">
                <Button className="w-full bg-salmon-500 hover:bg-salmon-600 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" /> Site officiel
                </Button>
              </a>
            )}
          </aside>
        </div>

        <p className="text-center text-xs text-slate-500 mt-16">
          Données fournies par <a href="https://rawg.io" target="_blank" rel="noopener noreferrer" className="text-salmon-400 hover:underline">RAWG.io</a>
        </p>
      </main>
    </div>
  );
}
