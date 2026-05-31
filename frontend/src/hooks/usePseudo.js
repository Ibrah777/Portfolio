import { useState, useEffect } from 'react';

export function usePseudo() {
  const [pseudo, setPseudoState] = useState(() => localStorage.getItem('player_pseudo') || '');

  const setPseudo = (value) => {
    const clean = value.trim().slice(0, 20);
    setPseudoState(clean);
    if (clean) localStorage.setItem('player_pseudo', clean);
  };

  return [pseudo, setPseudo];
}
