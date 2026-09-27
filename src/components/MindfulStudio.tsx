import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind,
  Eye,
  Heart,
  Timer,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MindfulStudioProps {
  companionName: string;
  onAddPoints: (amount: number) => void;
  onClose?: () => void;
}

type MindfulExercise = 'menu' | 'breathing' | 'grounding' | 'gratitude' | 'focus';

export const MindfulStudio: React.FC<MindfulStudioProps> = ({
  companionName,
  onAddPoints,
  onClose,
}) => {
  const [activeExercise, setActiveExercise] = useState<MindfulExercise>('menu');

  // --- Box Breathing State ---
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    if (activeExercise !== 'breathing' || !isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold (Full)';
          if (current === 'Hold (Full)') return 'Exhale';
          if (current === 'Exhale') return 'Hold (Empty)';
          // Completed one full cycle
          setBreathCycles((c) => {
            const next = c + 1;
            if (next === 4) {
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
              onAddPoints(5);
            }
            return next;
          });
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExercise, isBreathingActive]);

  // --- 5-4-3-2-1 Grounding State ---
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingPrompts = [
    { num: 5, sense: 'Sight', prompt: 'Look around. Name 5 distinct things you can see right now.', icon: '👀' },
    { num: 4, sense: 'Touch', prompt: 'Feel your surroundings. Name 4 things you can physically touch.', icon: '✋' },
    { num: 3, sense: 'Sound', prompt: 'Close your eyes. Listen for 3 subtle sounds in your space.', icon: '👂' },
    { num: 2, sense: 'Smell', prompt: 'Breathe gently. Notice 2 pleasant or neutral scents in the air.', icon: '👃' },
    { num: 1, sense: 'Taste', prompt: 'Notice 1 taste, or take a refreshing sip of water.', icon: '👅' },
  ];

  // --- Gratitude Beads State ---
  const [gratitudeEntries, setGratitudeEntries] = useState<string[]>([]);
  const [currentGratitude, setCurrentGratitude] = useState('');

  const handleAddGratitude = () => {
    if (!currentGratitude.trim()) return;
    const updated = [...gratitudeEntries, currentGratitude.trim()];
    setGratitudeEntries(updated);
    setCurrentGratitude('');
    if (updated.length === 3) {
      confetti({ particleCount: 35, spread: 50 });
      onAddPoints(4);
    }
  };

  // --- Focus Sanctuary Timer ---
  const [focusSeconds, setFocusSeconds] = useState(300); // 5 min default
  const [focusRunning, setFocusRunning] = useState(false);

  useEffect(() => {
    if (activeExercise !== 'focus' || !focusRunning) return;
    const iv = setInterval(() => {
      setFocusSeconds((prev) => {
        if (prev <= 1) {
          setFocusRunning(false);
          confetti({ particleCount: 50, spread: 70 });
          onAddPoints(6);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [activeExercise, focusRunning]);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-[#d7e6dc] dark:border-[#244137] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e4eee8] dark:border-[#244137]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
              Mindful Sanctuary
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Gentle evidence-based grounding &amp; breathing with {companionName}
            </p>
          </div>
        </div>

        {activeExercise !== 'menu' && (
          <button
            onClick={() => setActiveExercise('menu')}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 transition-colors"
          >
            &larr; Back to Exercises
          </button>
        )}
      </div>

      {/* Exercises Menu View */}
      {activeExercise === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Box Breathing */}
          <button
            onClick={() => {
              setActiveExercise('breathing');
              setIsBreathingActive(true);
            }}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/30 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-900 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Box Breathing (4-4-4-4)
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                Rhythmic parasympathetic reset to lower heart rate and soothe physical anxiety.
              </p>
            </div>
          </button>

          {/* 5-4-3-2-1 Sensory Grounding */}
          <button
            onClick={() => {
              setActiveExercise('grounding');
              setGroundingStep(0);
            }}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/30 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-900 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  5-4-3-2-1 Sensory Grounding
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                Anchor attention back to the physical present when your thoughts are racing.
              </p>
            </div>
          </button>

          {/* Gratitude Garden */}
          <button
            onClick={() => setActiveExercise('gratitude')}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/30 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-900 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Gratitude Moments
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                Log 3 simple things that brought warmth or comfort to your day today.
              </p>
            </div>
          </button>

          {/* Sanctuary Focus Timer */}
          <button
            onClick={() => setActiveExercise('focus')}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/30 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-900 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Timer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Digital Sanctuary Timer
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                Gentle phone-free session with mindful chimes and ambient calm.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* --- Exercise 1: Box Breathing View --- */}
      {activeExercise === 'breathing' && (
        <div className="flex flex-col items-center py-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Pulsing visual breathing circle */}
            <motion.div
              animate={{
                scale: breathPhase === 'Inhale' ? 1.45 : breathPhase === 'Hold (Full)' ? 1.45 : breathPhase === 'Exhale' ? 0.8 : 0.8,
                backgroundColor: breathPhase === 'Inhale' ? '#34d399' : breathPhase === 'Hold (Full)' ? '#10b981' : breathPhase === 'Exhale' ? '#38bdf8' : '#64748b',
              }}
              transition={{ duration: 3.8, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full opacity-35 blur-md"
            />
            <motion.div
              animate={{
                scale: breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold (Full)' ? 1.35 : breathPhase === 'Exhale' ? 0.85 : 0.85,
              }}
              transition={{ duration: 3.8, ease: 'easeInOut' }}
              className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500 shadow-xl flex flex-col items-center justify-center text-white"
            >
              <span className="text-2xl font-black">{breathCount}</span>
              <span className="text-[10px] font-medium tracking-wide uppercase opacity-90">Seconds</span>
            </motion.div>
          </div>

          <h4 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 mt-5">
            {breathPhase}
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
            Completed: {breathCycles} of 4 gentle cycles
          </p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="px-5 py-2 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:bg-emerald-900 transition-colors"
            >
              {isBreathingActive ? 'Pause Exercise' : 'Resume Breathing'}
            </button>
            <button
              onClick={() => {
                setBreathCycles(0);
                setBreathPhase('Inhale');
                setBreathCount(4);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-semibold text-xs hover:bg-emerald-200 transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {/* --- Exercise 2: 5-4-3-2-1 Sensory Grounding View --- */}
      {activeExercise === 'grounding' && (
        <div className="flex flex-col items-center py-5">
          <div className="w-16 h-16 rounded-3xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-3xl shadow-sm">
            {groundingPrompts[groundingStep].icon}
          </div>

          <div className="text-center mt-3 max-w-sm">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold mb-2">
              Step {groundingStep + 1} of 5 &bull; {groundingPrompts[groundingStep].sense}
            </span>
            <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
              {groundingPrompts[groundingStep].prompt}
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 leading-relaxed">
              Take a slow, relaxed breath. There is no rush &mdash; acknowledge each detail quietly.
            </p>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-5">
            {groundingPrompts.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === groundingStep
                    ? 'w-7 bg-teal-600'
                    : idx < groundingStep
                    ? 'w-3 bg-teal-300 dark:bg-teal-800'
                    : 'w-3 bg-emerald-100 dark:bg-emerald-900'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (groundingStep < groundingPrompts.length - 1) {
                setGroundingStep((s) => s + 1);
              } else {
                confetti({ particleCount: 45, spread: 60 });
                onAddPoints(5);
                setActiveExercise('menu');
              }
            }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-xs shadow-sm hover:bg-teal-800 transition-colors"
          >
            {groundingStep < groundingPrompts.length - 1 ? 'Found them &bull; Next sense' : 'Complete Grounding (+5 WP)'}
          </button>
        </div>
      )}

      {/* --- Exercise 3: Gratitude View --- */}
      {activeExercise === 'gratitude' && (
        <div className="py-4">
          <p className="text-xs text-emerald-800 dark:text-emerald-200 mb-3 leading-relaxed">
            Write down small, genuine things you appreciate today (e.g., warm morning coffee, a kind message, sunshine on your desk).
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentGratitude}
              onChange={(e) => setCurrentGratitude(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
              placeholder="I am grateful for..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#182a22] border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-emerald-600"
            />
            <button
              onClick={handleAddGratitude}
              disabled={!currentGratitude.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {gratitudeEntries.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-emerald-950 dark:text-emerald-200"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="flex-1 font-medium">{item}</span>
              </div>
            ))}
            {gratitudeEntries.length === 0 && (
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/60 text-center py-4 italic">
                No entries logged yet today. Add your first small joy above!
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Exercise 4: Focus Sanctuary View --- */}
      {activeExercise === 'focus' && (
        <div className="flex flex-col items-center py-6">
          <div className="text-4xl font-extralight text-emerald-950 dark:text-emerald-100 tracking-wider">
            {String(Math.floor(focusSeconds / 60)).padStart(2, '0')}:
            {String(focusSeconds % 60).padStart(2, '0')}
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
            {focusRunning ? 'Sanctuary Session Active &bull; Screen-Free Time' : 'Ready to begin quiet focus'}
          </span>

          <div className="flex gap-2 mt-4">
            {[10, 300, 900, 1500].map((secs) => (
              <button
                key={secs}
                onClick={() => {
                  setFocusSeconds(secs);
                  setFocusRunning(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  focusSeconds === secs
                    ? 'bg-emerald-800 text-white border-emerald-900'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/40'
                }`}
              >
                {secs === 10 ? '10s (Test)' : `${secs / 60}m`}
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setFocusRunning(!focusRunning)}
              className="px-6 py-2.5 rounded-xl bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:bg-indigo-800 transition-colors"
            >
              {focusRunning ? 'Pause Sanctuary' : 'Begin Sanctuary'}
            </button>
            <button
              onClick={() => {
                setFocusRunning(false);
                setFocusSeconds(300);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 font-semibold text-xs hover:bg-emerald-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
