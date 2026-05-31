import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Lock, Plus, Edit, Trash2, Save, X, Eye, EyeOff,
  Loader2, FileText, Newspaper, LogOut, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAdminAuth } from '../hooks/useAdminAuth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function LoginScreen({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/admin/login`, { password });
      onSuccess(password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-slate-400 hover:text-salmon-400 text-sm mb-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au portfolio
        </Link>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-salmon-400 to-coral-500 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Gestion des articles persos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="bg-slate-800 border-slate-700 text-white pr-10 focus:border-salmon-500"
                  data-testid="admin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1" data-testid="admin-login-error">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !password}
              size="lg"
              className="w-full bg-salmon-500 hover:bg-salmon-600 text-white"
              data-testid="admin-login-btn"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connexion...</> : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ArticleForm({ article, password, onSaved, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    image_url: article?.image_url || '',
    type: article?.type || 'blog',
    tags: (article?.tags || []).join(', '),
    rating: article?.rating ?? '',
    youtube_url: article?.youtube_url || '',
    published: article?.published ?? true
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      rating: form.rating === '' ? null : parseFloat(form.rating)
    };
    try {
      if (article) {
        await axios.put(`${API}/admin/blog/${article.id}`, payload, {
          headers: { 'X-Admin-Password': password }
        });
      } else {
        await axios.post(`${API}/admin/blog`, payload, {
          headers: { 'X-Admin-Password': password }
        });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{article ? 'Modifier' : 'Nouvel article'}</h2>
        <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Titre *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={200}
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
            data-testid="article-title-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Résumé court * (max 500 car.)</label>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            required
            maxLength={500}
            rows={2}
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
            data-testid="article-excerpt-input"
          />
          <p className="text-xs text-slate-500 mt-1">{form.excerpt.length}/500</p>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Contenu complet *</label>
          <Textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={10}
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500 font-mono text-sm"
            data-testid="article-content-input"
          />
          <p className="text-xs text-slate-500 mt-1">Astuce: Séparez les paragraphes avec une ligne vide.</p>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-salmon-500"
            data-testid="article-type-select"
          >
            <option value="blog">Blog (avis perso, coups de cœur)</option>
            <option value="news">News (actualité)</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Note /10 (optionnel)</label>
          <Input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            placeholder="ex: 8.5"
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
            data-testid="article-rating-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Image URL (couverture)</label>
          <Input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
            data-testid="article-image-input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Lien YouTube (optionnel)</label>
          <Input
            value={form.youtube_url}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400 block mb-1">Tags (séparés par des virgules)</label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="GTA 6, Rockstar, Open World"
            className="bg-slate-800 border-slate-700 text-white focus:border-salmon-500"
            data-testid="article-tags-input"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 accent-salmon-500"
          />
          <label htmlFor="published" className="text-sm text-slate-300">
            Publier (sinon brouillon)
          </label>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-700 text-white bg-transparent hover:bg-slate-800">
          Annuler
        </Button>
        <Button type="submit" disabled={saving} className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="article-save-btn">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
        </Button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { password, login, logout, isAuthenticated } = useAdminAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | article object
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState('');

  const fetchArticles = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/blog`, {
        headers: { 'X-Admin-Password': password }
      });
      setArticles(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchArticles();
  }, [isAuthenticated]);

  const handleSaved = () => {
    setEditing(null);
    setToast('Article enregistré !');
    setTimeout(() => setToast(''), 3000);
    fetchArticles();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/admin/blog/${id}`, {
        headers: { 'X-Admin-Password': password }
      });
      setConfirmDelete(null);
      setToast('Article supprimé');
      setTimeout(() => setToast(''), 3000);
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 backdrop-blur-md sticky top-0 z-10 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-slate-400 hover:text-salmon-400 inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Portfolio
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-salmon-400" /> Admin
          </h1>
          <Button onClick={logout} variant="ghost" className="text-slate-400 hover:text-white" data-testid="admin-logout-btn">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2" data-testid="admin-toast">
            <CheckCircle className="w-4 h-4" /> {toast}
          </div>
        )}

        {editing === 'new' && (
          <ArticleForm password={password} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        )}

        {editing && editing !== 'new' && (
          <ArticleForm article={editing} password={password} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        )}

        {!editing && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Mes articles</h2>
                <p className="text-slate-400 text-sm mt-1">{articles.length} article(s) au total</p>
              </div>
              <Button onClick={() => setEditing('new')} className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="admin-new-article-btn">
                <Plus className="w-4 h-4 mr-2" /> Nouvel article
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement...
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Aucun article pour le moment</p>
                <Button onClick={() => setEditing('new')} className="bg-salmon-500 hover:bg-salmon-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Créer le premier
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {articles.map(article => (
                  <div
                    key={article.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-salmon-500/50 transition-colors"
                    data-testid={`admin-article-${article.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {article.image_url && (
                        <img src={article.image_url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={article.type === 'news' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-salmon-500/20 text-salmon-300 border-salmon-500/40'}>
                            {article.type === 'news' ? <><Newspaper className="w-3 h-3 mr-1" /> News</> : <><FileText className="w-3 h-3 mr-1" /> Blog</>}
                          </Badge>
                          {!article.published && (
                            <Badge variant="outline" className="border-slate-600 text-slate-400">Brouillon</Badge>
                          )}
                          {article.rating !== null && article.rating !== undefined && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                              {article.rating}/10
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold mb-1 truncate">{article.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{article.excerpt}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Créé le {new Date(article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => setEditing(article)}
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-white bg-transparent hover:bg-slate-800"
                          data-testid={`admin-edit-${article.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setConfirmDelete(article)}
                          size="sm"
                          variant="outline"
                          className="border-red-900 text-red-400 bg-transparent hover:bg-red-900/30"
                          data-testid={`admin-delete-${article.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-2">Supprimer cet article ?</h3>
              <p className="text-slate-400 mb-4">"<span className="text-white">{confirmDelete.title}</span>" sera supprimé définitivement.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setConfirmDelete(null)} className="border-slate-700 text-white bg-transparent hover:bg-slate-800">
                  Annuler
                </Button>
                <Button onClick={() => handleDelete(confirmDelete.id)} className="bg-red-500 hover:bg-red-600 text-white" data-testid="admin-confirm-delete-btn">
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
