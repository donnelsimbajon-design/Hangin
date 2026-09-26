import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Heart,
  Users,
  Lock,
  Smile,
  ShieldCheck,
  CheckCircle,
  MessageSquareHeart,
  Gamepad2,
  Mic,
  Zap,
} from 'lucide-react';
import { PetSpecies } from '../types';
import { CuteCompanion } from './CuteCompanion';
import confetti from 'canvas-confetti';

interface AppSpotlightTutorialProps {
  species: PetSpecies;
  companionName: string;
  onFinish: () => void;
  onSelectTab?: (tab: 'home' | 'wellness' | 'community' | 'journal' | 'account') => void;
}

export const AppSpotlightTutorial: React.FC<AppSpotlightTutorialProps> = ({
  species,
  companionName,
  onFinish,
  onSelectTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [petHappy, setPetHappy] = useState(false);
  const [hasFedSnack, setHasFedSnack] = useState(false);
  const [sampleUpvotes, setSampleUpvotes] = useState(42);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [enteredPin, setEnteredPin] = useState<string[]>([]);
  const [isUnlockedSecret, setIsUnlockedSecret] = useState(false);

  const steps = [
    {
      id: 'companion',
      category: 'SANCTUARY & COMPANION',
      tab: 'home' as const,
      title: `Meet ${companionName}`,
      subtitle: 'Your loyal, warm & grounding friend',
      description: `Your companion lives on the peaceful grassy hilltop. Touch their body to see them smile, wag their tail or purr, and check in daily to share quiet warmth.`,
      arrowCallout: 'Tap pet to share gentle warmth & purrs! 🐾',
    },
    {
      id: 'live-ai',
      category: 'LIVE AI CHATBOT',
      tab: 'home' as const,
      title: 'Live Conversational AI Companion',
      subtitle: 'Streaming token-by-token with voice support',
      description: `Talk to ${companionName} anytime! Powered by Google Gemini 3 Flash with real-time live streaming, soothing voice speech synthesis, and live microphone input.`,
      arrowCallout: 'Live streaming empathetic chat with voice! ⚡',
    },
    {
      id: 'wellness',
      category: 'CARE & 6 MINI-GAMES',
      tab: 'wellness' as const,
      title: 'Wellness Care & Arcade Games',
      subtitle: 'Feed snacks, bubble baths, & play 6 mini-games',
      description: `Nurture ${companionName} with nutritious fruits and baths. Play 6 stress-relieving mini-games (Treat Catcher, Bubble Pop, Laser Chase, Simon Melody, Cloud Jumper, Pairs) to earn Wellness Points (WP)!`,
      arrowCallout: 'Feed snacks & play arcade games for WP! 🎮',
    },
    {
      id: 'community',
      category: 'SAFE HAVEN COMMUNITY',
      tab: 'community' as const,
      title: 'Cozy Reddit-Style Safe Haven',
      subtitle: 'Explore h/gentleminds, h/smallwins, & reflections',
      description: `A wholesome, algorithm-free haven. Share honest reflections, upvote calming thoughts, and grant wholesome awards without toxic metrics or doomscrolling.`,
      arrowCallout: 'Wholesome reflections with upvotes & awards! 🌸',
    },
    {
      id: 'journal',
      category: 'ENCRYPTED PRIVATE JOURNAL',
      tab: 'journal' as const,
      title: 'Private Locked Reflection Journal',
      subtitle: 'Protected behind your custom 4-digit PIN',
      description: `Your personal reflections belong strictly to you. Encrypted directly on your device with your 4-digit PIN, with zero tracking or external snooping.`,
      arrowCallout: '100% private safe space behind your 4-digit PIN! 🔒',
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onSelectTab) {
        onSelectTab(steps[nextStep].tab);
      }
    } else {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      if (onSelectTab) onSelectTab('home');
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onSelectTab) {
        onSelectTab(steps[prevStep].tab);
      }
    }
  };

  const handleSkip = () => {
    if (onSelectTab) onSelectTab('home');
    onFinish();
  };

  const handlePetCompanion = () => {
    setPetHappy(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.5 },
    });
    setTimeout(() => setPetHappy(false), 1200);
  };

  const handleFeedTutorialSnack = () => {
    setHasFedSnack(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.55 },
    });
  };

  const handleUpvoteSample = () => {
    if (!hasUpvoted) {
      setHasUpvoted(true);
      setSampleUpvotes((v) => v + 1);
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.55 },
      });
    }
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = [...enteredPin, digit];
      setEnteredPin(next);
      if (next.length === 4) {
        setIsUnlockedSecret(true);
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.55 },
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      {/* Centered Modal Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-white dark:bg-[#0f1d14] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-2 border-emerald-500/50 flex flex-col my-auto max-h-[94vh] overflow-y-auto"
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#58cc02]/20 text-[#58cc02] dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#58cc02]" />
              <span>Step {currentStep + 1} of 5</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-emerald-500 uppercase tracking-tight hidden sm:inline">
              {current.category}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-emerald-950 transition-colors"
            title="Skip Walkthrough"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ==============================================================
            INTERACTIVE SPOTLIGHT SHOWCASE STAGE WITH GLOWING FOCUS & ARROW
            ============================================================== */}
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 p-4 border-2 border-[#58cc02] shadow-[0_0_30px_rgba(88,204,2,0.35)] overflow-hidden mb-4 min-h-[190px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-radial from-[#58cc02]/20 via-transparent to-transparent pointer-events-none" />

          {/* Animated Bouncing Pointer Arrow */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 z-30 flex flex-col items-center pointer-events-none"
          >
            <span className="text-2xl drop-shadow-md">👇</span>
          </motion.div>

          {/* Callout Pill */}
          <div className="absolute top-8 z-30 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs border border-[#58cc02]/60 text-white text-[10px] font-extrabold shadow-sm text-center">
            {current.arrowCallout}
          </div>

          {/* STEP 1: COMPANION SPOTLIGHT */}
          {currentStep === 0 && (
            <motion.div
              key="step-companion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 flex flex-col items-center cursor-pointer group"
              onClick={handlePetCompanion}
              title="Tap to pet!"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-lg transition-transform active:scale-95 group-hover:scale-105">
                <CuteCompanion
                  species={species}
                  mood={petHappy ? 'excited' : 'happy'}
                  size="md"
                  interactive={true}
                  onPet={handlePetCompanion}
                />
              </div>
              <span className="text-xs font-black text-amber-300 mt-1 bg-black/60 px-3 py-0.5 rounded-full border border-amber-400/40">
                {companionName} ({species === 'dog' ? '🐶 Dog' : '🐱 Cat'})
              </span>
            </motion.div>
          )}

          {/* STEP 2: LIVE AI CHATBOT SPOTLIGHT */}
          {currentStep === 1 && (
            <motion.div
              key="step-live-ai"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8 w-full max-w-xs flex flex-col items-center text-left"
            >
              <div className="w-full p-3 rounded-2xl bg-white/95 dark:bg-[#11231a] border border-emerald-500/50 shadow-md">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#58cc02] animate-pulse" />
                    <span>Live Gemini 3 Flash Stream</span>
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold">
                    🎙️ Voice Mic
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0c1811] text-xs text-slate-800 dark:text-emerald-100 leading-snug">
                  <span className="text-[#58cc02] font-black mr-1">{companionName}:</span>
                  "I'm right here beside you. Take a soft breath..."
                </div>
              </div>
              <div className="mt-2 text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-current" />
                <span>Real-time conversational streaming</span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: WELLNESS CARE & 6 MINI-GAMES SPOTLIGHT */}
          {currentStep === 2 && (
            <motion.div
              key="step-wellness"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8 w-full max-w-xs flex flex-col items-center"
            >
              <div className="grid grid-cols-4 gap-2 w-full text-center">
                <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-500/50 shadow-xs flex flex-col items-center">
                  <span className="text-2xl mb-0.5">🍎</span>
                  <span className="text-[10px] font-bold text-emerald-200">Catch</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-500/50 shadow-xs flex flex-col items-center">
                  <span className="text-2xl mb-0.5">🫧</span>
                  <span className="text-[10px] font-bold text-emerald-200">Bubbles</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-500/50 shadow-xs flex flex-col items-center">
                  <span className="text-2xl mb-0.5">🎵</span>
                  <span className="text-[10px] font-bold text-emerald-200">Simon</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-900/80 border border-emerald-500/50 shadow-xs flex flex-col items-center">
                  <span className="text-2xl mb-0.5">☁️</span>
                  <span className="text-[10px] font-bold text-emerald-200">Jumper</span>
                </div>
              </div>

              <button
                onClick={handleFeedTutorialSnack}
                className="mt-2.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <span>🍌</span>
                <span>{hasFedSnack ? 'Fed (+10 WP Awarded!) ✨' : 'Try Feeding Snack'}</span>
              </button>
            </motion.div>
          )}

          {/* STEP 4: SAFE HAVEN COMMUNITY SPOTLIGHT */}
          {currentStep === 3 && (
            <motion.div
              key="step-community"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8 w-full max-w-xs"
            >
              <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#112017]/95 border border-emerald-500/50 shadow-md text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  <span>🍃</span>
                  <span className="font-extrabold">h/gentleminds</span>
                  <span className="text-slate-400">&bull; 2h ago</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-emerald-100 leading-snug">
                  "Taking 5 minutes to breathe today changed my whole afternoon."
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                  <button
                    onClick={handleUpvoteSample}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                      hasUpvoted
                        ? 'bg-[#58cc02] text-white'
                        : 'bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100'
                    }`}
                  >
                    <span>▲ {sampleUpvotes} upvotes</span>
                  </button>
                  <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-300">
                    🌸 Wholesome Award
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: PRIVATE LOCKED JOURNAL SPOTLIGHT */}
          {currentStep === 4 && (
            <motion.div
              key="step-journal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex flex-col items-center text-center"
            >
              <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 shadow-lg flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mb-1">
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-black text-emerald-100">
                  {isUnlockedSecret ? '🔓 Reflection Unlocked!' : 'Tap 4 Digits to Test Lock:'}
                </span>

                <div className="flex items-center gap-2 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        enteredPin.length > i
                          ? 'bg-[#58cc02] shadow-[0_0_8px_#58cc02]'
                          : 'bg-emerald-800'
                      }`}
                    />
                  ))}
                </div>

                {!isUnlockedSecret ? (
                  <div className="flex gap-2 mt-2.5">
                    {['1', '2', '3', '4'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePinDigit(num)}
                        className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-300 font-bold mt-2">
                    "You are doing better than you know." 🌸
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Feature Title & Subtitle */}
        <div className="mb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-emerald-100 leading-tight">
            {current.title}
          </h2>
          <p className="text-xs font-bold text-[#58cc02] dark:text-emerald-400 mt-0.5">
            {current.subtitle}
          </p>
        </div>

        {/* Feature Description */}
        <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed mb-4">
          {current.description}
        </p>

        {/* Progress Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(idx);
                if (onSelectTab) onSelectTab(steps[idx].tab);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'w-7 bg-[#58cc02]'
                  : 'w-2 bg-slate-200 dark:bg-emerald-900 hover:bg-slate-300'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-emerald-900/60">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-950 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
          >
            <span>{currentStep === steps.length - 1 ? 'Enter Sanctuary' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
