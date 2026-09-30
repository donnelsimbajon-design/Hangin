import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Award,
  ChevronDown,
  ChevronUp,
  Circle,
  Cloud,
  Gamepad2,
  Grid2x2,
  Leaf,
  Lock,
  LockOpen,
  MessageSquareHeart,
  Mic,
  Music4,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
  type LucideIcon,
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

const MINI_GAME_CHIPS: Array<{ label: string; title: string; icon: LucideIcon }> = [
  { label: 'Catch', title: 'Treat Catcher', icon: Apple },
  { label: 'Bubbles', title: 'Zen Bubble Pop', icon: Circle },
  { label: 'Laser', title: 'Laser & Yarn Chase', icon: Target },
  { label: 'Beats', title: 'Paw Rhythm Beats', icon: Music4 },
  { label: 'Jumper', title: 'Cloud Jumper', icon: Cloud },
  { label: 'Pairs', title: 'Zen Sanctuary Pairs', icon: Grid2x2 },
];

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
      icon: MessageSquareHeart,
      title: `Meet ${companionName}`,
      subtitle: 'Your companion, live in your sanctuary',
      description: `Tap ${companionName} for a warm hello, or open the chat anytime — replies stream in live, with voice and mic support.`,
      arrowCallout: 'Tap to pet, then say hello',
    },
    {
      id: 'wellness',
      category: 'CARE & 6 MINI-GAMES',
      tab: 'wellness' as const,
      icon: Gamepad2,
      title: 'Care & mini-games',
      subtitle: 'Feed, bathe & play 6 relaxing games',
      description: `Nurture ${companionName} with fruits and baths, then play 6 stress-relieving mini-games to earn Wellness Points.`,
      arrowCallout: 'Feed a snack & earn WP',
    },
    {
      id: 'community',
      category: 'SAFE HAVEN COMMUNITY',
      tab: 'community' as const,
      icon: Users,
      title: 'Safe Haven community',
      subtitle: 'h/gentleminds, h/smallwins & reflections',
      description:
        'A wholesome, algorithm-free haven for honest reflections, upvotes, and wholesome awards — without toxic metrics or doomscrolling.',
      arrowCallout: 'Upvote a kind thought',
    },
    {
      id: 'journal',
      category: 'ENCRYPTED PRIVATE JOURNAL',
      tab: 'journal' as const,
      icon: Lock,
      title: 'Private locked journal',
      subtitle: 'Protected behind your 4-digit PIN',
      description:
        'Your reflections belong to you alone — protected on your device by your PIN, with zero tracking or external snooping.',
      arrowCallout: 'Try any 4 digits',
    },
  ];

  const current = steps[currentStep];
  const CurrentIcon = current.icon;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b1411]/80 p-3 backdrop-blur-md select-none sm:p-5">
      {/* Centered Modal Card Container */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="App walkthrough"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
        className="relative my-auto flex max-h-[94vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl border border-emerald-200 bg-white p-5 shadow-2xl dark:border-emerald-800/70 dark:bg-[#13221b] sm:p-6"
      >
        {/* Top Header Row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#35805a]/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#35805a] dark:text-emerald-300">
              <Sparkles className="h-3 w-3 text-[#35805a]" />
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
            </span>
            <span className="hidden truncate text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-emerald-500 sm:inline">
              {current.category}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            title="Skip Walkthrough"
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] dark:hover:bg-emerald-950 dark:hover:text-emerald-200"
          >
            <span>Skip</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ==============================================================
            INTERACTIVE SPOTLIGHT SHOWCASE STAGE WITH GLOWING FOCUS & ARROW
            ============================================================== */}
        <div className="relative mb-4 flex min-h-[230px] w-full flex-col overflow-hidden rounded-2xl border border-emerald-400/50 bg-gradient-to-b from-emerald-950/50 to-emerald-900/30 p-4 shadow-[0_0_24px_rgba(63,143,104,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-radial from-[#35805a]/20 via-transparent to-transparent" />

          {/* Animated Bouncing Pointer + Callout Pill */}
          <div className="relative z-30 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="h-5 w-5 text-emerald-300 drop-shadow-md" strokeWidth={2.5} />
            </motion.div>

            <div className="flex items-center gap-1.5 rounded-full border border-[#35805a]/60 bg-[#0b1411]/80 px-2.5 py-1 text-center text-[10px] font-extrabold text-white shadow-sm backdrop-blur-xs">
              <CurrentIcon className="h-3 w-3 text-emerald-300" />
              {current.arrowCallout}
            </div>
          </div>

          {/* Stage Content */}
          <div className="relative z-10 mt-3 flex w-full flex-1 items-start justify-center">
            {/* STEP 1: COMPANION + LIVE AI CHAT SPOTLIGHT */}
            {currentStep === 0 && (
              <motion.div
                key="step-companion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex w-full max-w-xs flex-col items-center"
              >
                {/* Tappable Mascot */}
                <div
                  onClick={handlePetCompanion}
                  title="Tap to pet!"
                  className="group flex cursor-pointer flex-col items-center"
                >
                  <div className="h-24 w-24 drop-shadow-lg transition-transform active:scale-95 group-hover:scale-105">
                    <CuteCompanion
                      species={species}
                      mood={petHappy ? 'excited' : 'happy'}
                      size="sm"
                      interactive={true}
                      onPet={handlePetCompanion}
                    />
                  </div>
                  <span className="mt-0.5 rounded-full border border-amber-400/40 bg-[#0b1411]/60 px-2.5 py-0.5 text-[10px] font-black text-amber-300">
                    {companionName} &middot; {species === 'dog' ? 'Dog' : 'Cat'}
                  </span>
                </div>

                {/* Live Chat Preview */}
                <div className="mt-3 w-full rounded-2xl border border-emerald-500/50 bg-white/95 p-2.5 shadow-md dark:bg-[#182a22]">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#35805a]" />
                      <span>Live stream</span>
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-800 dark:text-purple-200">
                      <Mic className="h-2.5 w-2.5" />
                      Voice &amp; mic
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-[11px] leading-snug text-slate-800 dark:bg-[#13221b] dark:text-emerald-100">
                    <span className="mr-1 font-black text-[#35805a]">{companionName}:</span>
                    &ldquo;I&rsquo;m right here beside you. Take a soft breath...&rdquo;
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: WELLNESS CARE & MINI-GAMES SPOTLIGHT */}
            {currentStep === 1 && (
              <motion.div
                key="step-wellness"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xs"
              >
                <div className="grid grid-cols-3 gap-1.5">
                  {MINI_GAME_CHIPS.map((game) => (
                    <div
                      key={game.label}
                      title={game.title}
                      className="flex flex-col items-center gap-0.5 rounded-xl border border-emerald-500/40 bg-emerald-900/70 p-2 shadow-xs"
                    >
                      <game.icon className="h-4 w-4 text-emerald-300" />
                      <span className="text-[9px] font-bold text-emerald-200">{game.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleFeedTutorialSnack}
                  className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-amber-950 shadow-md transition-all hover:bg-amber-400 active:scale-95"
                >
                  <Apple className="h-3.5 w-3.5" />
                  <span>{hasFedSnack ? 'Fed! +10 WP' : 'Try feeding a snack'}</span>
                  {hasFedSnack && <Sparkles className="h-3 w-3" />}
                </button>
              </motion.div>
            )}

            {/* STEP 3: SAFE HAVEN COMMUNITY SPOTLIGHT */}
            {currentStep === 2 && (
              <motion.div
                key="step-community"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xs"
              >
                <div className="rounded-2xl border border-emerald-500/50 bg-white/95 p-3 text-left shadow-md dark:bg-[#13221b]/95">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <Leaf className="h-3 w-3 shrink-0" />
                    <span className="font-extrabold">h/gentleminds</span>
                    <span className="text-slate-400">&bull; 2h ago</span>
                  </div>
                  <p className="text-xs font-semibold leading-snug text-slate-800 dark:text-emerald-100">
                    &ldquo;Taking 5 minutes to breathe today changed my whole afternoon.&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                    <button
                      type="button"
                      onClick={handleUpvoteSample}
                      aria-label={`Upvote sample post, ${sampleUpvotes} upvotes`}
                      className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-all ${
                        hasUpvoted
                          ? 'bg-[#35805a] text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60'
                      }`}
                    >
                      <ChevronUp className="h-3 w-3 stroke-[3]" />
                      <span>{sampleUpvotes} upvotes</span>
                    </button>
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      <Award className="h-3 w-3" />
                      Wholesome Award
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PRIVATE LOCKED JOURNAL SPOTLIGHT */}
            {currentStep === 3 && (
              <motion.div
                key="step-journal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex flex-col items-center rounded-2xl border border-emerald-400/60 bg-emerald-950/90 p-3.5 shadow-lg">
                  <div
                    className={`mb-1.5 grid h-9 w-9 place-items-center rounded-full ${
                      isUnlockedSecret ? 'bg-emerald-500/25' : 'bg-amber-400/20'
                    }`}
                  >
                    {isUnlockedSecret ? (
                      <LockOpen className="h-4 w-4 stroke-[2.5] text-emerald-300" />
                    ) : (
                      <Lock className="h-4 w-4 stroke-[2.5] text-amber-300" />
                    )}
                  </div>

                  <span className="text-xs font-black text-emerald-100">
                    {isUnlockedSecret ? 'Reflection unlocked!' : 'Tap 4 digits to test the lock'}
                  </span>

                  <div className="mt-2 flex items-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full transition-all ${
                          enteredPin.length > i
                            ? 'bg-[#35805a] shadow-[0_0_10px_rgba(63,143,104,0.28)]'
                            : 'bg-emerald-800'
                        }`}
                      />
                    ))}
                  </div>

                  {!isUnlockedSecret ? (
                    <div className="mt-2.5 flex gap-2">
                      {['1', '2', '3', '4'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePinDigit(num)}
                          className="h-7 w-7 cursor-pointer rounded-lg bg-emerald-800 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="mt-2 text-[11px] font-bold text-amber-300">
                      &ldquo;You are doing better than you know.&rdquo;
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Feature Title & Subtitle */}
        <div className="mb-2 flex items-start gap-2.5">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CurrentIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight text-slate-900 dark:text-emerald-100 sm:text-xl">
              {current.title}
            </h2>
            <p className="mt-0.5 text-xs font-bold text-[#35805a] dark:text-emerald-400">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Feature Description */}
        <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-emerald-300">
          {current.description}
        </p>

        {/* Progress Dots Indicator */}
        <div className="mb-5 flex items-center justify-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setCurrentStep(idx);
                if (onSelectTab) onSelectTab(steps[idx].tab);
              }}
              title={`Go to step ${idx + 1}`}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                idx === currentStep
                  ? 'w-7 bg-[#35805a]'
                  : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-emerald-900 dark:hover:bg-emerald-800'
              }`}
            />
          ))}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 dark:border-emerald-900/60">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex cursor-pointer items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-[#35805a] px-5 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-[#2a6b4b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0.5 dark:focus-visible:ring-offset-[#13221b]"
          >
            <span>
              {currentStep === steps.length - 1 ? 'Enter Sanctuary' : 'Next Step'}
            </span>
            {currentStep === steps.length - 1 ? (
              <Zap className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

