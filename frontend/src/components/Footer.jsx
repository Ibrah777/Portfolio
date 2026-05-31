import React from 'react';
import { portfolioData } from '../mock';
import { Mail, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="text-white py-10 px-6 mt-auto" style={{background:"#F472B6"}}>
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg font-semibold mb-1">
          {portfolioData.profile.firstName} {portfolioData.profile.lastName}
        </p>
        <p className="text-white/80 mb-4 text-sm">{portfolioData.profile.title}</p>
        <div className="flex justify-center gap-5 mb-4">
          <a href={`mailto:${portfolioData.profile.email}`} className="hover:text-salmon-400 transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          {portfolioData.profile.linkedin && (
            <a href={portfolioData.profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-salmon-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {portfolioData.profile.github && (
            <a href={portfolioData.profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-salmon-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>
        <p className="text-white/70 text-xs">© 2026 {portfolioData.profile.firstName} {portfolioData.profile.lastName}</p>
      </div>
    </footer>
  );
}
