import React from 'react';
import { portfolioData } from '../mock';
import { Calendar, GraduationCap, Target, Map } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const iconMap = { gamepad: null, box: null, sparkles: null };

export default function Parcours() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Timeline */}
          <div className="flex items-center gap-3 mb-10">
            <Calendar className="w-7 h-7 text-salmon-500" />
            <h1 className="text-3xl font-bold text-slate-900">Parcours</h1>
          </div>
          <div className="space-y-0 mb-20">
            {portfolioData.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-salmon-500 group-hover:scale-125 transition-transform mt-1 flex-shrink-0" />
                  {idx < portfolioData.timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-salmon-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm text-salmon-600 font-semibold mb-1">{item.period}</p>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                  {item.description && <p className="text-slate-600 mb-1">{item.description}</p>}
                  <p className="text-sm text-slate-400">{item.location}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formation */}
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl font-bold text-slate-900">Formation actuelle</h2>
          </div>
          <Card className="border-2 border-salmon-200 shadow-md mb-20">
            <CardHeader>
              <CardTitle className="text-2xl text-salmon-600">{portfolioData.formation.title}</CardTitle>
              <CardDescription className="text-base">{portfolioData.formation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-slate-900 mb-3">Cette option couvre notamment :</p>
              <ul className="space-y-2 mb-6">
                {portfolioData.formation.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-salmon-500 mt-1">•</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <p className="text-slate-600 italic bg-salmon-50 p-4 rounded-lg">{portfolioData.formation.note}</p>
            </CardContent>
          </Card>

          {/* Métiers visés */}
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl font-bold text-slate-900">Métiers visés</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {portfolioData.careers.map((career, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-salmon-400">
                <CardHeader>
                  <CardTitle className="text-xl">{career.title}</CardTitle>
                  <CardDescription className="text-salmon-600 font-medium">{career.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed">{career.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cartes heuristiques */}
          <div className="flex items-center gap-3 mb-8">
            <Map className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl font-bold text-slate-900">Cartes heuristiques</h2>
          </div>
          <p className="text-slate-600 mb-6 text-sm">Cartes mentales interactives explorant les compétences, outils et débouchés de chaque métier visé. Réalisées dans le cadre de ma veille professionnelle.</p>
          <div className="grid md:grid-cols-3 gap-5 mb-4">
            {/* Carte 1 - Jeu Vidéo */}
            <div className="bg-gradient-to-br from-orange-950 to-slate-900 border border-orange-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="w-12 h-12 bg-orange-900/50 rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Développeur Jeu Vidéo</h3>
                <p className="text-orange-300/70 text-xs leading-relaxed">Langages, moteurs, missions, formations et débouchés du game developer.</p>
              </div>
              <a href="/carte-heuristique.html" className="mt-auto">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm">
                  <Map className="w-3.5 h-3.5 mr-2" /> Voir la carte
                </Button>
              </a>
            </div>

            {/* Carte 2 - Animateur 3D */}
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Animateur 3D</h3>
                <p className="text-blue-300/70 text-xs leading-relaxed">Logiciels, types d'animation, secteurs et écoles du métier d'animateur 3D.</p>
              </div>
              <a href="/carte-heuristique-3d.html" className="mt-auto">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm">
                  <Map className="w-3.5 h-3.5 mr-2" /> Voir la carte
                </Button>
              </a>
            </div>

            {/* Carte 3 - Dev Web */}
            <div className="bg-gradient-to-br from-green-950 to-slate-900 border border-green-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Développeur Web Full-Stack</h3>
                <p className="text-green-300/70 text-xs leading-relaxed">Front-end, back-end, BDD, déploiement et bonnes pratiques du dev web.</p>
              </div>
              <a href="/carte-heuristique-web.html" className="mt-auto">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm">
                  <Map className="w-3.5 h-3.5 mr-2" /> Voir la carte
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
