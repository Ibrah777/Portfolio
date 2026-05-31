import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import GameLayout from './GameLayout';
import { Button } from '../../components/ui/button';
import { Play, RotateCcw, Trophy, Award, ArrowRight, Flag, Heart, User } from 'lucide-react';
import PseudoScreen from '../../components/game/PseudoScreen';
import Leaderboard from '../../components/game/Leaderboard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const W = 800;
const H = 450;
const GRAVITY = 0.6;
const JUMP = 12;

// Helper: array of spike triangles drawn upward from a y baseline
const spikes = (x, y, count, size = 16) =>
  Array.from({ length: count }, (_, i) => ({ x: x + i * size, y: y - size, w: size, h: size }));

const LEVELS = [
  {
    name: "Niveau 1 - Tutoriel",
    description: "Premiers pas. Saute sur les plateformes.",
    speed: 4,
    platforms: [
      { x: 0, y: 420, w: 250, h: 30 },
      { x: 300, y: 380, w: 100, h: 20 },
      { x: 450, y: 320, w: 100, h: 20 },
      { x: 600, y: 270, w: 120, h: 20 },
      { x: 800, y: 320, w: 100, h: 20 },
      { x: 950, y: 380, w: 100, h: 20 },
      { x: 1100, y: 420, w: 300, h: 30 }
    ],
    coins: [
      { x: 340, y: 340 }, { x: 490, y: 280 }, { x: 640, y: 230 },
      { x: 840, y: 280 }, { x: 990, y: 340 }
    ],
    spikes: [],
    enemies: [],
    goal: { x: 1320, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 2 - Précision",
    description: "Sauts plus précis et premiers ennemis.",
    speed: 4,
    platforms: [
      { x: 0, y: 420, w: 200, h: 30 },
      { x: 280, y: 380, w: 80, h: 20 },
      { x: 430, y: 320, w: 80, h: 20 },
      { x: 580, y: 260, w: 80, h: 20 },
      { x: 740, y: 200, w: 80, h: 20 },
      { x: 900, y: 260, w: 100, h: 20 },
      { x: 1100, y: 320, w: 80, h: 20 },
      { x: 1250, y: 380, w: 200, h: 20 },
      { x: 1550, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 320, y: 340 }, { x: 470, y: 280 }, { x: 620, y: 220 },
      { x: 780, y: 160 }, { x: 940, y: 220 }, { x: 1140, y: 280 },
      { x: 1300, y: 340 }
    ],
    spikes: [],
    enemies: [
      { x: 700, y: 380, range: 100, speed: 1.5, dir: 1 }
    ],
    goal: { x: 1870, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 3 - Pièges",
    description: "Attention aux pics au sol !",
    speed: 4.5,
    platforms: [
      { x: 0, y: 420, w: 180, h: 30 },
      { x: 280, y: 420, w: 100, h: 30 },
      { x: 470, y: 360, w: 80, h: 20 },
      { x: 640, y: 300, w: 80, h: 20 },
      { x: 800, y: 240, w: 80, h: 20 },
      { x: 970, y: 320, w: 80, h: 20 },
      { x: 1130, y: 420, w: 120, h: 30 },
      { x: 1340, y: 360, w: 80, h: 20 },
      { x: 1500, y: 300, w: 80, h: 20 },
      { x: 1660, y: 240, w: 100, h: 20 },
      { x: 1820, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 320, y: 380 }, { x: 510, y: 320 }, { x: 680, y: 260 },
      { x: 830, y: 200 }, { x: 1010, y: 280 }, { x: 1170, y: 380 },
      { x: 1380, y: 320 }, { x: 1540, y: 260 }, { x: 1700, y: 200 }
    ],
    spikes: [
      ...spikes(190, 420, 5),  // gap entre plateformes
      ...spikes(1260, 420, 4)  // 2e zone de pics
    ],
    enemies: [
      { x: 1500, y: 270, range: 60, speed: 2, dir: 1 }
    ],
    goal: { x: 2150, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 4 - Plateformes mobiles",
    description: "Vitesse +. Ennemis qui patrouillent vite.",
    speed: 4.5,
    platforms: [
      { x: 0, y: 420, w: 150, h: 30 },
      { x: 250, y: 380, w: 70, h: 20 },
      { x: 400, y: 320, w: 70, h: 20 },
      { x: 550, y: 260, w: 70, h: 20 },
      { x: 700, y: 200, w: 70, h: 20 },
      { x: 850, y: 260, w: 80, h: 20 },
      { x: 1020, y: 320, w: 70, h: 20 },
      { x: 1170, y: 380, w: 80, h: 20 },
      { x: 1320, y: 320, w: 80, h: 20 },
      { x: 1480, y: 260, w: 80, h: 20 },
      { x: 1640, y: 200, w: 80, h: 20 },
      { x: 1800, y: 260, w: 100, h: 20 },
      { x: 1950, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 290, y: 340 }, { x: 440, y: 280 }, { x: 590, y: 220 },
      { x: 740, y: 160 }, { x: 890, y: 220 }, { x: 1060, y: 280 },
      { x: 1210, y: 340 }, { x: 1360, y: 280 }, { x: 1520, y: 220 },
      { x: 1680, y: 160 }, { x: 1840, y: 220 }
    ],
    spikes: [
      ...spikes(160, 420, 5),
      ...spikes(1900, 420, 3)
    ],
    enemies: [
      { x: 800, y: 230, range: 80, speed: 2.5, dir: 1 },
      { x: 1480, y: 230, range: 100, speed: 2.5, dir: -1 }
    ],
    goal: { x: 2280, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 5 - Marathon",
    description: "Long parcours, sauts millimétrés, pics partout.",
    speed: 5,
    platforms: [
      { x: 0, y: 420, w: 140, h: 30 },
      { x: 230, y: 380, w: 60, h: 20 },
      { x: 380, y: 320, w: 60, h: 20 },
      { x: 530, y: 260, w: 60, h: 20 },
      { x: 680, y: 200, w: 60, h: 20 },
      { x: 830, y: 260, w: 80, h: 20 },
      { x: 1000, y: 320, w: 60, h: 20 },
      { x: 1150, y: 250, w: 60, h: 20 },
      { x: 1300, y: 320, w: 60, h: 20 },
      { x: 1450, y: 380, w: 80, h: 20 },
      { x: 1620, y: 320, w: 70, h: 20 },
      { x: 1780, y: 250, w: 70, h: 20 },
      { x: 1940, y: 320, w: 80, h: 20 },
      { x: 2100, y: 380, w: 80, h: 20 },
      { x: 2260, y: 420, w: 80, h: 30 },
      { x: 2400, y: 360, w: 80, h: 20 },
      { x: 2550, y: 290, w: 80, h: 20 },
      { x: 2720, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 270, y: 340 }, { x: 420, y: 280 }, { x: 570, y: 220 },
      { x: 720, y: 160 }, { x: 870, y: 220 }, { x: 1040, y: 280 },
      { x: 1190, y: 210 }, { x: 1340, y: 280 }, { x: 1490, y: 340 },
      { x: 1660, y: 280 }, { x: 1820, y: 210 }, { x: 1980, y: 280 },
      { x: 2140, y: 340 }, { x: 2440, y: 320 }, { x: 2590, y: 250 }
    ],
    spikes: [
      ...spikes(150, 420, 5),
      ...spikes(2200, 420, 3),
      ...spikes(2490, 420, 3)
    ],
    enemies: [
      { x: 800, y: 230, range: 60, speed: 2.5, dir: 1 },
      { x: 1450, y: 350, range: 60, speed: 3, dir: 1 },
      { x: 1940, y: 290, range: 60, speed: 3, dir: -1 }
    ],
    goal: { x: 3050, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 6 - Couloirs étroits",
    description: "Vitesse +++. Ennemis rapides et pics nombreux.",
    speed: 5.5,
    platforms: [
      { x: 0, y: 420, w: 120, h: 30 },
      { x: 210, y: 380, w: 50, h: 20 },
      { x: 340, y: 320, w: 50, h: 20 },
      { x: 470, y: 260, w: 50, h: 20 },
      { x: 600, y: 200, w: 50, h: 20 },
      { x: 730, y: 260, w: 60, h: 20 },
      { x: 870, y: 320, w: 50, h: 20 },
      { x: 1010, y: 260, w: 50, h: 20 },
      { x: 1150, y: 200, w: 50, h: 20 },
      { x: 1290, y: 260, w: 50, h: 20 },
      { x: 1430, y: 320, w: 50, h: 20 },
      { x: 1570, y: 260, w: 60, h: 20 },
      { x: 1720, y: 320, w: 60, h: 20 },
      { x: 1870, y: 380, w: 60, h: 20 },
      { x: 2020, y: 320, w: 60, h: 20 },
      { x: 2170, y: 260, w: 60, h: 20 },
      { x: 2320, y: 320, w: 60, h: 20 },
      { x: 2470, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 250, y: 340 }, { x: 380, y: 280 }, { x: 510, y: 220 },
      { x: 640, y: 160 }, { x: 770, y: 220 }, { x: 910, y: 280 },
      { x: 1050, y: 220 }, { x: 1190, y: 160 }, { x: 1330, y: 220 },
      { x: 1470, y: 280 }, { x: 1610, y: 220 }, { x: 1760, y: 280 },
      { x: 1910, y: 340 }, { x: 2060, y: 280 }, { x: 2210, y: 220 },
      { x: 2360, y: 280 }
    ],
    spikes: [
      ...spikes(130, 420, 5),
      ...spikes(800, 360, 4),
      ...spikes(2380, 420, 4)
    ],
    enemies: [
      { x: 720, y: 230, range: 50, speed: 3, dir: 1 },
      { x: 1290, y: 230, range: 60, speed: 3.5, dir: 1 },
      { x: 1860, y: 350, range: 50, speed: 3.5, dir: 1 },
      { x: 2300, y: 290, range: 50, speed: 4, dir: -1 }
    ],
    goal: { x: 2800, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  },
  {
    name: "Niveau 7 - Boss Final",
    description: "Le défi ultime. Bonne chance !",
    speed: 6,
    platforms: [
      { x: 0, y: 420, w: 100, h: 30 },
      { x: 190, y: 360, w: 50, h: 20 },
      { x: 320, y: 290, w: 50, h: 20 },
      { x: 450, y: 220, w: 50, h: 20 },
      { x: 580, y: 280, w: 60, h: 20 },
      { x: 720, y: 360, w: 50, h: 20 },
      { x: 860, y: 280, w: 50, h: 20 },
      { x: 990, y: 200, w: 50, h: 20 },
      { x: 1120, y: 280, w: 60, h: 20 },
      { x: 1260, y: 360, w: 50, h: 20 },
      { x: 1400, y: 280, w: 50, h: 20 },
      { x: 1530, y: 200, w: 50, h: 20 },
      { x: 1660, y: 280, w: 60, h: 20 },
      { x: 1800, y: 200, w: 50, h: 20 },
      { x: 1930, y: 280, w: 50, h: 20 },
      { x: 2060, y: 360, w: 60, h: 20 },
      { x: 2200, y: 280, w: 50, h: 20 },
      { x: 2330, y: 200, w: 50, h: 20 },
      { x: 2460, y: 280, w: 60, h: 20 },
      { x: 2600, y: 360, w: 50, h: 20 },
      { x: 2730, y: 280, w: 50, h: 20 },
      { x: 2860, y: 420, w: 400, h: 30 }
    ],
    coins: [
      { x: 230, y: 320 }, { x: 360, y: 250 }, { x: 490, y: 180 },
      { x: 620, y: 240 }, { x: 760, y: 320 }, { x: 900, y: 240 },
      { x: 1030, y: 160 }, { x: 1160, y: 240 }, { x: 1300, y: 320 },
      { x: 1440, y: 240 }, { x: 1570, y: 160 }, { x: 1700, y: 240 },
      { x: 1840, y: 160 }, { x: 1970, y: 240 }, { x: 2100, y: 320 },
      { x: 2240, y: 240 }, { x: 2370, y: 160 }, { x: 2500, y: 240 },
      { x: 2640, y: 320 }, { x: 2770, y: 240 }
    ],
    spikes: [
      ...spikes(110, 420, 4),
      ...spikes(820, 420, 3),
      ...spikes(1370, 420, 3),
      ...spikes(2160, 420, 3),
      ...spikes(2680, 420, 3)
    ],
    enemies: [
      { x: 580, y: 250, range: 50, speed: 3.5, dir: 1 },
      { x: 1120, y: 250, range: 50, speed: 4, dir: 1 },
      { x: 1660, y: 250, range: 50, speed: 4, dir: -1 },
      { x: 2200, y: 250, range: 50, speed: 4.5, dir: 1 },
      { x: 2730, y: 250, range: 50, speed: 4.5, dir: -1 }
    ],
    goal: { x: 3190, y: 360, w: 30, h: 60 },
    start: { x: 50, y: 350 }
  }
];

const INITIAL_LIVES = 3;

export default function Platformer() {
  const canvasRef = useRef(null);
  const [pseudo, setPseudo] = useState('');
  const [phase, setPhase] = useState('pseudo'); // pseudo | ready | playing | dead | levelComplete | won | scoreSaved
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const stateRef = useRef({
    player: { x: 50, y: 350, vx: 0, vy: 0, w: 28, h: 36, onGround: false },
    keys: {},
    coins: [],
    enemies: [],
    spikes: [],
    camera: 0,
    level: null,
    speed: 4
  });

  const loadLevel = useCallback((idx) => {
    const lvl = LEVELS[idx];
    stateRef.current = {
      player: { x: lvl.start.x, y: lvl.start.y, vx: 0, vy: 0, w: 28, h: 36, onGround: false },
      keys: {},
      coins: lvl.coins.map(c => ({ ...c, taken: false })),
      enemies: lvl.enemies.map(e => ({ ...e, startX: e.x })),
      spikes: lvl.spikes,
      camera: 0,
      level: lvl,
      speed: lvl.speed
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    if (!s.level) return;
    const cam = s.camera;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1e293b');
    sky.addColorStop(1, '#475569');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137 - cam * 0.2) % (W + 200);
      const sy = (i * 53) % H;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Platforms
    s.level.platforms.forEach(p => {
      const grad = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      grad.addColorStop(0, '#fa8072');
      grad.addColorStop(1, '#c76856');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - cam, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(p.x - cam, p.y, p.w, 3);
    });

    // Spikes
    s.spikes.forEach(sp => {
      const sx = sp.x - cam;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(sx, sp.y + sp.h);
      ctx.lineTo(sx + sp.w / 2, sp.y);
      ctx.lineTo(sx + sp.w, sp.y + sp.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Coins
    s.coins.forEach(c => {
      if (c.taken) return;
      const cx = c.x - cam + 10;
      const cy = c.y + 10;
      const bob = Math.sin(Date.now() / 200 + c.x) * 3;
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, cy + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Enemies
    s.enemies.forEach(e => {
      const ex = e.x - cam;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(ex, e.y, 24, 24);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ex + 2, e.y + 2, 20, 20);
      ctx.fillStyle = '#fff';
      ctx.fillRect(ex + 6, e.y + 8, 4, 4);
      ctx.fillRect(ex + 14, e.y + 8, 4, 4);
      ctx.fillStyle = '#000';
      ctx.fillRect(ex + 7, e.y + 9, 2, 2);
      ctx.fillRect(ex + 15, e.y + 9, 2, 2);
    });

    // Goal flag
    const g = s.level.goal;
    if (g.x - cam < W + 100) {
      ctx.fillStyle = '#fff5f5';
      ctx.fillRect(g.x - cam, g.y, 4, g.h);
      ctx.fillStyle = '#fa8072';
      ctx.beginPath();
      ctx.moveTo(g.x - cam + 4, g.y);
      ctx.lineTo(g.x - cam + 30, g.y + 15);
      ctx.lineTo(g.x - cam + 4, g.y + 30);
      ctx.fill();
    }

    // Player
    const p = s.player;
    ctx.fillStyle = '#fff5f5';
    ctx.fillRect(p.x - cam, p.y, p.w, p.h);
    ctx.fillStyle = '#fa8072';
    ctx.fillRect(p.x - cam + 4, p.y + 4, p.w - 8, p.h - 8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x - cam + 8, p.y + 12, 4, 4);
    ctx.fillRect(p.x - cam + 16, p.y + 12, 4, 4);
  }, []);

  const collides = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const submitScore = useCallback(async (finalScore, finalLevel) => {
    try {
      await axios.post(`${API}/scores`, {
        game: 'platformer',
        pseudo: pseudo || 'Anonyme',
        score: finalScore,
        level: finalLevel + 1
      });
      setLeaderboardKey(k => k + 1);
    } catch (err) {
      console.error('Submit score error:', err);
    }
  }, [pseudo]);

  const handleDeath = useCallback(() => {
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        // Game over
        setPhase('dead');
        // Submit score
        setScore(s => {
          submitScore(s, currentLevel);
          setPhase('scoreSaved');
          return s;
        });
        return 0;
      } else {
        // Respawn at level start
        loadLevel(currentLevel);
        return next;
      }
    });
  }, [currentLevel, loadLevel, submitScore]);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.level) return;
    const p = s.player;
    const speed = s.speed;

    // Horizontal
    if (s.keys['ArrowLeft'] || s.keys['a'] || s.keys['q']) p.vx = -speed;
    else if (s.keys['ArrowRight'] || s.keys['d']) p.vx = speed;
    else p.vx = 0;

    // Jump
    if ((s.keys['ArrowUp'] || s.keys['w'] || s.keys['z'] || s.keys[' ']) && p.onGround) {
      p.vy = -JUMP;
      p.onGround = false;
    }

    // Gravity
    p.vy += GRAVITY;
    if (p.vy > 15) p.vy = 15;

    // Move X
    p.x += p.vx;
    if (p.x < 0) p.x = 0;
    s.level.platforms.forEach(plat => {
      if (collides(p, plat)) {
        if (p.vx > 0) p.x = plat.x - p.w;
        else if (p.vx < 0) p.x = plat.x + plat.w;
      }
    });

    // Move Y
    p.y += p.vy;
    p.onGround = false;
    s.level.platforms.forEach(plat => {
      if (collides(p, plat)) {
        if (p.vy > 0) { p.y = plat.y - p.h; p.vy = 0; p.onGround = true; }
        else if (p.vy < 0) { p.y = plat.y + plat.h; p.vy = 0; }
      }
    });

    // Enemies
    let died = false;
    s.enemies.forEach(e => {
      e.x += e.speed * e.dir;
      if (e.x > e.startX + e.range) e.dir = -1;
      if (e.x < e.startX - e.range) e.dir = 1;
      if (collides(p, { x: e.x, y: e.y, w: 24, h: 24 })) died = true;
    });

    // Spikes
    s.spikes.forEach(sp => {
      if (collides(p, { x: sp.x + 2, y: sp.y + 4, w: sp.w - 4, h: sp.h - 4 })) died = true;
    });

    // Fall
    if (p.y > H + 100) died = true;

    if (died) {
      draw();
      handleDeath();
      return;
    }

    // Camera
    s.camera = Math.max(0, p.x - W / 3);

    // Coins
    s.coins.forEach(c => {
      if (!c.taken && collides(p, { x: c.x, y: c.y, w: 20, h: 20 })) {
        c.taken = true;
        setScore(prev => prev + 50);
      }
    });

    // Goal
    if (collides(p, s.level.goal)) {
      setScore(prev => prev + 500 + lives * 100); // bonus for remaining lives
      if (currentLevel >= LEVELS.length - 1) {
        setPhase('won');
        setScore(prev => {
          submitScore(prev, currentLevel);
          return prev;
        });
      } else {
        setPhase('levelComplete');
      }
      return;
    }

    draw();
  }, [draw, currentLevel, handleDeath, lives, submitScore]);

  useEffect(() => {
    if (phase !== 'playing') return;
    let frame;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase, tick]);

  useEffect(() => {
    const handleDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      stateRef.current.keys[e.key] = true;
    };
    const handleUp = (e) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (phase === 'ready' || phase === 'playing' || phase === 'levelComplete') {
      loadLevel(currentLevel);
      draw();
    }
  }, [currentLevel, phase, loadLevel, draw]);

  const handlePseudoStart = (p) => {
    setPseudo(p);
    setPhase('ready');
    setScore(0);
    setLives(INITIAL_LIVES);
    setCurrentLevel(0);
  };

  const startGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setCurrentLevel(0);
    loadLevel(0);
    setPhase('playing');
  };

  const nextLevel = () => {
    const next = currentLevel + 1;
    setCurrentLevel(next);
    setPhase('playing');
  };

  const restart = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setCurrentLevel(0);
    loadLevel(0);
    setPhase('ready');
  };

  const changePseudo = () => {
    setPhase('pseudo');
  };

  const lvl = LEVELS[currentLevel];

  return (
    <GameLayout
      title="Plateformer"
      description={phase !== 'pseudo' ? `${lvl.name} — ${lvl.description}` : "7 niveaux, des pièges et un classement mondial."}
    >
      {phase === 'pseudo' ? (
        <div className="flex flex-col items-center gap-8">
          <PseudoScreen gameName="Plateformer" onStart={handlePseudoStart} />
          <Leaderboard game="platformer" currentPseudo={pseudo} refreshKey={leaderboardKey} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="flex flex-col items-center gap-6 flex-1">
            <div className="flex gap-6 items-center flex-wrap justify-center bg-slate-800/30 px-6 py-3 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-salmon-400" />
                <span className="font-medium text-white" data-testid="player-pseudo">{pseudo}</span>
                <Button size="sm" variant="ghost" onClick={changePseudo} className="h-6 px-2 text-xs text-slate-400 hover:text-white">
                  Changer
                </Button>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase">Score</p>
                <p className="text-xl font-bold text-salmon-400" data-testid="plat-score">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase flex items-center gap-1 justify-center">
                  <Flag className="w-3 h-3" /> Niveau
                </p>
                <p className="text-xl font-bold text-white" data-testid="plat-level">
                  {currentLevel + 1} / {LEVELS.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase">Vies</p>
                <div className="flex gap-1 justify-center" data-testid="plat-lives">
                  {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 ${i < lives ? 'text-salmon-400 fill-salmon-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="border-2 border-salmon-500/50 rounded-lg shadow-2xl shadow-salmon-500/20"
                data-testid="plat-canvas"
              />

              {phase === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 rounded-lg backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-xl text-white mb-1">Salut <span className="text-salmon-400 font-bold">{pseudo}</span> !</p>
                    <p className="text-slate-400 mb-4">Tu as 3 vies pour finir les 7 niveaux.</p>
                    <Button onClick={startGame} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="plat-start-btn">
                      <Play className="w-4 h-4 mr-2" /> Démarrer
                    </Button>
                  </div>
                </div>
              )}

              {phase === 'levelComplete' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 rounded-lg backdrop-blur-sm">
                  <div className="text-center">
                    <Flag className="w-12 h-12 text-salmon-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-salmon-400 mb-2">Niveau terminé !</p>
                    <p className="text-slate-300 mb-4">Score : <span className="font-bold text-white">{score}</span></p>
                    <Button onClick={nextLevel} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="plat-next-level-btn">
                      Niveau suivant <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {phase === 'scoreSaved' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 rounded-lg backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-salmon-400 mb-2">Game Over !</p>
                    <p className="text-slate-300 mb-1">Plus de vies, <span className="text-salmon-400 font-bold">{pseudo}</span></p>
                    <p className="text-slate-400 mb-4">Score final : <span className="font-bold text-white">{score}</span></p>
                    <Button onClick={restart} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="plat-restart-btn">
                      <RotateCcw className="w-4 h-4 mr-2" /> Rejouer
                    </Button>
                  </div>
                </div>
              )}

              {phase === 'won' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 rounded-lg backdrop-blur-sm">
                  <div className="text-center">
                    <Award className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-yellow-400 mb-2">Bravo champion !</p>
                    <p className="text-slate-300 mb-1">Tu as fini les 7 niveaux !</p>
                    <p className="text-2xl font-bold text-white mb-4">Score : {score}</p>
                    <Button onClick={restart} size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white" data-testid="plat-replay-btn">
                      <RotateCcw className="w-4 h-4 mr-2" /> Rejouer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-slate-400 text-sm">
              <p>Contrôles : <kbd className="px-2 py-1 bg-slate-800 rounded">←→</kbd> ou <kbd className="px-2 py-1 bg-slate-800 rounded">A D</kbd> bouger · <kbd className="px-2 py-1 bg-slate-800 rounded">↑</kbd> ou <kbd className="px-2 py-1 bg-slate-800 rounded">Espace</kbd> sauter</p>
              <p className="mt-1 text-xs">Évite les pics et les ennemis rouges. 3 vies pour finir les 7 niveaux !</p>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[320px]">
            <Leaderboard game="platformer" currentPseudo={pseudo} refreshKey={leaderboardKey} />
          </div>
        </div>
      )}
    </GameLayout>
  );
}
