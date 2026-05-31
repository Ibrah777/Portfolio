import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import GameLayout from './GameLayout';
import { Button } from '../../components/ui/button';
import { Play, RotateCcw, Trophy, Pause, User } from 'lucide-react';
import PseudoScreen from '../../components/game/PseudoScreen';
import Leaderboard from '../../components/game/Leaderboard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLS = 10;
const ROWS = 20;
const CELL = 26;

const SHAPES = {
  I: { c: '#7dd3fc', shape: [[1, 1, 1, 1]] },
  O: { c: '#fde047', shape: [[1, 1], [1, 1]] },
  T: { c: '#c084fc', shape: [[0, 1, 0], [1, 1, 1]] },
  S: { c: '#86efac', shape: [[0, 1, 1], [1, 1, 0]] },
  Z: { c: '#fca5a5', shape: [[1, 1, 0], [0, 1, 1]] },
  L: { c: '#fdba74', shape: [[1, 0], [1, 0], [1, 1]] },
  J: { c: '#93c5fd', shape: [[0, 1], [0, 1], [1, 1]] }
};
const KEYS = Object.keys(SHAPES);

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const randomPiece = () => {
  const k = KEYS[Math.floor(Math.random() * KEYS.length)];
  return { type: k, shape: SHAPES[k].shape.map(r => [...r]), color: SHAPES[k].c, x: 3, y: 0 };
};

const rotate = (m) => {
  const N = m.length;
  const M = m[0].length;
  const r = Array.from({ length: M }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) r[j][N - 1 - i] = m[i][j];
  return r;
};

const collides = (board, piece, dx = 0, dy = 0, shape = piece.shape) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = piece.x + x + dx;
      const ny = piece.y + y + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
};

export default function Tetris() {
  const canvasRef = useRef(null);
  const [pseudo, setPseudo] = useState('');
  const [phase, setPhase] = useState('pseudo'); // pseudo | ready | playing | paused | gameOver
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tetris_high') || '0'));
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const stateRef = useRef({
    board: createBoard(),
    piece: randomPiece(),
    next: randomPiece(),
    dropMs: 800
  });

  const submitScore = useCallback(async (finalScore, finalLevel) => {
    if (finalScore <= 0) return;
    try {
      await axios.post(`${API}/scores`, {
        game: 'tetris',
        pseudo: pseudo || 'Anonyme',
        score: finalScore,
        level: finalLevel
      });
      setLeaderboardKey(k => k + 1);
    } catch (err) {
      console.error('Submit score error:', err);
    }
  }, [pseudo]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(COLS * CELL, i * CELL);
      ctx.stroke();
    }

    // Board
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (s.board[y][x]) {
          ctx.fillStyle = s.board[y][x];
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // Piece
    s.piece.shape.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v) {
          ctx.fillStyle = s.piece.color;
          ctx.fillRect((s.piece.x + x) * CELL + 1, (s.piece.y + y) * CELL + 1, CELL - 2, CELL - 2);
        }
      });
    });
  }, []);

  const lockPiece = useCallback(() => {
    const s = stateRef.current;
    s.piece.shape.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v && s.piece.y + y >= 0) {
          s.board[s.piece.y + y][s.piece.x + x] = s.piece.color;
        }
      });
    });

    // Clear lines
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (s.board[y].every(c => c)) {
        s.board.splice(y, 1);
        s.board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][cleared] * level;
      setScore(prev => {
        const newScore = prev + pts;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('tetris_high', newScore.toString());
        }
        return newScore;
      });
      setLines(prev => {
        const nl = prev + cleared;
        const newLevel = Math.floor(nl / 10) + 1;
        if (newLevel !== level) {
          setLevel(newLevel);
          s.dropMs = Math.max(100, 800 - (newLevel - 1) * 70);
        }
        return nl;
      });
    }

    // New piece
    s.piece = s.next;
    s.next = randomPiece();
    if (collides(s.board, s.piece)) {
      setPhase('gameOver');
      setScore(prev => { submitScore(prev, level); return prev; });
    }
  }, [level, highScore, submitScore]);

  const drop = useCallback(() => {
    const s = stateRef.current;
    if (!collides(s.board, s.piece, 0, 1)) {
      s.piece.y++;
    } else {
      lockPiece();
    }
    draw();
  }, [draw, lockPiece]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(drop, stateRef.current.dropMs);
    return () => clearInterval(interval);
  }, [phase, drop, level]);

  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== 'playing') return;
      const s = stateRef.current;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' && !collides(s.board, s.piece, -1, 0)) s.piece.x--;
      if (e.key === 'ArrowRight' && !collides(s.board, s.piece, 1, 0)) s.piece.x++;
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') {
        const rotated = rotate(s.piece.shape);
        if (!collides(s.board, s.piece, 0, 0, rotated)) s.piece.shape = rotated;
      }
      if (e.key === ' ') {
        while (!collides(s.board, s.piece, 0, 1)) s.piece.y++;
        lockPiece();
      }
      draw();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, drop, draw, lockPiece]);

  useEffect(() => { draw(); }, [draw]);

  const handlePseudoStart = (p) => {
    setPseudo(p);
    setPhase('ready');
  };

  const startGame = () => {
    stateRef.current = {
      board: createBoard(),
      piece: randomPiece(),
      next: randomPiece(),
      dropMs: 800
    };
    setScore(0);
    setLines(0);
    setLevel(1);
    setPhase('playing');
  };

  if (phase === 'pseudo') {
    return (
      <GameLayout title="Tetris" description="Empile, complète des lignes, bats les records.">
        <div className="flex flex-col items-center gap-8">
          <PseudoScreen gameName="Tetris" onStart={handlePseudoStart} />
          <Leaderboard game="tetris" currentPseudo={pseudo} refreshKey={leaderboardKey} />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Tetris" description="Empile et complète des lignes. Flèches pour bouger, ↑ pour tourner, espace pour chute rapide.">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="space-y-3 md:order-2 md:min-w-[180px]">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 text-salmon-400" />
                <span className="text-sm font-medium text-white" data-testid="player-pseudo">{pseudo}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPhase('pseudo')} className="h-6 px-2 text-xs text-slate-400 hover:text-white">
                Changer pseudo
              </Button>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Score</p>
              <p className="text-2xl font-bold text-salmon-400" data-testid="tetris-score">{score}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Niveau</p>
              <p className="text-xl font-bold text-white">{level}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Lignes</p>
              <p className="text-xl font-bold text-white">{lines}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Record local
              </p>
              <p className="text-xl font-bold text-white">{highScore}</p>
            </div>
          </div>

          <div className="relative md:order-1">
            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              className="border-2 border-salmon-500/50 rounded-lg shadow-2xl shadow-salmon-500/20"
              data-testid="tetris-canvas"
            />
            {phase !== 'playing' && phase !== 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  {phase === 'gameOver' && (
                    <>
                      <p className="text-2xl font-bold text-salmon-400 mb-2">Game Over !</p>
                      <p className="text-slate-300 mb-4">Score : <span className="font-bold text-white">{score}</span></p>
                    </>
                  )}
                  <Button onClick={startGame} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="tetris-start-btn">
                    {phase === 'gameOver' ? <><RotateCcw className="w-4 h-4 mr-2" /> Rejouer</> : <><Play className="w-4 h-4 mr-2" /> Démarrer</>}
                  </Button>
                </div>
              </div>
            )}
            {phase === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg backdrop-blur-sm">
                <Button onClick={() => setPhase('playing')} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white">
                  <Play className="w-4 h-4 mr-2" /> Reprendre
                </Button>
              </div>
            )}
            {phase === 'playing' && (
              <Button
                onClick={() => setPhase('paused')}
                className="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700 text-white"
                size="sm"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[320px]">
          <Leaderboard game="tetris" currentPseudo={pseudo} refreshKey={leaderboardKey} />
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm mt-8">
        <p>Contrôles : <kbd className="px-2 py-1 bg-slate-800 rounded">←→</kbd> bouger · <kbd className="px-2 py-1 bg-slate-800 rounded">↑</kbd> tourner · <kbd className="px-2 py-1 bg-slate-800 rounded">↓</kbd> descendre · <kbd className="px-2 py-1 bg-slate-800 rounded">Espace</kbd> chute</p>
      </div>
    </GameLayout>
  );
}
