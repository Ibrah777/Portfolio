import React, { useState } from 'react';
import axios from 'axios';
import { portfolioData } from '../mock';
import { Mail, MapPin, Linkedin, Github, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Mail className="w-7 h-7 text-salmon-500" />
            <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
          </div>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-5 h-5 text-salmon-500" />
                  <a href={`mailto:${portfolioData.profile.email}`} className="hover:text-salmon-500 transition-colors">
                    {portfolioData.profile.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-salmon-500" />
                  <span>{portfolioData.profile.location}</span>
                </div>
                {portfolioData.profile.linkedin && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Linkedin className="w-5 h-5 text-salmon-500" />
                    <a href={portfolioData.profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-salmon-500 transition-colors">
                      LinkedIn — El Hadj Ibrahima Dione
                    </a>
                  </div>
                )}
                {portfolioData.profile.github && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Github className="w-5 h-5 text-salmon-500" />
                    <a href={portfolioData.profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-salmon-500 transition-colors">
                      GitHub — LejteH0P
                    </a>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                  <Input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    required placeholder="Votre nom" className="focus:border-salmon-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    required placeholder="votre@email.com" className="focus:border-salmon-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <Textarea name="message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                    required placeholder="Votre message..." rows={5} className="focus:border-salmon-500" />
                </div>
                <Button type="submit" className="w-full bg-salmon-500 hover:bg-salmon-600 text-white" disabled={submitting || submitted}>
                  {submitted ? <><CheckCircle className="w-5 h-5 mr-2" /> Message envoyé !</>
                   : submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Envoi...</>
                   : <><Send className="w-5 h-5 mr-2" /> Envoyer</>}
                </Button>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
