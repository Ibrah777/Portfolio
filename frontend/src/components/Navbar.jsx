import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portfolioData } from '../mock';
import { Github, Linkedin, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/parcours', label: 'Parcours' },
  { to: '/projets', label: 'Projets' },
  { to: '/veille', label: 'Veille' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50" style={{background:"#F472B6"}}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold text-slate-900 hover:text-salmon-500 transition-colors">
          {portfolioData.profile.firstName} {portfolioData.profile.lastName}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-salmon-500 border-b-2 border-salmon-400 pb-0.5'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Social icons */}
        <div className="hidden md:flex items-center gap-3">
          {portfolioData.profile.github && (
            <a href={portfolioData.profile.github} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          )}
          {portfolioData.profile.linkedin && (
            <a href={portfolioData.profile.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden text-slate-700" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#F472B6] border-t border-pink-300 px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`text-sm font-medium ${location.pathname === to ? 'text-salmon-500' : 'text-slate-700'}`}>
              {label}
            </Link>
          ))}
          <div className="flex gap-4 pt-2">
            {portfolioData.profile.github && (
              <a href={portfolioData.profile.github} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5 text-slate-600" /></a>
            )}
            {portfolioData.profile.linkedin && (
              <a href={portfolioData.profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5 text-slate-600" /></a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
