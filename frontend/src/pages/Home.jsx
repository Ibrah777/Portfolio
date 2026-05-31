import React from 'react';
import { Link } from 'react-router-dom';
import { portfolioData } from '../mock';
import { MapPin, Heart, ArrowRight, FileText } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 flex-1">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-salmon-400 to-coral-500 flex items-center justify-center text-white text-5xl font-bold shadow-2xl flex-shrink-0">
            {portfolioData.profile.firstName.charAt(0)}{portfolioData.profile.lastName.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-3 leading-tight">
              {portfolioData.profile.firstName}<br/>
              <span className="text-salmon-500">{portfolioData.profile.lastName}</span>
            </h1>
            <p className="text-2xl text-slate-600 mb-1">{portfolioData.profile.title}</p>
            <p className="text-xl text-slate-500 mb-6">{portfolioData.profile.subtitle}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
              <Badge className="bg-salmon-100 text-salmon-700 px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-2" /> {portfolioData.profile.location}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 px-4 py-2 text-sm">BTS SIO SLAM</Badge>
              <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm">Recherche de stage</Badge>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/contact">
                <Button className="bg-salmon-500 hover:bg-salmon-600 text-white px-6">
                  Me contacter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {portfolioData.profile.cv && (
                <a href={portfolioData.profile.cv} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-salmon-300 text-salmon-600 hover:bg-salmon-50 px-6">
                    <FileText className="w-4 h-4 mr-2" /> Télécharger le CV
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl font-bold text-slate-900">Présentation</h2>
          </div>
          <div className="text-lg text-slate-700 leading-relaxed space-y-4">
            {portfolioData.about.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Quick links cards */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Explorer le portfolio</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { to: '/parcours', label: 'Parcours', desc: 'Mon historique et ma formation', color: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600' },
              { to: '/projets', label: 'Projets', desc: 'Réalisations et mini-jeux', color: 'from-salmon-50 to-salmon-100', border: 'border-salmon-200', text: 'text-salmon-600' },
              { to: '/veille', label: 'Veille', desc: 'Ma veille informationnelle', color: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-600' },
              { to: '/news', label: 'News Gaming', desc: 'Actualité jeux vidéo via RAWG', color: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-600' },
            ].map(({ to, label, desc, color, border, text }) => (
              <Link key={to} to={to}
                className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
                <h3 className={`font-bold text-lg ${text} mb-2`}>{label}</h3>
                <p className="text-slate-600 text-sm">{desc}</p>
                <ArrowRight className={`w-4 h-4 ${text} mt-4`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
