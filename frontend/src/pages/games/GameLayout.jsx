import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function GameLayout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" data-testid="back-to-portfolio">
            <Button variant="ghost" className="text-white hover:bg-slate-800 hover:text-salmon-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au portfolio
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-salmon-400">{title}</h1>
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        {description && (
          <p className="text-center text-slate-300 mb-8 max-w-2xl mx-auto">{description}</p>
        )}
        {children}
      </main>
    </div>
  );
}
