import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PhilippineTimePhase } from '../utils/timeUtils';

interface ScenicBackdropProps {
  /** Which sky to paint: sunlit day, golden afternoon, or starlit night. */
  phase: PhilippineTimePhase;
  /**
   * Tap-to-rustle the hanging vines. Left on where the scene is the subject
   * (Home), and switched off where the same scenery is only a background
   * (the chat modal), so it never swallows a click meant for the pet or the
   * message list.
   */
  interactive?: boolean;
  className?: string;
}

/**
 * ============================================================
 * THE HANGIN SCENERY
 * ============================================================
 * Mountain lake, drifting clouds, swaying vines — the exact layers the home
 * scene has always painted, lifted out of it unchanged so one scene can be
 * painted in more than one place. Only the time phase and whether the vines
 * respond to taps are props; everything else is decorative and self-contained.
 * ============================================================
 */
export const ScenicBackdrop: React.FC<ScenicBackdropProps> = ({
  phase,
  interactive = true,
  className = '',
}) => {
  // The vines keep their wiggle locally: it is purely presentational, and
  // lifting it out of the home stage keeps this component drop-in anywhere.
  const [vineWiggleLeft, setVineWiggleLeft] = useState(false);
  const [vineWiggleRight, setVineWiggleRight] = useState(false);

  const handleInteractLeftVine = () => {
    if (!interactive) return;
    setVineWiggleLeft(true);
    setTimeout(() => setVineWiggleLeft(false), 900);
  };

  const handleInteractRightVine = () => {
    if (!interactive) return;
    setVineWiggleRight(true);
    setTimeout(() => setVineWiggleRight(false), 900);
  };

  return (
    <div
      className={`absolute inset-0 z-0 transition-colors duration-1000 overflow-hidden ${
        phase === 'day'
          ? 'bg-gradient-to-b from-[#5aa0d8] via-[#94cbed] to-[#dcf2e8]'
          : phase === 'afternoon'
          ? 'bg-gradient-to-b from-[#2e194f] via-[#8c3563] via-50% to-[#f59e42]'
          : 'bg-gradient-to-b from-[#060a1a] via-[#0c1836] to-[#0e2724]'
      } ${className}`}
    >
      {/* ==================== CELESTIAL ELEMENTS ==================== */}
      {phase === 'day' && (
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

      {phase === 'afternoon' && (
        <>
          {/* Golden Sinking Sun at Horizon */}
          <div className="absolute bottom-48 right-24 w-24 h-24 rounded-full bg-gradient-to-t from-[#fb923c] via-[#fde047] to-[#fffbeb] shadow-[0_0_70px_#f97316] pointer-events-none" />
        </>
      )}

      {phase === 'night' && (
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

      {/* ==================== DRIFTING CLOUDS ==================== */}
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
          SCENERY: MAJESTIC MOUNTAIN PEAKS & REFLECTING LAKE
          ========================================================= */}
      {/* Layer 1: Distant Misty Mountain Peaks */}
      <div className="absolute bottom-36 sm:bottom-40 inset-x-0 h-52 pointer-events-none">
        <svg viewBox="0 0 1000 320" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="mistyPeaksGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={phase === 'day' ? '#7aaac0' : phase === 'afternoon' ? '#5a2a5e' : '#14203d'}
              />
              <stop
                offset="100%"
                stopColor={phase === 'day' ? '#a5cbd8' : phase === 'afternoon' ? '#a35070' : '#1c3452'}
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
                stopColor={phase === 'day' ? '#2f6859' : phase === 'afternoon' ? '#462340' : '#0c1e23'}
              />
              <stop
                offset="100%"
                stopColor={phase === 'day' ? '#1d483b' : phase === 'afternoon' ? '#271728' : '#071216'}
              />
            </linearGradient>
          </defs>
          <path
            d="M 0 180 Q 180 110 380 140 T 780 110 Q 900 130 1000 150 L 1000 240 L 0 240 Z"
            fill="url(#pineRidgeGrad)"
          />
        </svg>
      </div>

      {/* Layer 3: Reflective Mountain Lake Water Surface */}
      <div className="absolute bottom-16 sm:bottom-20 inset-x-0 h-24 overflow-hidden pointer-events-none">
        <div
          className={`w-full h-full transition-colors duration-1000 ${
            phase === 'day'
              ? 'bg-gradient-to-b from-[#42959c]/60 via-[#2f7a82]/80 to-[#1e5861]'
              : phase === 'afternoon'
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
                stopColor={phase === 'day' ? '#38a169' : phase === 'afternoon' ? '#5a6e28' : '#14361e'}
              />
              <stop
                offset="100%"
                stopColor={phase === 'day' ? '#1b5e20' : phase === 'afternoon' ? '#233811' : '#081c0d'}
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
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            className={`w-1 rounded-t-full origin-bottom ${
              phase === 'day'
                ? 'bg-gradient-to-t from-emerald-700 to-lime-300'
                : phase === 'afternoon'
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
          ========================================================= */}
      {/* Left Interactive Hanging Vine */}
      <motion.div
        onClick={handleInteractLeftVine}
        animate={{
          rotate: vineWiggleLeft ? [-12, 10, -8, 6, 0] : [-4, 4, -3, 3, -4],
        }}
        transition={{ duration: vineWiggleLeft ? 0.8 : 5.4, repeat: vineWiggleLeft ? 1 : Infinity, ease: 'easeInOut' }}
        className={`absolute -top-3 -left-3 w-40 sm:w-52 origin-top-left z-20 ${
          interactive
            ? 'pointer-events-auto cursor-pointer hover:scale-105 transition-transform'
            : 'pointer-events-none'
        }`}
        title={interactive ? 'Tap swaying vines to rustle leaves! 🍃' : undefined}
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
        className={`absolute -top-3 -right-3 w-40 sm:w-52 origin-top-right z-20 ${
          interactive
            ? 'pointer-events-auto cursor-pointer hover:scale-105 transition-transform'
            : 'pointer-events-none'
        }`}
        title={interactive ? 'Tap swaying vines to rustle leaves! 🍃' : undefined}
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
  );
};
