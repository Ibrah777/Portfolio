import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { portfolioData } from '../mock';
import {
  Briefcase, Code, Database, Wrench, Heart, Joystick,
  Gamepad2, Lock, Swords, Globe, ShoppingCart, Box, Calendar,
  ExternalLink, Github, ChevronDown, ChevronUp, CheckCircle2, Newspaper
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const iconMap = {
  gamepad: Gamepad2, box: Box, lock: Lock, swords: Swords,
  globe: Globe, 'shopping-cart': ShoppingCart, briefcase: Briefcase,
  wrench: Wrench, calendar: Calendar, newspaper: Newspaper
};

const statusColors = {
  'Terminé': 'bg-green-100 text-green-700',
  'En cours': 'bg-salmon-100 text-salmon-700',
  'À venir': 'bg-slate-100 text-slate-500',
};

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[project.icon] || Wrench;
  const isDark = project.color?.includes('slate-7') || project.color?.includes('slate-9');

  const inner = (
    <Card className={`h-full transition-all duration-300 hover:-translate-y-1 ${
      project.github || project.internalLink
        ? 'hover:shadow-xl cursor-pointer border-2 hover:border-salmon-300'
        : 'border hover:shadow-md'
    }`}>
      <div className={`w-full h-36 bg-gradient-to-br ${project.color || 'from-salmon-100 to-orange-100'} rounded-t-xl flex items-center justify-center relative`}>
        <Icon className={`w-14 h-14 ${project.iconColor || 'text-salmon-500'}`} />
        {project.github && (
          <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5">
            <Github className="w-4 h-4 text-slate-700" />
          </div>
        )}
        {project.internalLink && (
          <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
          <Badge className={`shrink-0 text-xs ${statusColors[project.status] || 'bg-slate-100 text-slate-600'}`}>
            {project.status}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-snug">{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-slate-400 font-mono">{project.tech}</p>

        {project.github && (
          <p className="text-xs text-salmon-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Voir sur GitHub
          </p>
        )}
        {project.internalLink && (
          <p className="text-xs text-salmon-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Voir les news gaming
          </p>
        )}
        {!project.github && !project.internalLink && project.status === 'En cours' && (
          <p className="text-xs text-slate-400 italic">Dépôt bientôt disponible</p>
        )}

        {project.competences && (
          <div>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-1"
            >
              {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Compétences mobilisées
            </button>
            {open && (
              <ul className="mt-2 space-y-1">
                {project.competences.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (project.github) return <a href={project.github} target="_blank" rel="noopener noreferrer">{inner}</a>;
  if (project.internalLink) return <Link to={project.internalLink}>{inner}</Link>;
  return <div>{inner}</div>;
}

export default function Projets() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-7 h-7 text-salmon-500" />
            <h1 className="text-3xl font-bold text-slate-900">Projets & Réalisations</h1>
          </div>
          <p className="text-slate-500 mb-10 text-sm">
            Cliquez sur une carte pour accéder au dépôt GitHub ou au projet. Chaque carte précise les compétences du bloc B1 mobilisées.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {portfolioData.projects.map((project, idx) => (
              <ProjectCard key={idx} project={project} />
            ))}
          </div>

          {/* Compétences */}
          <div className="flex items-center gap-3 mb-3">
            <Code className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl font-bold text-slate-900">Compétences</h2>
          </div>
          <p className="text-slate-500 text-sm mb-8">Compétences en cours d'acquisition — BTS SIO SLAM, 1ère année.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {[
              { icon: Code, title: "Langages (en cours d'acquisition)", skills: portfolioData.skills.programming },
              { icon: Database, title: 'Bases de données', skills: portfolioData.skills.databases },
              { icon: Wrench, title: 'Outils & méthodes', skills: portfolioData.skills.tools },
              { icon: Heart, title: 'Savoir-être', skills: portfolioData.skills.softSkills },
              { icon: Gamepad2, title: 'Pratique personnelle', skills: portfolioData.skills.personal },
            ].map(({ icon: Icon, title, skills }) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="w-5 h-5 text-salmon-500" /> {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="bg-salmon-50 text-salmon-700">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mini-jeux */}
          <div className="flex items-center gap-3 mb-4">
            <Joystick className="w-7 h-7 text-salmon-400" />
            <h2 className="text-3xl font-bold text-slate-900">Mini-Jeux</h2>
          </div>
          <p className="text-slate-600 mb-10">Démos de mes compétences en développement de jeux web.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { to: '/games/snake', title: 'Snake', desc: 'Le classique revisité', tech: 'Canvas · JavaScript' },
              { to: '/games/tetris', title: 'Tetris', desc: 'Puzzle avec niveaux progressifs', tech: 'Canvas · JavaScript' },
              { to: '/games/platformer', title: 'Plateformer', desc: 'Saute, collecte, atteins le drapeau', tech: 'Canvas · Physics 2D' },
            ].map(({ to, title, desc, tech }) => (
              <Link key={to} to={to}>
                <Card className="bg-slate-800 border-slate-700 hover:border-salmon-400 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <div className="w-full h-28 bg-gradient-to-br from-salmon-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <Joystick className="w-12 h-12 text-salmon-400" />
                    </div>
                    <CardTitle className="text-white">{title}</CardTitle>
                    <CardDescription className="text-slate-400">{desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-salmon-400 font-mono">{tech}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
