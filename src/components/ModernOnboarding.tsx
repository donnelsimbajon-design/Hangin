import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Shield,
  Lock,
  User,
  ArrowRight,
  Check,
  Compass,
  Smile,
  Clock,
  Flame,
} from 'lucide-react';
import { PetSpecies } from '../types';
import { CuteCompanion } from './CuteCompanion';
import confetti from 'canvas-confetti';

interface ModernOnboardingProps {
  onComplete: (data: {
    species: PetSpecies;
    companionName: string;
    userName: string;
    pin: string;
    mindfulGoals: string[];
    dailyPace?: 'casual' | 'regular' | 'dedicated';
  }) => void;
}

const MINDFUL_GOALS = [
  {
    id: 'screentime',
    icon: '📵',
    title: 'Reduce Screen Time & Doomscrolling',
    desc: 'Block addictive adult sites, pause infinite feeds, and regain mental focus.',
  },
  {
    id: 'stress',
    icon: '🧘',
    title: 'Relieve Daily Stress & Anxiety',
    desc: 'Take calming box-breathing pauses and receive empathetic check-ins.',
  },
  {
    id: 'habits',
    icon: '💧',
    title: 'Build Gentle Self-Care Habits',
    desc: 'Stay hydrated, stretch, and nourish your companion with healthy meals.',
  },
  {
    id: 'journal',
    icon: '🔒',
    title: 'Private Journaling & Reflection',
    desc: 'Write unfiltered thoughts behind your private 4-digit PIN with zero tracking.',
  },
  {
    id: 'sleep',
    icon: '🌙',
    title: 'Restful Sleep & Digital Sunset',
    desc: 'Power down devices 30 minutes before bed for deep, restorative sleep.',
  },
];

const DAILY_PACES = [
  {
    id: 'casual' as const,
    icon: '🌱',
    title: 'Casual Pace',
    duration: '5 min / day',
    desc: 'Light daily check-in, gentle hydration & single deep breath.',
  },
  {
    id: 'regular' as const,
    icon: '🌿',
    title: 'Regular Pace',
    duration: '15 min / day',
    tag: 'Recommended',
    desc: 'Box-breathing pause, private journal entry & companion nourishing meal.',
  },
  {
    id: 'dedicated' as const,
    icon: '🌳',
    title: 'Dedicated Pace',
    duration: '30 min / day',
    desc: 'Full digital detox, deep journal reflections & distraction shielding.',
  },
];

export const ModernOnboarding: React.FC<ModernOnboardingProps> = ({ onComplete }) => {
  // Step 0: Welcome Splash (Tagline: "We hear you.")
  // Step 1: Pick Companion (Habi the Dog / Muning the Cat)
  // Step 2: Set Daily Pace (Casual 5m / Regular 15m / Dedicated 30m)
  // Step 3: Mindful Goals Survey
  // Step 4: Guardian Profile & 4-Digit PIN
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Form states
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [petExcited, setPetExcited] = useState(false);
  const [dailyPace, setDailyPace] = useState<'casual' | 'regular' | 'dedicated'>('regular');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'screentime',
    'stress',
    'habits',
  ]);
  const [username, setUsername] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Animal selection with joyful excitement animation
  const handleSelectSpecies = (sp: PetSpecies) => {
    setSpecies(sp);
    setPetExcited(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setPetExcited(false), 1200);
  };

  // Goal selection logic
  const handleToggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      if (selectedGoals.length === 1) return;
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleSelectAllGoals = () => {
    if (selectedGoals.length === MINDFUL_GOALS.length) {
      setSelectedGoals(['stress']);
    } else {
      setSelectedGoals(MINDFUL_GOALS.map((g) => g.id));
    }
  };

  // Validation and submission
  const handleFinalizeAccount = (authProvider?: 'google' | 'apple') => {
    const finalUser = username.trim() || (authProvider ? `${authProvider.toUpperCase()}_User` : 'Guardian');
    const finalPet = companionName.trim() || (species === 'dog' ? 'Habi' : 'Muning');
    const finalPin = pin.length === 4 ? pin : '1234';

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
    });

    onComplete({
      species,
      companionName: finalPet,
      userName: finalUser,
      pin: finalPin,
      dailyPace,
      mindfulGoals: selectedGoals.length > 0 ? selectedGoals : ['stress', 'sleep'],
    });
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handleFinalizeAccount();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md select-none overflow-y-auto">
      {/* Container matching mobile / Duolingo-style dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f1d14] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/40 flex flex-col my-auto max-h-[95vh] overflow-y-auto scrollbar-none">
        
        {/* Top Stepper Indicator (when step > 0) */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStep((prev) => (prev > 1 ? (prev - 1 as any) : 0))}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s ? 'w-7 bg-[#58cc02]' : step > s ? 'w-2 bg-[#58cc02]' : 'w-2 bg-slate-200 dark:bg-emerald-900'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Step {step} of 4
            </span>
          </div>
        )}

        {/* STEP 0: WELCOME SPLASH */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 mb-5 rounded-3xl bg-gradient-to-tr from-[#58cc02] via-emerald-500 to-teal-600 p-1.5 shadow-[0_12px_28px_rgba(88,204,2,0.35)] flex items-center justify-center ring-4 ring-emerald-500/20"
            >
              <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-emerald-600/90 to-[#4cae02] flex items-center justify-center shadow-inner">
                <span className="text-4xl filter drop-shadow-md">🌿</span>
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>HANGIN</span>
            </div>

            {/* Official Tagline from Guide: "We hear you." */}
            <p className="text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-2">
              &ldquo;We hear you.&rdquo;
            </p>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-emerald-100 leading-tight mb-2.5">
              Your Mindful Digital Sanctuary
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-300/80 leading-relaxed mb-8 max-w-xs mx-auto">
              A serene companion app that calms your screen time, shields distractions, and nurtures gentle self-care habits.
            </p>

            {/* Direct Get Started Button */}
            <div className="w-full">
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: PICK COMPANION (Habi the Dog or Muning the Cat - Strictly NO Tarsier) */}
        {step === 1 && (
          <div className="flex-1 flex flex-col my-2 text-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-emerald-100 mb-1">
              Pick Your Companion
            </h2>
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 mb-5">
              Choose the gentle friend who will journey with you in your sanctuary!
            </p>

            {/* Mascot Preview that Jumps with Excitement */}
            <div className="w-36 h-36 mx-auto mb-5 filter drop-shadow-md">
              <CuteCompanion
                species={species}
                mood={petExcited ? 'excited' : 'happy'}
                size="md"
                interactive={true}
              />
            </div>

            {/* Animal Choice Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Dog Card (Habi) */}
              <button
                onClick={() => handleSelectSpecies('dog')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center ${
                  species === 'dog'
                    ? 'border-[#58cc02] bg-emerald-50 dark:bg-emerald-950/60 shadow-md ring-2 ring-[#58cc02]/30'
                    : 'border-slate-200 dark:border-emerald-800/80 bg-white dark:bg-[#112017] hover:border-slate-300'
                }`}
              >
                <span className="text-3xl mb-1">🐶</span>
                <span className="text-sm font-black text-slate-900 dark:text-emerald-100">
                  Habi the Dog
                </span>
                <span className="text-[11px] text-slate-500 dark:text-emerald-400">
                  Loyal, warm & encouraging
                </span>
                {species === 'dog' && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-full bg-[#58cc02] text-white text-[10px] font-extrabold uppercase">
                    Selected
                  </span>
                )}
              </button>

              {/* Cat Card (Muning) */}
              <button
                onClick={() => handleSelectSpecies('cat')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center ${
                  species === 'cat'
                    ? 'border-[#58cc02] bg-emerald-50 dark:bg-emerald-950/60 shadow-md ring-2 ring-[#58cc02]/30'
                    : 'border-slate-200 dark:border-emerald-800/80 bg-white dark:bg-[#112017] hover:border-slate-300'
                }`}
              >
                <span className="text-3xl mb-1">🐱</span>
                <span className="text-sm font-black text-slate-900 dark:text-emerald-100">
                  Muning the Cat
                </span>
                <span className="text-[11px] text-slate-500 dark:text-emerald-400">
                  Calm, playful & observant
                </span>
                {species === 'cat' && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-full bg-[#58cc02] text-white text-[10px] font-extrabold uppercase">
                    Selected
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 transition-all mt-auto"
            >
              <span>CONTINUE WITH {species === 'dog' ? 'HABI' : 'MUNING'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: DAILY PACE SELECTION (From Guide: Casual 5m, Regular 15m, Dedicated 30m) */}
        {step === 2 && (
          <div className="flex-1 flex flex-col my-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-emerald-100 mb-1">
              Set Your Daily Pace
            </h2>
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 mb-4">
              How much time would you like to dedicate to your mental wellness sanctuary each day?
            </p>

            <div className="space-y-3 mb-5">
              {DAILY_PACES.map((pace) => {
                const isSelected = dailyPace === pace.id;
                return (
                  <button
                    key={pace.id}
                    type="button"
                    onClick={() => setDailyPace(pace.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#58cc02] bg-emerald-50/70 dark:bg-emerald-950/50 shadow-md ring-2 ring-[#58cc02]/30'
                        : 'border-slate-200 dark:border-emerald-800/80 bg-white dark:bg-[#112017] hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{pace.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 dark:text-emerald-100">
                          {pace.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {pace.tag && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase">
                              {pace.tag}
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-[#58cc02]">
                            {pace.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-emerald-400/90 mt-1 leading-snug">
                        {pace.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 transition-all mt-auto"
            >
              <span>CONFIRM PACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: MINDFUL GOALS SURVEY (Multi-select logical checkboxes) */}
        {step === 3 && (
          <div className="flex-1 flex flex-col my-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-emerald-100">
                Your Mindful Goals
              </h2>
              <button
                onClick={handleSelectAllGoals}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {selectedGoals.length === MINDFUL_GOALS.length ? 'Reset' : 'Select All'}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 mb-3">
              Check all that apply to you. Choose 1 or all; these will shape your sanctuary habits:
            </p>

            <div className="space-y-2 mb-4">
              {MINDFUL_GOALS.map((goal) => {
                const isChecked = selectedGoals.includes(goal.id);
                return (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoal(goal.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'border-[#58cc02] bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs'
                        : 'border-slate-200 dark:border-emerald-800/80 bg-white dark:bg-[#112017]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center text-xs font-bold transition-colors ${
                        isChecked
                          ? 'bg-[#58cc02] text-white'
                          : 'border-2 border-slate-300 dark:border-emerald-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-emerald-100">
                        <span>{goal.icon}</span>
                        <span>{goal.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-emerald-400/90 mt-0.5 leading-snug">
                        {goal.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 transition-all mt-auto"
            >
              <span>CONTINUE ({selectedGoals.length} SELECTED)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: GUARDIAN PROFILE & 4-DIGIT PIN */}
        {step === 4 && (
          <div className="flex-1 flex flex-col my-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-emerald-100 mb-1">
              Create Guardian Profile
            </h2>
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 mb-4">
              Decide your personal name, pet's name, and your own private 4-digit PIN:
            </p>

            <div className="space-y-3.5 bg-white dark:bg-[#112017] p-4 rounded-2xl border-2 border-slate-200 dark:border-emerald-800 mb-4 shadow-sm">
              {/* Display Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Your Display Name</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Rhonzo, GentleWanderer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700 bg-slate-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs font-medium focus:ring-2 focus:ring-[#58cc02] focus:outline-none"
                />
              </div>

              {/* Companion's Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center gap-1.5 mb-1">
                  <span>🐾 Companion's Name</span>
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder={species === 'dog' ? 'Habi' : 'Muning'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700 bg-slate-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs font-medium focus:ring-2 focus:ring-[#58cc02] focus:outline-none"
                />
              </div>

              {/* Private 4-Digit PIN */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Private Journal 4-Digit PIN</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    User decided
                  </span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setPin(e.target.value.replace(/\D/g, ''));
                  }}
                  placeholder="Choose your 4 digits (e.g. 7824)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700 bg-slate-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs font-mono tracking-widest text-center focus:ring-2 focus:ring-[#58cc02] focus:outline-none font-bold"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-rose-500 dark:text-rose-400">
                  {errorMessage}
                </p>
              )}

              {/* Social Login Options in Account Creation */}
              <div className="pt-1 border-t border-slate-100 dark:border-emerald-900/60">
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5 text-center">
                  Link with Google or Apple (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!username) setUsername('Google Guardian');
                      handleFinalizeAccount('google');
                    }}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                  >
                    <span>🇬</span>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!username) setUsername('Apple Guardian');
                      handleFinalizeAccount('apple');
                    }}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-950/40 text-slate-800 dark:text-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                  >
                    <span>🍎</span>
                    <span>Apple</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 transition-all mt-auto"
            >
              <span>ENTER SANCTUARY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
