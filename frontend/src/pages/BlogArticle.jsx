import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Calendar, Tag, Star, ExternalLink, Loader2, FileText, Newspaper, Youtube
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export default function BlogArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/blog/${id}`)
      .then(res => setArticle(res.data))
      .catch(err => setError(err.response?.status === 404 ? 'Article introuvable' : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-salmon-400" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/news')} className="bg-salmon-500 hover:bg-salmon-600 text-white">
            Retour aux articles
          </Button>
        </div>
      </div>
    );
  }

  const ytId = getYoutubeId(article.youtube_url);
  const paragraphs = article.content.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      {article.image_url ? (
        <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30"></div>
          <header className="absolute top-0 left-0 right-0 backdrop-blur-md bg-slate-950/40 border-b border-slate-800/40">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link to="/news?tab=blog">
                <Button variant="ghost" className="text-white hover:bg-slate-800/60 hover:text-salmon-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-slate-800/60">
                  Portfolio
                </Button>
              </Link>
            </div>
          </header>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={article.type === 'news' ? 'bg-blue-500/80 text-white' : 'bg-salmon-500/80 text-white'}>
                  {article.type === 'news' ? <><Newspaper className="w-3 h-3 mr-1" /> News</> : <><FileText className="w-3 h-3 mr-1" /> Blog</>}
                </Badge>
                {article.rating !== null && article.rating !== undefined && (
                  <Badge className="bg-yellow-500 text-slate-900 font-bold">
                    <Star className="w-3 h-3 mr-1 fill-current" /> {article.rating}/10
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3" data-testid="blog-title">{article.title}</h1>
              <p className="text-slate-300 text-lg">{article.excerpt}</p>
              <p className="text-slate-400 text-sm mt-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {formatDate(article.created_at)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header className="border-b border-slate-800 backdrop-blur-md sticky top-0 z-10 bg-slate-950/80">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link to="/news?tab=blog">
                <Button variant="ghost" className="text-white hover:bg-slate-800 hover:text-salmon-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>
              </Link>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-6 pt-12">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={article.type === 'news' ? 'bg-blue-500/80 text-white' : 'bg-salmon-500/80 text-white'}>
                {article.type === 'news' ? 'News' : 'Blog'}
              </Badge>
              {article.rating !== null && article.rating !== undefined && (
                <Badge className="bg-yellow-500 text-slate-900 font-bold">
                  <Star className="w-3 h-3 mr-1 fill-current" /> {article.rating}/10
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3" data-testid="blog-title">{article.title}</h1>
            <p className="text-slate-300 text-lg mb-2">{article.excerpt}</p>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatDate(article.created_at)}
            </p>
          </div>
        </>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert max-w-none" data-testid="blog-content">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-300 leading-relaxed text-lg mb-6 whitespace-pre-wrap">{p}</p>
          ))}
        </article>

        {ytId && (
          <div className="mt-8 aspect-video rounded-xl overflow-hidden border border-slate-800">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              data-testid="blog-youtube-embed"
            />
          </div>
        )}

        {article.tags?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t, i) => (
                <Badge key={i} variant="outline" className="border-salmon-500/40 text-salmon-300">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
