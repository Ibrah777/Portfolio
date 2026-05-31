import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const rankIcon = (idx) => {
  if (idx === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (idx === 1) return <Medal className="w-5 h-5 text-slate-300" />;
  if (idx === 2) return <Award className="w-5 h-5 text-orange-400" />;
  return <span className="text-slate-500 font-mono w-5 text-center">{idx + 1}</span>;
};

export default function Leaderboard({ game, currentPseudo, refreshKey }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get(`${API}/scores/${game}?limit=10`)
      .then(res => { if (!cancelled) setScores(res.data); })
      .catch(err => console.error('Leaderboard error:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [game, refreshKey]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-auto" data-testid="leaderboard">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-salmon-400" />
        <h3 className="text-lg font-bold text-white">Top 10 mondial</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : scores.length === 0 ? (
        <p className="text-slate-400 text-center py-8 text-sm">Aucun score encore. Sois le premier !</p>
      ) : (
        <ol className="space-y-2">
          {scores.map((s, i) => {
            const isMe = currentPseudo && s.pseudo === currentPseudo;
            return (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
                  isMe ? 'bg-salmon-500/20 border border-salmon-500/50' : 'bg-slate-900/40'
                }`}
                data-testid={`leaderboard-row-${i}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {rankIcon(i)}
                  <span className={`font-medium truncate ${isMe ? 'text-salmon-300' : 'text-white'}`}>
                    {s.pseudo}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-salmon-400 font-mono">{s.score.toLocaleString()}</p>
                  {s.level > 1 && (
                    <p className="text-xs text-slate-500">Niv. {s.level}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
