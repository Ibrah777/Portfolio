import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { User, Play } from 'lucide-react';
import { usePseudo } from '../../hooks/usePseudo';

export default function PseudoScreen({ gameName, onStart }) {
  const [pseudo, setPseudo] = usePseudo();
  const [draft, setDraft] = useState(pseudo);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = draft.trim();
    if (clean.length < 2) {
      setError('Au moins 2 caractères');
      return;
    }
    if (clean.length > 20) {
      setError('Maximum 20 caractères');
      return;
    }
    setPseudo(clean);
    onStart(clean);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-salmon-400 to-coral-500 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Entre ton pseudo</h2>
        <p className="text-slate-400 text-sm">Pour apparaître dans le classement {gameName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setError(''); }}
            placeholder="TonPseudo"
            maxLength={20}
            autoFocus
            className="bg-slate-900 border-slate-700 text-white text-center text-lg placeholder:text-slate-500 focus:border-salmon-500"
            data-testid="pseudo-input"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center" data-testid="pseudo-error">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-salmon-500 hover:bg-salmon-600 text-white"
          data-testid="pseudo-start-btn"
        >
          <Play className="w-4 h-4 mr-2" /> Lancer la partie
        </Button>
      </form>
    </div>
  );
}
