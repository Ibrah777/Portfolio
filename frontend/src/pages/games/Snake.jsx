import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import GameLayout from './GameLayout';
import { Button } from '../../components/ui/button';
import { Play, RotateCcw, Trophy, User } from 'lucide-react';
import PseudoScreen from '../../components/game/PseudoScreen';
import Leaderboard from '../../components/game/Leaderboard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GRID_SIZE = 20;
const CELL_SIZE = 22;
const INITIAL_SPEED = 130;

export default function Snake() {
  const canvasRef = useRef(null);
  const [pseudo, setPseudo] = useState('');
  const [phase, setPhase] = useState('pseudo'); // pseudo | ready | playing | gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake_high') || '0'));
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    speed: INITIAL_SPEED
  });

  const submitScore = useCallback(async (finalScore) => {
    if (finalScore <= 0) return;
    try {
      await axios.post(`${API}/scores`, {
        game: 'snake',
        pseudo: pseudo || 'Anonyme',
        score: finalScore
      });
      setLeaderboardKey(k => k + 1);
    } catch (err) {
      console.error('Submit score error:', err);
    }
  }, [pseudo]);

  const placeFood = useCallback(() => {
    const s = stateRef.current;
    let p;
    do {
      p = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (s.snake.some(seg => seg.x === p.x && seg.y === p.y));
    s.food = p;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // BG
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Food
    const fx = s.food.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = s.food.y * CELL_SIZE + CELL_SIZE / 2;
    const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, CELL_SIZE / 2);
    grad.addColorStop(0, '#ffb3a3');
    grad.addColorStop(1, '#fa8072');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    s.snake.forEach((seg, i) => {
      const t = i / s.snake.length;
      const r = Math.round(250 - t * 30);
      const g = Math.round(128 + t * 40);
      const b = Math.round(114 + t * 60);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    // Collisions
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setPhase('gameOver');
      setScore(prev => { submitScore(prev); return prev; });
      return;
    }
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setPhase('gameOver');
      setScore(prev => { submitScore(prev); return prev; });
      return;
    }

    s.snake.unshift(head);

    if (head.x === s.food.x && head.y === s.food.y) {
      setScore(prev => {
        const newScore = prev + 10;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snake_high', newScore.toString());
        }
        return newScore;
      });
      placeFood();
      s.speed = Math.max(60, s.speed - 3);
    } else {
      s.snake.pop();
    }

    draw();
  }, [draw, placeFood, highScore, submitScore]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(tick, stateRef.current.speed);
    return () => clearInterval(interval);
  }, [phase, tick, score]);

  useEffect(() => {
    const handleKey = (e) => {
      const s = stateRef.current;
      const k = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) {
        e.preventDefault();
      }
      if (k === 'ArrowUp' && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 };
      if (k === 'ArrowDown' && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 };
      if (k === 'ArrowLeft' && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 };
      if (k === 'ArrowRight' && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const handlePseudoStart = (p) => {
    setPseudo(p);
    setPhase('ready');
  };

  const startGame = () => {
    stateRef.current = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10 },
      speed: INITIAL_SPEED
    };
    placeFood();
    setScore(0);
    setPhase('playing');
  };

  if (phase === 'pseudo') {
    return (
      <GameLayout title="Snake" description="Mange les pommes, bats les records.">
        <div className="flex flex-col items-center gap-8">
          <PseudoScreen gameName="Snake" onStart={handlePseudoStart} />
          <Leaderboard game="snake" currentPseudo={pseudo} refreshKey={leaderboardKey} />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Snake" description="Mange les pommes saumon, évite les murs et ton propre corps. Utilise les flèches du clavier.">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        <div className="flex flex-col items-center gap-6 flex-1">
          <div className="flex gap-8 items-center bg-slate-800/30 px-6 py-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-salmon-400" />
              <span className="font-medium text-white" data-testid="player-pseudo">{pseudo}</span>
              <Button size="sm" variant="ghost" onClick={() => setPhase('pseudo')} className="h-6 px-2 text-xs text-slate-400 hover:text-white">
                Changer
              </Button>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-bold text-salmon-400" data-testid="snake-score">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase flex items-center gap-1 justify-center">
                <Trophy className="w-3 h-3" /> Local
              </p>
              <p className="text-2xl font-bold text-white">{highScore}</p>
            </div>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-2 border-salmon-500/50 rounded-lg shadow-2xl shadow-salmon-500/20"
              data-testid="snake-canvas"
            />
            {phase !== 'playing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  {phase === 'gameOver' && (
                    <>
                      <p className="text-2xl font-bold text-salmon-400 mb-2">Game Over !</p>
                      <p className="text-slate-300 mb-4">Score : <span className="font-bold text-white">{score}</span></p>
                    </>
                  )}
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-salmon-500 hover:bg-salmon-600 text-white"
                    data-testid="snake-start-btn"
                  >
                    {phase === 'gameOver' ? (
                      <><RotateCcw className="w-4 h-4 mr-2" /> Rejouer</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Démarrer</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-slate-400 text-sm">
            <p>Contrôles : <kbd className="px-2 py-1 bg-slate-800 rounded">↑</kbd> <kbd className="px-2 py-1 bg-slate-800 rounded">↓</kbd> <kbd className="px-2 py-1 bg-slate-800 rounded">←</kbd> <kbd className="px-2 py-1 bg-slate-800 rounded">→</kbd></p>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[320px]">
          <Leaderboard game="snake" currentPseudo={pseudo} refreshKey={leaderboardKey} />
        </div>
      </div>
    </GameLayout>
  );
}
