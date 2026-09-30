import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  RotateCcw,
  X,
  Play,
  ArrowLeft,
  ArrowRight,
  Heart,
  Volume2,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetSpecies } from '../types';

interface WellnessMiniGamesProps {
  species: PetSpecies;
  companionName: string;
  onAddPoints: (amount: number) => void;
  onBoostHappiness?: (amount: number) => void;
}

type GameId = 'catcher' | 'bubbles' | 'laser' | 'simon' | 'clouds' | 'memory' | null;

interface GameDef {
  id: 'catcher' | 'bubbles' | 'laser' | 'simon' | 'clouds' | 'memory';
  title: string;
  icon: string;
  badge: string;
  desc: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

const GAME_CATALOG: GameDef[] = [
  {
    id: 'catcher',
    title: 'Treat Catcher',
    icon: '🍎',
    badge: 'Reflex',
    desc: 'Catch sweet falling fruits with combo multipliers',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:border-amber-900/50',
  },
  {
    id: 'bubbles',
    title: 'Zen Bubble Pop',
    icon: '🫧',
    badge: 'Calming',
    desc: 'Pop soothing rainbow bubbles for mindful focus',
    color: 'from-sky-500 to-cyan-500',
    bgLight: 'bg-sky-50 border-sky-200',
    bgDark: 'dark:bg-sky-950/40 dark:border-sky-900/50',
  },
  {
    id: 'laser',
    title: 'Laser & Yarn Chase',
    icon: '🧶',
    badge: 'Agility',
    desc: 'Pounce on hopping yarn and playful laser trails',
    color: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50 border-rose-200',
    bgDark: 'dark:bg-rose-950/40 dark:border-rose-900/50',
  },
  {
    id: 'simon',
    title: 'Paw Rhythm Beats',
    icon: '🎵',
    badge: 'Melody',
    desc: 'Repeat musical marimba chords with your pet',
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-purple-50 border-purple-200',
    bgDark: 'dark:bg-purple-950/40 dark:border-purple-900/50',
  },
  {
    id: 'clouds',
    title: 'Cloud Jumper',
    icon: '☁️',
    badge: 'Joy',
    desc: 'Bounce higher and higher on dreamy cloud pads',
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:border-emerald-900/50',
  },
  {
    id: 'memory',
    title: 'Zen Sanctuary Pairs',
    icon: '🃏',
    badge: 'Focus',
    desc: 'Match nature, botanicals & gentle sanctuary pairs',
    color: 'from-teal-500 to-emerald-600',
    bgLight: 'bg-teal-50 border-teal-200',
    bgDark: 'dark:bg-teal-950/40 dark:border-teal-900/50',
  },
];

// -------------------------------------------------------------
// Light Web Audio Synthesizer for Games
// -------------------------------------------------------------
function playSound(type: 'pop' | 'catch' | 'note' | 'win' | 'jump', freq?: number) {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq || 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'catch') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq || 659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'note') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq || 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);
        g.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        o.start(ctx.currentTime + idx * 0.08);
        o.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    }
  } catch {}
}

export const WellnessMiniGames: React.FC<WellnessMiniGamesProps> = ({
  species,
  companionName,
  onAddPoints,
  onBoostHappiness,
}) => {
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const [sessionPointsEarned, setSessionPointsEarned] = useState(0);

  const awardGamePoints = (amount: number, bonusMsg?: string) => {
    onAddPoints(amount);
    if (onBoostHappiness) onBoostHappiness(Math.min(20, amount));
    setSessionPointsEarned((p) => p + amount);
    playSound('win');
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <span>Sanctuary Play Arcade</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                6 Enhanced Games
              </span>
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Audio effects, combo multipliers &amp; Wellness Points for {companionName}!
            </p>
          </div>
        </div>

        {sessionPointsEarned > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>+{sessionPointsEarned} WP Earned</span>
          </div>
        )}
      </div>

      {/* 6 MINI GAMES GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {GAME_CATALOG.map((game) => (
          <motion.button
            key={game.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveGame(game.id)}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-xs ${game.bgLight} ${game.bgDark} hover:shadow-md`}
          >
            <div className="flex items-start justify-between w-full mb-2">
              <span className="text-3xl">{game.icon}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#0b1411]/40 text-emerald-950 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/40">
                {game.badge}
              </span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 mb-0.5">
                {game.title}
              </h5>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-tight">
                {game.desc}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
              <span>Play Now</span>
              <span>&rarr;</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ACTIVE GAME MODAL ARENA */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b1411]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-[#182a22] rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Game Modal Header */}
              <div className="p-4 border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between bg-emerald-50/50 dark:bg-[#182a22]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {GAME_CATALOG.find((g) => g.id === activeGame)?.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                      {GAME_CATALOG.find((g) => g.id === activeGame)?.title}
                    </h3>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Play to earn Wellness Points for {companionName}!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveGame(null)}
                  className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                  title="Close Game"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* GAME INSTANCES */}
              <div className="p-4 flex-1">
                {activeGame === 'catcher' && (
                  <TreatCatcherGame
                    species={species}
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
                {activeGame === 'bubbles' && (
                  <BubblePopGame
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
                {activeGame === 'laser' && (
                  <LaserChaseGame
                    species={species}
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
                {activeGame === 'simon' && (
                  <PawRhythmGame
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
                {activeGame === 'clouds' && (
                  <CloudJumperGame
                    species={species}
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
                {activeGame === 'memory' && (
                  <ZenMemoryGame
                    companionName={companionName}
                    onAwardPoints={awardGamePoints}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 1: TREAT CATCHER (COMBO MULTIPLIER + SMOOTH TOUCH DRAG)
   ========================================================================= */
const TreatCatcherGame: React.FC<{
  species: PetSpecies;
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ species, companionName, onAwardPoints }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [basketX, setBasketX] = useState(50);
  const [treats, setTreats] = useState<
    Array<{ id: number; x: number; y: number; icon: string; points: number }>
  >([]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(1);
    setTimeLeft(25);
    setIsGameOver(false);
    setBasketX(50);
    setTreats([]);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const treatSpawner = setInterval(() => {
      const isBonus = Math.random() < 0.2;
      const items = isBonus
        ? [{ icon: '🥭', points: 3 }, { icon: '⭐', points: 5 }]
        : [
            { icon: '🍎', points: 1 },
            { icon: '🍌', points: 1 },
            { icon: '🍓', points: 1 },
            { icon: species === 'cat' ? '🐟' : '🦴', points: 2 },
          ];
      const pick = items[Math.floor(Math.random() * items.length)];

      setTreats((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: 12 + Math.random() * 76,
          y: 0,
          icon: pick.icon,
          points: pick.points,
        },
      ]);
    }, 650);

    const physics = setInterval(() => {
      setTreats((prev) => {
        const next: typeof prev = [];
        for (const tr of prev) {
          const newY = tr.y + 4.2;
          // Catch collision detection
          if (newY >= 80 && newY <= 92 && Math.abs(tr.x - basketX) < 18) {
            playSound('catch', 440 + combo * 60);
            setScore((s) => s + tr.points * combo);
            setCombo((c) => Math.min(4, c + 1));
          } else if (newY >= 96) {
            // Drop missed: reset combo
            setCombo(1);
          } else {
            next.push({ ...tr, y: newY });
          }
        }
        return next;
      });
    }, 60);

    return () => {
      clearInterval(timer);
      clearInterval(treatSpawner);
      clearInterval(physics);
    };
  }, [isPlaying, basketX, species, combo]);

  useEffect(() => {
    if (isGameOver && score > 0) {
      const awarded = Math.max(5, Math.floor(score / 2));
      onAwardPoints(awarded);
    }
  }, [isGameOver, score]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <div className="flex items-center gap-2">
          <span>Score: <span className="font-extrabold text-[#35805a]">{score}</span></span>
          {combo > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black flex items-center gap-0.5 animate-pulse">
              <Flame className="w-3 h-3 fill-current" />
              <span>{combo}x Combo!</span>
            </span>
          )}
        </div>
        <span className="text-amber-600 font-mono">⏳ {timeLeft}s</span>
      </div>

      <div
        className="w-full h-64 bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-950 dark:to-emerald-900 rounded-2xl relative overflow-hidden border border-emerald-200 dark:border-emerald-800 select-none touch-none cursor-ew-resize"
        onMouseMove={(e) => {
          if (!isPlaying) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = ((e.clientX - rect.left) / rect.width) * 100;
          setBasketX(Math.max(10, Math.min(90, percent)));
        }}
        onTouchMove={(e) => {
          if (!isPlaying) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          const percent = ((touch.clientX - rect.left) / rect.width) * 100;
          setBasketX(Math.max(10, Math.min(90, percent)));
        }}
      >
        {treats.map((tr) => (
          <div
            key={tr.id}
            className="absolute text-2xl -translate-x-1/2 drop-shadow-sm transition-transform"
            style={{ left: `${tr.x}%`, top: `${tr.y}%` }}
          >
            {tr.icon}
          </div>
        ))}

        <div
          className="absolute bottom-2 -translate-x-1/2 flex flex-col items-center transition-all duration-75"
          style={{ left: `${basketX}%` }}
        >
          <span className="text-3xl drop-shadow-sm">{species === 'cat' ? '🐱' : '🐶'}</span>
          <div className="w-16 h-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 border-2 border-amber-900 shadow-md flex items-center justify-center text-[8px] text-white font-black">
            BASKET
          </div>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 bg-[#0b1411]/65 flex flex-col items-center justify-center p-4 text-center text-white">
            {isGameOver ? (
              <>
                <Trophy className="w-10 h-10 text-amber-400 mb-1 animate-bounce" />
                <h4 className="text-base font-black">Yum! Well Done!</h4>
                <p className="text-xs text-emerald-200 mb-3">
                  Score: {score} &bull; Earned +{Math.max(5, Math.floor(score / 2))} WP!
                </p>
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Play Again
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl mb-2">🍎🧺</span>
                <h4 className="text-sm font-black mb-1">Treat Catcher</h4>
                <p className="text-xs text-slate-200 mb-4 max-w-xs">
                  Drag {companionName} left &amp; right to catch fruit &amp; bonus golden mangos!
                </p>
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-2xl bg-[#35805a] hover:bg-[#2a6b4b] text-white font-black text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Game</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => setBasketX((x) => Math.max(10, x - 18))}
          className="flex-1 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 font-bold text-xs text-emerald-900 dark:text-emerald-100 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Move Left</span>
        </button>
        <button
          onClick={() => setBasketX((x) => Math.min(90, x + 18))}
          className="flex-1 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 font-bold text-xs text-emerald-900 dark:text-emerald-100 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Move Right</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 2: ZEN BUBBLE POP (RAINBOW RELIEF BUBBLES WITH AUDIO)
   ========================================================================= */
const BubblePopGame: React.FC<{
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ companionName, onAwardPoints }) => {
  const [poppedCount, setPoppedCount] = useState(0);
  const [bubbles, setBubbles] = useState<
    Array<{ id: number; x: number; y: number; size: number; text: string; color: string }>
  >([]);

  const affirmations = ['Peace', 'Calm', 'Breathe', 'Gentle', 'Ease', 'Hope', 'Rest', 'Joy'];
  const colors = [
    'from-cyan-300 to-blue-400',
    'from-emerald-300 to-teal-400',
    'from-pink-300 to-rose-400',
    'from-amber-300 to-orange-400',
    'from-purple-300 to-indigo-400',
  ];

  const spawnBubble = () => {
    return {
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 75,
      size: 48 + Math.floor(Math.random() * 24),
      text: affirmations[Math.floor(Math.random() * affirmations.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  };

  useEffect(() => {
    const initial = Array.from({ length: 8 }).map(spawnBubble);
    setBubbles(initial);
  }, []);

  const handlePop = (id: number) => {
    playSound('pop', 380 + Math.random() * 260);
    setPoppedCount((c) => {
      const next = c + 1;
      if (next % 10 === 0) {
        onAwardPoints(5);
      }
      return next;
    });

    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? spawnBubble() : b))
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <span>Popped: <span className="text-cyan-500 font-extrabold">{poppedCount}</span> Bubbles</span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
          +5 WP every 10 pops! 🫧
        </span>
      </div>

      <div className="w-full h-64 bg-gradient-to-br from-cyan-900/30 via-slate-900 to-emerald-950 rounded-2xl relative overflow-hidden border border-cyan-500/30 select-none">
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.92, y: [0, -6, 0] }}
            transition={{
              scale: { duration: 0.2 },
              y: { duration: 2.2 + Math.random(), repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.7 }}
            onClick={() => handlePop(b.id)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr ${b.color} border-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer text-white font-black text-[10px] tracking-tight`}
          >
            <span className="drop-shadow-sm">{b.text}</span>
          </motion.button>
        ))}
      </div>

      <p className="text-[11px] text-center text-slate-500 dark:text-emerald-400 mt-2">
        Tap floating soothing bubbles to pop stress away with {companionName} 🫧
      </p>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 3: LASER & YARN CHASE
   ========================================================================= */
const LaserChaseGame: React.FC<{
  species: PetSpecies;
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ species, companionName, onAwardPoints }) => {
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(20);
    setTargetPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const jumpTimer = setInterval(() => {
      setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    }, 1100);

    return () => {
      clearInterval(timer);
      clearInterval(jumpTimer);
    };
  }, [isPlaying]);

  const handlePounce = () => {
    if (!isPlaying) return;
    playSound('catch', 700);
    setScore((s) => s + 1);
    setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
  };

  useEffect(() => {
    if (!isPlaying && score > 0 && timeLeft === 0) {
      onAwardPoints(Math.max(5, score * 2));
    }
  }, [isPlaying, score, timeLeft]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <span>Catches: <span className="text-rose-500 font-extrabold">{score}</span></span>
        <span className="text-amber-600 font-mono">⏳ {timeLeft}s</span>
      </div>

      <div className="w-full h-64 bg-slate-950 rounded-2xl relative overflow-hidden border border-rose-500/40 select-none">
        {isPlaying ? (
          <motion.div
            animate={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            onClick={handlePounce}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 border-2 border-white shadow-[0_0_20px_#f43f5e] flex items-center justify-center cursor-pointer text-2xl active:scale-75 transition-transform"
          >
            <span>{species === 'cat' ? '🧶' : '🎾'}</span>
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[#0b1411]/60 flex flex-col items-center justify-center p-4 text-center text-white">
            <span className="text-4xl mb-2">{species === 'cat' ? '🧶' : '🎾'}</span>
            <h4 className="text-sm font-black mb-1">Laser &amp; Yarn Chase</h4>
            <p className="text-xs text-slate-300 mb-4">
              Tap the hopping target before it darts away!
            </p>
            <button
              onClick={startGame}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Chase</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 4: PAW RHYTHM BEATS (PENTATONIC MARIMBA MELODIES)
   ========================================================================= */
const PawRhythmGame: React.FC<{
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ companionName, onAwardPoints }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [activePad, setActivePad] = useState<number | null>(null);

  const pads = [
    { id: 0, label: 'C', color: 'bg-rose-500 hover:bg-rose-400', freq: 261.63 },
    { id: 1, label: 'E', color: 'bg-amber-500 hover:bg-amber-400', freq: 329.63 },
    { id: 2, label: 'G', color: 'bg-[#35805a] hover:bg-lime-400', freq: 392.0 },
    { id: 3, label: 'B', color: 'bg-indigo-500 hover:bg-indigo-400', freq: 493.88 },
  ];

  const playSequence = async (seq: number[]) => {
    setIsPlaying(false);
    for (let i = 0; i < seq.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      const pad = seq[i];
      setActivePad(pad);
      playSound('note', pads[pad].freq);
      await new Promise((r) => setTimeout(r, 350));
      setActivePad(null);
    }
    setIsPlaying(true);
  };

  const startRhythm = () => {
    const firstSeq = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    setSequence(firstSeq);
    setRound(1);
    setPlayerIdx(0);
    playSequence(firstSeq);
  };

  const handlePadTap = (id: number) => {
    if (!isPlaying) return;
    playSound('note', pads[id].freq);
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    if (id === sequence[playerIdx]) {
      if (playerIdx + 1 === sequence.length) {
        // Complete round!
        onAwardPoints(6);
        const nextRound = round + 1;
        setRound(nextRound);
        setPlayerIdx(0);
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setTimeout(() => playSequence(nextSeq), 600);
      } else {
        setPlayerIdx((p) => p + 1);
      }
    } else {
      // Mistake: restart
      alert(`Aw! You reached Round ${round}! Let's try again! 🎵`);
      setIsPlaying(false);
      setSequence([]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <span>Round: <span className="text-purple-600 font-extrabold">{round}</span></span>
        <span className="text-[11px] text-purple-600 dark:text-purple-400">
          Listen &amp; repeat the melody!
        </span>
      </div>

      <div className="w-full h-64 bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-purple-500/40 relative">
        {sequence.length === 0 ? (
          <button
            onClick={startRhythm}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Melody Beats</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {pads.map((p) => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handlePadTap(p.id)}
                className={`h-24 rounded-2xl ${p.color} text-white font-black text-lg shadow-lg flex items-center justify-center cursor-pointer transition-all ${
                  activePad === p.id ? 'ring-4 ring-white brightness-125 scale-105' : 'opacity-85'
                }`}
              >
                <span>{p.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 5: CLOUD JUMPER (TAP TO BOUNCE ON DREAMY CLOUD PADS)
   ========================================================================= */
const CloudJumperGame: React.FC<{
  species: PetSpecies;
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ species, companionName, onAwardPoints }) => {
  const [altitude, setAltitude] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleJump = () => {
    if (!isPlaying) return;
    playSound('jump');
    setAltitude((a) => {
      const next = a + 15;
      if (next % 60 === 0) {
        onAwardPoints(5);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <span>Altitude: <span className="text-emerald-600 dark:text-emerald-300 font-extrabold">{altitude}m</span></span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
          Tap fast to bounce higher!
        </span>
      </div>

      <div
        onClick={handleJump}
        className="w-full h-64 bg-gradient-to-b from-indigo-950 via-sky-900 to-teal-800 rounded-2xl relative overflow-hidden border border-emerald-500/30 select-none flex flex-col items-center justify-center cursor-pointer"
      >
        {!isPlaying ? (
          <button
            onClick={() => {
              setIsPlaying(true);
              setAltitude(0);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#35805a] hover:bg-[#2a6b4b] text-white font-black text-xs cursor-pointer shadow-lg flex items-center gap-1.5 z-20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Cloud Jump</span>
          </button>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-5xl drop-shadow-md z-10"
            >
              {species === 'cat' ? '🐱' : '🐶'}
            </motion.div>
            <div className="text-4xl -mt-2 opacity-90 z-0">☁️</div>
            <p className="text-[10px] text-white/80 font-bold mt-4">Tap anywhere to jump!</p>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   MINI-GAME 6: ZEN SANCTUARY PAIRS MATCHING
   ========================================================================= */
const ZenMemoryGame: React.FC<{
  companionName: string;
  onAwardPoints: (pts: number) => void;
}> = ({ companionName, onAwardPoints }) => {
  const cardsList = ['🍃', '🌸', '☀️', '🐾', '💧', '⭐'];
  const [deck, setDeck] = useState<Array<{ id: number; icon: string; flipped: boolean; matched: boolean }>>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const startMemory = () => {
    const double = [...cardsList, ...cardsList]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, flipped: false, matched: false }));
    setDeck(double);
    setSelected([]);
  };

  useEffect(() => {
    startMemory();
  }, []);

  const handleCardClick = (idx: number) => {
    if (selected.length === 2 || deck[idx].flipped || deck[idx].matched) return;
    playSound('pop', 500);

    const nextDeck = [...deck];
    nextDeck[idx].flipped = true;
    setDeck(nextDeck);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (nextDeck[first].icon === nextDeck[second].icon) {
        playSound('catch', 660);
        nextDeck[first].matched = true;
        nextDeck[second].matched = true;
        setDeck(nextDeck);
        setSelected([]);

        if (nextDeck.every((c) => c.matched)) {
          onAwardPoints(10);
        }
      } else {
        setTimeout(() => {
          nextDeck[first].flipped = false;
          nextDeck[second].flipped = false;
          setDeck([...nextDeck]);
          setSelected([]);
        }, 750);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs font-bold mb-2 text-emerald-950 dark:text-emerald-100">
        <span>Find Pairs</span>
        <button
          onClick={startMemory}
          className="text-[11px] text-teal-600 dark:text-teal-400 underline cursor-pointer"
        >
          Reset Deck
        </button>
      </div>

      <div className="w-full h-64 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-3 grid grid-cols-4 gap-2 border border-emerald-300 dark:border-emerald-800">
        {deck.map((c, i) => (
          <button
            key={c.id}
            onClick={() => handleCardClick(i)}
            className={`rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer shadow-xs ${
              c.flipped || c.matched
                ? 'bg-white dark:bg-emerald-900 border-2 border-emerald-400 text-slate-800 dark:text-white'
                : 'bg-emerald-600 text-transparent hover:bg-emerald-500'
            }`}
          >
            <span>{c.flipped || c.matched ? c.icon : '?'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
