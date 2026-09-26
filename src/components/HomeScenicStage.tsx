import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  RefreshCw,
  MessageSquareHeart,
  Sun,
  Sunset,
  Moon,
  Repeat,
  X,
  Target,
} from 'lucide-react';
import { CuteCompanion } from './CuteCompanion';
import { PetSpecies, PetAnimationMood, EquippedAccessories, MoodLog } from '../types';
import { getPhilippineTime, PhilippineTimePhase } from '../utils/timeUtils';

interface HomeScenicStageProps {
  species: PetSpecies;
  companionName: string;
  equipped: EquippedAccessories;
  mindfulGoals?: string[];
  onLogMood: (mood: MoodLog['mood']) => void;
  lastMood?: string;
  onOpenChat?: () => void;
  onChangeSpecies?: (newSpecies: PetSpecies) => void;
}

const motivationalQuotes = [
  "Take a deep breath. You don't have to figure out everything today. 🌱",
  "Like the gentle wind (Hangin), let the heavy thoughts drift away. 🍃",
  "Small steps still take you forward. I'm right here beside you! 🐾",
  "Drink some cool water and remember you are worthy of gentle rest. 💧",
  "Even the darkest night gives way to morning stars. You're doing your best. ✨",
  "Put your phone down when you feel ready. The world will wait for you. 🌿",
  "Inhale peace, exhale tension. Let's take today one moment at a time. 🌸",
  "You are stronger and softer than you give yourself credit for. 💚",
];

const goalLabels: Record<string, { icon: string; label: string }> = {
  screentime: { icon: '📵', label: 'Reduce Doomscrolling' },
  stress: { icon: '🧘', label: 'Relieve Stress & Anxiety' },
  habits: { icon: '💧', label: 'Self-Care Habits' },
  journal: { icon: '🔒', label: 'Private Journaling' },
  sleep: { icon: '🌙', label: 'Rest & Sleep Hygiene' },
};

export const HomeScenicStage: React.FC<HomeScenicStageProps> = ({
  species,
  companionName,
  equipped,
  mindfulGoals = ['stress', 'screentime', 'habits'],
  onLogMood,
  lastMood,
  onOpenChat,
  onChangeSpecies,
}) => {
  const [showMoodSelector, setShowMoodSelector] = useState(!lastMood);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [reactionText, setReactionText] = useState<string | null>(null);
  const [companionMood, setCompanionMood] = useState<PetAnimationMood>('excited');
  const [vineWiggleLeft, setVineWiggleLeft] = useState(false);
  const [vineWiggleRight, setVineWiggleRight] = useState(false);
  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);

  // Time-of-day state based on Philippine Standard Time (PST/PHT)
  const [timeOverride, setTimeOverride] = useState<PhilippineTimePhase | null>(null);
  const [phTime, setPhTime] = useState(() => getPhilippineTime(null));

  // Welcoming jump upon load: Pet jumps happily excited to meet its owner!
  useEffect(() => {
    setCompanionMood('excited');
    const timer = setTimeout(() => {
      setCompanionMood('idle');
    }, 2800);
    return () => clearTimeout(timer);
  }, [species]);

  // Keep Philippine time updated in real-time
  useEffect(() => {
    const updateTime = () => setPhTime(getPhilippineTime(timeOverride));
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [timeOverride]);

  const activePhase = phTime.phase;

  const handleSelectMood = (mood: MoodLog['mood'], _label: string) => {
    onLogMood(mood);
    if (mood === 'happy') {
      setCompanionMood('happy');
    } else if (mood === 'calm' || mood === 'peaceful') {
      setCompanionMood('calm');
    } else if (mood === 'sad') {
      setCompanionMood('sad');
    } else if (mood === 'tired') {
      setCompanionMood('tired');
    } else if (mood === 'overwhelmed' || mood === 'anxious') {
      setCompanionMood('overwhelmed');
    } else {
      setCompanionMood('happy');
    }

    const responses: Record<string, string> = {
      happy: `Seeing you smile makes my heart flutter! Let's cherish this gentle joy today. ☀️`,
      calm: `That steady calm is such a gift. Let's hold onto this quiet peace together. 🌿`,
      sad: `I'm sitting right here beside you. It's okay to feel sad. You don't have to face it alone. 🫂`,
      tired: `You've been carrying so much. Please rest your eyes and breathe softly with me. 🌙`,
      overwhelmed: `Let's pause. Listen to the gentle breeze (Hangin). Right here, right now, you are safe. 🌬️`,
    };

    setReactionText(responses[mood] || "Thank you for checking in with me! 💚");
    setShowMoodSelector(false);

    setTimeout(() => {
      setCompanionMood('idle');
      setReactionText(null);
      setIsBubbleDismissed(true);
    }, 6000);
  };

  const handleNextQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % motivationalQuotes.length);
    setCompanionMood('happy');
    setTimeout(() => setCompanionMood('idle'), 800);
  };

  const toggleSpecies = () => {
    if (onChangeSpecies) {
      onChangeSpecies(species === 'dog' ? 'cat' : 'dog');
    }
  };

  // Interactive Vine shake handlers
  const handleInteractLeftVine = () => {
    setVineWiggleLeft(true);
    setTimeout(() => setVineWiggleLeft(false), 900);
  };

  const handleInteractRightVine = () => {
    setVineWiggleRight(true);
    setTimeout(() => setVineWiggleRight(false), 900);
  };

  return (
    <div className="relative w-full h-[530px] sm:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/30 select-none transition-all duration-700">
      {/* =========================================================
          IMPROVED SCENIC MOUNTAIN LAKE & DRIFTING CLOUDS (PHOTO 2)
          ========================================================= */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 overflow-hidden ${
          activePhase === 'day'
            ? 'bg-gradient-to-b from-[#5aa0d8] via-[#94cbed] to-[#dcf2e8]'
            : activePhase === 'afternoon'
            ? 'bg-gradient-to-b from-[#2e194f] via-[#8c3563] via-50% to-[#f59e42]'
            : 'bg-gradient-to-b from-[#060a1a] via-[#0c1836] to-[#0e2724]'
        }`}
      >
        {/* ==================== CELESTIAL ELEMENTS ==================== */}
        {activePhase === 'day' && (
          <>
            {/* Sun Glow */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 0.95, 0.85] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 right-16 w-20 h-20 rounded-full bg-gradient-to-br from-[#fffbeb] via-[#fde047] to-[#eab308] shadow-[0_0_55px_#fde047] pointer-events-none"
            />
            {/* Soft Sun Ray Sheen */}
            <div className="absolute top-8 right-12 w-28 h-28 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" />
          </>
        )}

        {activePhase === 'afternoon' && (
          <>
            {/* Golden Sinking Sun at Horizon */}
            <div className="absolute bottom-48 right-24 w-24 h-24 rounded-full bg-gradient-to-t from-[#fb923c] via-[#fde047] to-[#fffbeb] shadow-[0_0_70px_#f97316] pointer-events-none" />
          </>
        )}

        {activePhase === 'night' && (
          <>
            {/* Glowing Moon */}
            <div className="absolute top-12 right-14 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fef9c3] via-[#fef08a] to-[#fde68a] shadow-[0_0_35px_rgba(254,240,138,0.7)] flex items-center justify-center relative">
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-amber-200/40" />
                <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-amber-200/35" />
              </div>
            </div>

            {/* Twinkling Stars */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(38)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.2, 0.95, 0.25],
                    scale: [0.8, 1.3, 0.8],
                  }}
                  transition={{
                    duration: 2.2 + (i % 6) * 0.4,
                    repeat: Infinity,
                    delay: (i % 5) * 0.3,
                    ease: 'easeInOut',
                  }}
                  className="absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.85)]"
                  style={{
                    top: `${(i * 19) % 55}%`,
                    left: `${(i * 31) % 96}%`,
                    width: i % 4 === 0 ? '3px' : '2px',
                    height: i % 4 === 0 ? '3px' : '2px',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ==================== DRIFTING CLOUDS (PHOTO 2) ==================== */}
        {/* Layer 1: High Drifting Soft Clouds */}
        <motion.div
          animate={{ x: [-120, 560] }}
          transition={{ duration: 44, repeat: Infinity, ease: 'linear' }}
          className="absolute top-16 left-0 flex items-center opacity-80 pointer-events-none"
        >
          <div className="w-24 h-9 rounded-full bg-white/85 shadow-sm" />
          <div className="w-16 h-16 rounded-full bg-white/85 -ml-6 -mt-5 shadow-sm" />
          <div className="w-20 h-10 rounded-full bg-white/85 -ml-5 shadow-sm" />
        </motion.div>

        {/* Layer 2: Mid Altocumulus Cloud Stream */}
        <motion.div
          animate={{ x: [-160, 580] }}
          transition={{ duration: 62, repeat: Infinity, delay: 8, ease: 'linear' }}
          className="absolute top-28 left-0 flex items-center opacity-65 pointer-events-none"
        >
          <div className="w-32 h-11 rounded-full bg-white/75 shadow-sm" />
          <div className="w-20 h-20 rounded-full bg-white/75 -ml-8 -mt-7 shadow-sm" />
          <div className="w-24 h-12 rounded-full bg-white/75 -ml-6 shadow-sm" />
        </motion.div>

        {/* Layer 3: Low Wispy Vapor Cloud */}
        <motion.div
          animate={{ x: [-100, 520] }}
          transition={{ duration: 52, repeat: Infinity, delay: 20, ease: 'linear' }}
          className="absolute top-44 left-0 flex items-center opacity-50 pointer-events-none"
        >
          <div className="w-28 h-8 rounded-full bg-white/60 blur-[1px]" />
          <div className="w-16 h-12 rounded-full bg-white/60 -ml-6 -mt-3 blur-[1px]" />
        </motion.div>

        {/* =========================================================
            PHOTO 2 SCENERY: MAJESTIC MOUNTAIN PEAKS & REFLECTING LAKE
            ========================================================= */}
        {/* Layer 1: Distant Misty Mountain Peaks */}
        <div className="absolute bottom-36 sm:bottom-40 inset-x-0 h-52 pointer-events-none">
          <svg viewBox="0 0 1000 320" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="mistyPeaksGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={activePhase === 'day' ? '#7aaac0' : activePhase === 'afternoon' ? '#5a2a5e' : '#14203d'}
                />
                <stop
                  offset="100%"
                  stopColor={activePhase === 'day' ? '#a5cbd8' : activePhase === 'afternoon' ? '#a35070' : '#1c3452'}
                  stopOpacity="0.85"
                />
              </linearGradient>
            </defs>
            {/* Jagged Mountain Silhouettes */}
            <polygon points="0,320 0,160 120,80 230,170 360,60 480,180 620,40 760,190 890,75 1000,160 1000,320" fill="url(#mistyPeaksGrad)" />
            {/* Subtle Snowcaps */}
            <polygon points="120,80 95,115 145,115" fill="#FFFFFF" opacity="0.45" />
            <polygon points="360,60 330,105 390,105" fill="#FFFFFF" opacity="0.45" />
            <polygon points="620,40 585,90 655,90" fill="#FFFFFF" opacity="0.5" />
            <polygon points="890,75 860,115 920,115" fill="#FFFFFF" opacity="0.4" />
          </svg>
        </div>

        {/* Layer 2: Mid-Range Pine Ridge */}
        <div className="absolute bottom-28 sm:bottom-32 inset-x-0 h-40 pointer-events-none">
          <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="pineRidgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={activePhase === 'day' ? '#2f6859' : activePhase === 'afternoon' ? '#462340' : '#0c1e23'}
                />
                <stop
                  offset="100%"
                  stopColor={activePhase === 'day' ? '#1d483b' : activePhase === 'afternoon' ? '#271728' : '#071216'}
                />
              </linearGradient>
            </defs>
            <path
              d="M 0 180 Q 180 110 380 140 T 780 110 Q 900 130 1000 150 L 1000 240 L 0 240 Z"
              fill="url(#pineRidgeGrad)"
            />
          </svg>
        </div>

        {/* Layer 3: Reflective Mountain Lake Water Surface (Photo 2) */}
        <div className="absolute bottom-16 sm:bottom-20 inset-x-0 h-24 overflow-hidden pointer-events-none">
          <div
            className={`w-full h-full transition-colors duration-1000 ${
              activePhase === 'day'
                ? 'bg-gradient-to-b from-[#42959c]/60 via-[#2f7a82]/80 to-[#1e5861]'
                : activePhase === 'afternoon'
                ? 'bg-gradient-to-b from-[#d97706]/40 via-[#9d174d]/60 to-[#4c0519]'
                : 'bg-gradient-to-b from-[#0e2a3b]/70 via-[#0a1e2b]/90 to-[#051119]'
            }`}
          >
            {/* Shimmering Lake Surface Water Ripples */}
            {[0, 1, 2].map((r) => (
              <motion.div
                key={r}
                animate={{ x: [-40, 40, -40], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4 + r * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-0.5 bg-white/30 my-3 blur-[0.5px]"
                style={{ marginLeft: `${r * 15}%` }}
              />
            ))}
          </div>
        </div>

        {/* Layer 4: Foreground Lush Green Hilltop with Soft Slope */}
        <div className="absolute bottom-0 inset-x-0 h-32 sm:h-36 pointer-events-none">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="foreHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={activePhase === 'day' ? '#38a169' : activePhase === 'afternoon' ? '#5a6e28' : '#14361e'}
                />
                <stop
                  offset="100%"
                  stopColor={activePhase === 'day' ? '#1b5e20' : activePhase === 'afternoon' ? '#233811' : '#081c0d'}
                />
              </linearGradient>
            </defs>
            <path
              d="M 0 90 Q 280 20 600 45 T 1000 70 L 1000 200 L 0 200 Z"
              fill="url(#foreHillGrad)"
            />
          </svg>
        </div>

        {/* Animated Swaying Wild Grass Blades */}
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 h-10 pointer-events-none overflow-hidden flex justify-around px-4">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: [-5, 6, -5] }}
              transition={{
                duration: 2.6 + (i % 4) * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
              className={`w-1 rounded-t-full origin-bottom ${
                activePhase === 'day'
                  ? 'bg-gradient-to-t from-emerald-700 to-lime-300'
                  : activePhase === 'afternoon'
                  ? 'bg-gradient-to-t from-emerald-900 to-amber-400'
                  : 'bg-gradient-to-t from-emerald-950 to-emerald-400'
              }`}
              style={{
                height: `${18 + (i % 5) * 4}px`,
                transformOrigin: 'bottom center',
              }}
            />
          ))}
        </div>

        {/* Wildflowers */}
        <div className="absolute bottom-4 inset-x-10 flex justify-between pointer-events-none opacity-85 z-10 text-xs sm:text-sm">
          <span>🌼</span>
          <span className="hidden sm:inline">🌸</span>
          <span>🌺</span>
          <span>🌼</span>
          <span className="hidden sm:inline">🌸</span>
          <span>🌼</span>
        </div>

        {/* =========================================================
            INTERACTIVE HANGING VINES & LEAVES ("HANGIN")
            User instruction: "make the vines interactive"
            ========================================================= */}
        {/* Left Interactive Hanging Vine */}
        <motion.div
          onClick={handleInteractLeftVine}
          animate={{
            rotate: vineWiggleLeft ? [-12, 10, -8, 6, 0] : [-4, 4, -3, 3, -4],
          }}
          transition={{ duration: vineWiggleLeft ? 0.8 : 5.4, repeat: vineWiggleLeft ? 1 : Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -left-3 w-40 sm:w-52 origin-top-left z-20 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
          title="Tap swaying vines to rustle leaves! 🍃"
        >
          <svg viewBox="0 0 190 360" className="w-full h-auto drop-shadow-md">
            <path
              d="M 10 0 C 35 45 15 100 45 150 C 58 175 30 215 44 265 C 52 300 38 335 42 360"
              fill="none"
              stroke="#2e5a27"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 32 80 C 65 95 75 130 65 160 C 58 185 75 220 70 245"
              fill="none"
              stroke="#3a7032"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Broad Leaves */}
            <g fill="#2d7a34" stroke="#1c4e20" strokeWidth="1">
              <path d="M 22 45 Q 52 35 48 62 Q 28 62 22 45 Z" />
              <path d="M 16 90 Q -12 78 -4 105 Q 12 105 16 90 Z" />
              <path d="M 32 130 Q 64 118 56 148 Q 40 148 32 130 Z" fill="#388e3c" />
              <path d="M 40 170 Q 14 160 20 186 Q 36 186 40 170 Z" fill="#4caf50" />
              <path d="M 42 215 Q 68 206 62 230 Q 48 230 42 215 Z" fill="#2e7d32" />
              <path d="M 46 270 Q 74 260 68 288 Q 50 288 46 270 Z" fill="#388e3c" />
              <path d="M 38 315 Q 10 305 18 332 Q 34 332 38 315 Z" fill="#4caf50" />
            </g>
            {/* Jasmine Blossoms */}
            <circle cx="50" cy="66" r="3.5" fill="#ffffff" />
            <circle cx="50" cy="66" r="1.5" fill="#fef08a" />
            <circle cx="24" cy="188" r="3.5" fill="#ffffff" />
            <circle cx="24" cy="188" r="1.5" fill="#fef08a" />
            <circle cx="66" cy="286" r="3.5" fill="#ffffff" />
            <circle cx="66" cy="286" r="1.5" fill="#fef08a" />
          </svg>
        </motion.div>

        {/* Right Interactive Hanging Vine */}
        <motion.div
          onClick={handleInteractRightVine}
          animate={{
            rotate: vineWiggleRight ? [12, -10, 8, -6, 0] : [4, -4, 3, -3, 4],
          }}
          transition={{ duration: vineWiggleRight ? 0.8 : 5.8, repeat: vineWiggleRight ? 1 : Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -top-3 -right-3 w-40 sm:w-52 origin-top-right z-20 pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
          title="Tap swaying vines to rustle leaves! 🍃"
        >
          <svg viewBox="0 0 190 360" className="w-full h-auto drop-shadow-md">
            <path
              d="M 180 0 C 155 45 175 100 145 150 C 132 175 160 215 146 265 C 138 300 152 335 148 360"
              fill="none"
              stroke="#2e5a27"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 158 80 C 125 95 115 130 125 160 C 132 185 115 220 120 245"
              fill="none"
              stroke="#3a7032"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <g fill="#2d7a34" stroke="#1c4e20" strokeWidth="1">
              <path d="M 168 45 Q 138 35 142 62 Q 162 62 168 45 Z" />
              <path d="M 174 90 Q 202 78 194 105 Q 178 105 174 90 Z" />
              <path d="M 158 130 Q 126 118 134 148 Q 150 148 158 130 Z" fill="#388e3c" />
              <path d="M 150 170 Q 176 160 170 186 Q 154 186 150 170 Z" fill="#4caf50" />
              <path d="M 148 215 Q 122 206 128 230 Q 142 230 148 215 Z" fill="#2e7d32" />
              <path d="M 144 270 Q 116 260 122 288 Q 140 288 144 270 Z" fill="#388e3c" />
              <path d="M 152 315 Q 180 305 172 332 Q 156 332 152 315 Z" fill="#4caf50" />
            </g>
            <circle cx="140" cy="66" r="3.5" fill="#ffffff" />
            <circle cx="140" cy="66" r="1.5" fill="#fef08a" />
            <circle cx="166" cy="188" r="3.5" fill="#ffffff" />
            <circle cx="166" cy="188" r="1.5" fill="#fef08a" />
            <circle cx="124" cy="286" r="3.5" fill="#ffffff" />
            <circle cx="124" cy="286" r="1.5" fill="#fef08a" />
          </svg>
        </motion.div>
      </div>

      {/* =========================================================
          TOP BAR: PHILIPPINE STANDARD TIME & DAY PHASE TESTER
          (Note: Whisper button completely removed per user request)
          ========================================================= */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-5 z-30 flex items-center justify-between pointer-events-auto">
        {/* Real Philippine Time Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-md">
          <span className="text-xs">🇵🇭</span>
          <span className="font-mono">{phTime.timeFullStr}</span>
          <span className="hidden sm:inline text-emerald-300 font-bold">&bull; {phTime.phaseLabel}</span>
        </div>

        {/* Mindful Goals & Time Simulator Controls */}
        <div className="flex items-center gap-1.5">
          {/* Active Mindful Goals Pill */}
          {mindfulGoals && mindfulGoals.length > 0 && (
            <button
              onClick={() => setShowGoalsDrawer(!showGoalsDrawer)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/40 backdrop-blur-md border border-emerald-400/40 text-emerald-200 hover:bg-black/60 cursor-pointer shadow-xs flex items-center gap-1"
              title="View your active mindful goals"
            >
              <Target className="w-3 h-3 text-emerald-400" />
              <span>{mindfulGoals.length} Goals</span>
            </button>
          )}

          {/* Time of Day Switcher */}
          <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md p-0.5 rounded-full border border-white/20 text-xs">
            <button
              onClick={() => setTimeOverride('day')}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                activePhase === 'day' ? 'bg-amber-400 text-black shadow-xs font-bold' : 'text-white/70 hover:text-white'
              }`}
              title="Switch to Day Scene"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOverride('afternoon')}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                activePhase === 'afternoon' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-white/70 hover:text-white'
              }`}
              title="Switch to Afternoon / Sunset Scene"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOverride('night')}
              className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                activePhase === 'night' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-white/70 hover:text-white'
              }`}
              title="Switch to Night Scene"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            {timeOverride && (
              <button
                onClick={() => setTimeOverride(null)}
                className="px-2 py-0.5 text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                title="Reset to Real Philippine Time"
              >
                Live
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mindful Goals Drawer Modal Overlay */}
      <AnimatePresence>
        {showGoalsDrawer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-14 right-4 z-40 w-72 p-3.5 rounded-2xl bg-white/95 dark:bg-[#112017]/95 backdrop-blur-md shadow-2xl border-2 border-emerald-500/40 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your Mindful Goals</span>
              </span>
              <button
                onClick={() => setShowGoalsDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-emerald-300/80 mb-2">
              Chosen during your mindful survey:
            </p>
            <div className="space-y-1.5">
              {mindfulGoals.map((gKey) => {
                const gInfo = goalLabels[gKey] || { icon: '🌱', label: gKey };
                return (
                  <div
                    key={gKey}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-slate-800 dark:text-emerald-100"
                  >
                    <span>{gInfo.icon}</span>
                    <span>{gInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          LOGICAL, EMPATHETIC SPEECH BUBBLE (PHOTO 1 IMPROVED)
          Arrow positioned aesthetically close to the pet's head!
          ========================================================= */}
      {!isBubbleDismissed && (
        <div className="absolute top-14 sm:top-16 inset-x-4 sm:inset-x-10 z-30 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {reactionText ? (
              /* Empathetic Reaction Bubble */
              <motion.div
                key="reaction"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-md w-full p-3.5 rounded-2xl bg-white/95 dark:bg-[#122219]/95 backdrop-blur-md shadow-xl border-2 border-emerald-300 dark:border-emerald-700 text-center"
              >
                <div className="flex items-center justify-between mb-1 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>{companionName}</span>
                  </div>
                  <button
                    onClick={() => setIsBubbleDismissed(true)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Dismiss message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-50 leading-relaxed">
                  {reactionText}
                </p>
                {/* Aesthetic Pointer Tail directly over companion */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-[#122219] rotate-45 border-r-2 border-b-2 border-emerald-300 dark:border-emerald-700" />
              </motion.div>
            ) : showMoodSelector ? (
              /* "How are you feeling right now?" Check-in */
              <motion.div
                key="mood-prompt"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-md w-full p-3.5 rounded-2xl bg-white/95 dark:bg-[#122219]/95 backdrop-blur-md shadow-xl border-2 border-emerald-200 dark:border-emerald-800 text-center"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <span>{phTime.greeting.tagalog}!</span>
                    <span className="text-slate-600 dark:text-emerald-400 font-normal">
                      {companionName} is glad to be with you
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBubbleDismissed(true)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Dismiss prompt"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-50 mb-2.5">
                  How are you feeling right now?
                </h3>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {[
                    { id: 'happy' as const, label: 'Happy', icon: '🌸' },
                    { id: 'calm' as const, label: 'Calm', icon: '🌿' },
                    { id: 'sad' as const, label: 'Sad', icon: '🌧️' },
                    { id: 'tired' as const, label: 'Tired', icon: '🌙' },
                    { id: 'overwhelmed' as const, label: 'Overwhelmed', icon: '⚡' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMood(m.id, m.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 border border-emerald-200 dark:border-emerald-700/50 text-xs font-semibold text-emerald-950 dark:text-emerald-100 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Aesthetic Pointer Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-[#122219] rotate-45 border-r-2 border-b-2 border-emerald-200 dark:border-emerald-800" />
              </motion.div>
            ) : (
              /* Daily Empathetic Quote */
              <motion.div
                key="quote"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={handleNextQuote}
                className="relative max-w-md w-full p-3.5 rounded-2xl bg-white/95 dark:bg-[#122219]/95 backdrop-blur-md shadow-xl border-2 border-emerald-200 dark:border-emerald-800 text-center cursor-pointer hover:border-emerald-400 transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{companionName}'s Mindful Reflection</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5" /> next
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBubbleDismissed(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Dismiss bubble"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-50 leading-relaxed italic">
                  "{motivationalQuotes[currentQuoteIdx]}"
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoodSelector(true);
                  }}
                  className="mt-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 cursor-pointer"
                >
                  Log another mood check-in
                </button>

                {/* Aesthetic Pointer Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-[#122219] rotate-45 border-r-2 border-b-2 border-emerald-200 dark:border-emerald-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* =========================================================
          THE ANIMAL COMPANION GROUNDED ON THE HILLTOP
          (Clean, zero black blobs or smudges)
          ========================================================= */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Companion Avatar: Touching only the pet body triggers purr/smile/jump */}
        <CuteCompanion
          species={species}
          mood={companionMood}
          equipped={equipped}
          size="lg"
          interactive={true}
          onPet={() => {
            setCompanionMood('happy');
            setTimeout(() => setCompanionMood('idle'), 1200);
          }}
        />

        {/* Companion Name, Chat & Switch Button */}
        <div className="text-center mt-1 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-black tracking-wide text-emerald-100 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-600/40 shadow-xs">
            {companionName} ({species === 'dog' ? '🐶 Dog' : '🐱 Cat'})
          </span>

          {onChangeSpecies && (
            <button
              onClick={toggleSpecies}
              className="text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/50 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Toggle Dog / Cat Companion"
            >
              <Repeat className="w-3 h-3" />
              <span>Switch to {species === 'dog' ? 'Cat 🐱' : 'Dog 🐶'}</span>
            </button>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="text-xs font-bold text-white bg-emerald-700/90 hover:bg-emerald-600 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/50 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          )}
        </div>

        {/* Real-time Emotional Feelings Animation Bar */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 text-[11px] shadow-sm">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mr-1">Feeling:</span>
          {[
            { id: 'happy' as const, label: 'Joyful', icon: '🌸' },
            { id: 'calm' as const, label: 'Calm', icon: '🌿' },
            { id: 'sad' as const, label: 'Comfort', icon: '🫂' },
            { id: 'tired' as const, label: 'Sleepy', icon: '🌙' },
            { id: 'overwhelmed' as const, label: 'Grounding', icon: '⚓' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setCompanionMood(f.id);
                const msgs: Record<string, string> = {
                  happy: `*wags tail happily and pants with soft joyful bounce* I love seeing you happy! ☀️`,
                  calm: `*breathes slowly with you, ears relaxed* Peaceful moments are so restorative. 🍃`,
                  sad: `*rests chin tenderly on your knee and gazes up warmly* I'm right here with you. It's okay. 🫂`,
                  tired: `*yawns softly and snuggles down* Take gentle rest. You've done well today. 🌙`,
                  overwhelmed: `*plants paws firmly, breathing in a steady 4-second box cadence* Breathe with me: in 2 3 4... out 2 3 4. You are safe. ⚓`,
                };
                setReactionText(msgs[f.id]);
                setIsBubbleDismissed(false);
              }}
              className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                companionMood === f.id
                  ? 'bg-emerald-500 text-black shadow-xs scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={`Make ${companionName} express ${f.label}`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
