import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Cat,
  Check,
  Clock,
  Dog,
  Droplets,
  Heart,
  Leaf,
  Lock,
  LogIn,
  Moon,
  PawPrint,
  PhoneCall,
  PhoneOff,
  Shield,
  Sparkles,
  Sprout,
  TreePine,
  User,
  Wind,
  type LucideIcon,
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

const MINDFUL_GOALS: Array<{
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}> = [
  {
    id: 'screentime',
    icon: PhoneOff,
    title: 'Less screen time',
    desc: 'Block distracting sites and pause endless feeds.',
  },
  {
    id: 'stress',
    icon: Wind,
    title: 'Stress & anxiety',
    desc: 'Box-breathing pauses with gentle check-ins.',
  },
  {
    id: 'habits',
    icon: Droplets,
    title: 'Self-care habits',
    desc: 'Hydrate, stretch, and nourish your companion.',
  },
  {
    id: 'journal',
    icon: BookOpen,
    title: 'Private journal',
    desc: 'Write freely behind your 4-digit PIN. No tracking.',
  },
  {
    id: 'sleep',
    icon: Moon,
    title: 'Restful sleep',
    desc: 'A digital sunset 30 minutes before bed.',
  },
];

const DAILY_PACES: Array<{
  id: 'casual' | 'regular' | 'dedicated';
  icon: LucideIcon;
  title: string;
  duration: string;
  tag?: string;
  desc: string;
}> = [
  {
    id: 'casual',
    icon: Sprout,
    title: 'Casual',
    duration: '5 min / day',
    desc: 'Light check-in, water, and one deep breath.',
  },
  {
    id: 'regular',
    icon: Leaf,
    title: 'Regular',
    duration: '15 min / day',
    tag: 'Recommended',
    desc: 'Breathing pause, journal entry, and a companion meal.',
  },
  {
    id: 'dedicated',
    icon: TreePine,
    title: 'Dedicated',
    duration: '30 min / day',
    desc: 'Full detox, deep reflections, and distraction shielding.',
  },
];

const WELCOME_HIGHLIGHTS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Shield, label: 'Blocks distractions' },
  { icon: Wind, label: 'Calms the mind' },
  { icon: Heart, label: 'Gentle self-care' },
];

const SOCIAL_PROVIDERS: Array<{
  id: 'google' | 'apple';
  label: string;
  fallbackName: string;
}> = [
  { id: 'google', label: 'Google', fallbackName: 'Google Guardian' },
  { id: 'apple', label: 'Apple', fallbackName: 'Apple Guardian' },
];

const FIELD_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#2d4d41] bg-slate-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#35805a]';

const LABEL_CLASS =
  'mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-emerald-300/80';

const StepHeading: React.FC<{
  title: string;
  subtitle: string;
  center?: boolean;
}> = ({ title, subtitle, center = false }) => (
  <div className={center ? 'mb-5 text-center' : 'mb-4 sm:mb-5'}>
    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-emerald-100 sm:text-xl">
      {title}
    </h2>
    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-emerald-300/80 sm:text-[13px]">
      {subtitle}
    </p>
  </div>
);

const PrimaryAction: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-auto w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#35805a] py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_2px_0_#2a6b4b] transition-all hover:bg-[#2a6b4b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0.5 dark:focus-visible:ring-offset-[#13221b] flex"
  >
    {children}
    <ArrowRight className="h-4 w-4" />
  </button>
);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-md select-none sm:p-4">
      {/* Container matching mobile / Duolingo-style dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hangin onboarding"
        className="relative my-auto flex max-h-[95vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xl dark:border-emerald-800/70 dark:bg-[#13221b] scrollbar-none sm:p-7"
      >
        {/* Top Stepper Indicator (when step > 0) */}
        {step > 0 && (
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((prev) => (prev > 1 ? (prev - 1 as any) : 0))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md text-xs font-bold text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] dark:hover:text-emerald-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s ? 'w-7 bg-[#35805a]' : step > s ? 'w-2 bg-[#35805a]/45' : 'w-2 bg-slate-200 dark:bg-emerald-900'
                  }`}
                />
              ))}
            </div>

            <span className="shrink-0 text-[11px] font-bold text-slate-400 tabular-nums dark:text-emerald-400/80">
              Step {step} of 4
            </span>
          </div>
        )}

        {/* STEP 0: WELCOME SPLASH */}
        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center sm:py-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-600 p-1.5 shadow-lg ring-4 ring-emerald-500/10"
            >
              <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-600/90 to-[#35805a] shadow-inner">
                <Leaf className="h-9 w-9 text-white" />
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>HANGIN</span>
            </div>

            {/* Official Tagline from Guide: "We hear you." */}
            <p className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              &ldquo;We hear you.&rdquo;
            </p>

            <h1 className="mt-1.5 text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-emerald-100 sm:text-[28px]">
              Your mindful sanctuary
            </h1>

            <p className="mt-2 max-w-[19rem] text-[13px] leading-relaxed text-slate-600 dark:text-emerald-300/80">
              A quiet space for your screen, your mind, and your daily habits.
            </p>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {WELCOME_HIGHLIGHTS.map((item) => (
                <li
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-200"
                >
                  <item.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-6 w-full">
              <PrimaryAction onClick={() => setStep(1)}>Get Started</PrimaryAction>
            </div>
          </div>
        )}

        {/* STEP 1: PICK COMPANION (Habi the Dog or Muning the Cat) */}
        {step === 1 && (
          <div className="my-2 flex flex-1 flex-col text-center">
            <StepHeading
              center
              title="Pick your companion"
              subtitle="Piliin ang tahimik na kaibigan mong magbabantay sa'yo."
            />

            {/* Mascot Preview that Jumps with Excitement */}
            <div className="relative mx-auto mb-6 h-36 w-36">
              <div className="absolute inset-1 rounded-full bg-emerald-200/60 blur-2xl dark:bg-emerald-900/40" />
              <div className="relative h-full w-full drop-shadow-md">
                <CuteCompanion
                  species={species}
                  mood={petExcited ? 'excited' : 'happy'}
                  size="md"
                  interactive={true}
                />
              </div>
            </div>

            {/* Animal Choice Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {/* Dog Card (Habi) */}
              <button
                type="button"
                onClick={() => handleSelectSpecies('dog')}
                aria-pressed={species === 'dog'}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                  species === 'dog'
                    ? 'border-[#35805a] bg-emerald-50 shadow-md ring-2 ring-[#35805a]/25 dark:bg-emerald-950/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-emerald-800/80 dark:bg-[#13221b] dark:hover:border-emerald-600'
                }`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
                    species === 'dog'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-emerald-950/70 dark:text-emerald-400'
                  }`}
                >
                  <Dog className="h-6 w-6" />
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-emerald-100">
                  Habi the Dog
                </span>
                <span className="text-[11px] leading-snug text-slate-500 dark:text-emerald-400">
                  Loyal, warm &amp; encouraging
                </span>
                {species === 'dog' && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#35805a] text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Cat Card (Muning) */}
              <button
                type="button"
                onClick={() => handleSelectSpecies('cat')}
                aria-pressed={species === 'cat'}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                  species === 'cat'
                    ? 'border-[#35805a] bg-emerald-50 shadow-md ring-2 ring-[#35805a]/25 dark:bg-emerald-950/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-emerald-800/80 dark:bg-[#13221b] dark:hover:border-emerald-600'
                }`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
                    species === 'cat'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-emerald-950/70 dark:text-emerald-400'
                  }`}
                >
                  <Cat className="h-6 w-6" />
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-emerald-100">
                  Muning the Cat
                </span>
                <span className="text-[11px] leading-snug text-slate-500 dark:text-emerald-400">
                  Calm, playful &amp; observant
                </span>
                {species === 'cat' && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#35805a] text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>

            <PrimaryAction onClick={handleNext}>
              Continue with {species === 'dog' ? 'Habi' : 'Muning'}
            </PrimaryAction>
          </div>
        )}

        {/* STEP 2: DAILY PACE SELECTION (Casual 5m / Regular 15m / Dedicated 30m) */}
        {step === 2 && (
          <div className="my-2 flex flex-1 flex-col">
            <StepHeading
              title="Set your daily pace"
              subtitle="Gaano katagal ang daily ritual mo? Pwede mong palitan anytime."
            />

            <div className="mb-5 space-y-2.5">
              {DAILY_PACES.map((pace) => {
                const isSelected = dailyPace === pace.id;
                return (
                  <button
                    key={pace.id}
                    type="button"
                    onClick={() => setDailyPace(pace.id)}
                    aria-pressed={isSelected}
                    className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#35805a] bg-emerald-50/70 shadow-md ring-2 ring-[#35805a]/25 dark:bg-emerald-950/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-emerald-800/80 dark:bg-[#13221b] dark:hover:border-emerald-600'
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
                          : 'bg-slate-100 text-slate-400 dark:bg-emerald-950/70 dark:text-emerald-400'
                      }`}
                    >
                      <pace.icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-emerald-100">
                            {pace.title}
                          </span>
                          {pace.tag && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                              {pace.tag}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#35805a] dark:text-emerald-400">
                          <Clock className="h-3 w-3" />
                          {pace.duration}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-emerald-400/90">
                        {pace.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <PrimaryAction onClick={handleNext}>Confirm pace</PrimaryAction>
          </div>
        )}

        {/* STEP 3: MINDFUL GOALS SURVEY (Multi-select logical checkboxes) */}
        {step === 3 && (
          <div className="my-2 flex flex-1 flex-col">
            <div className="mb-4 flex items-start justify-between gap-3">
              <StepHeading
                title="Your mindful goals"
                subtitle="Check what fits you. One or all &mdash; it shapes your daily habits."
              />
              <button
                type="button"
                onClick={handleSelectAllGoals}
                className="mt-0.5 shrink-0 cursor-pointer rounded-md text-[11px] font-bold text-emerald-600 underline-offset-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] dark:text-emerald-400"
              >
                {selectedGoals.length === MINDFUL_GOALS.length ? 'Reset' : 'Select all'}
              </button>
            </div>

            <div className="mb-4 space-y-2">
              {MINDFUL_GOALS.map((goal) => {
                const isChecked = selectedGoals.includes(goal.id);
                return (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoal(goal.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                      isChecked
                        ? 'border-[#35805a] bg-emerald-50/70 shadow-xs dark:bg-emerald-950/50'
                        : 'border-slate-200 bg-white dark:border-emerald-800/80 dark:bg-[#13221b]'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                        isChecked
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
                          : 'bg-slate-100 text-slate-400 dark:bg-emerald-950/70 dark:text-emerald-400'
                      }`}
                    >
                      <goal.icon className="h-[18px] w-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-snug text-slate-900 dark:text-emerald-100">
                        {goal.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-emerald-400/90">
                        {goal.desc}
                      </p>
                    </div>

                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                        isChecked
                          ? 'border-[#35805a] bg-[#35805a] text-white'
                          : 'border-slate-300 dark:border-[#2d4d41]'
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <PrimaryAction onClick={handleNext}>
              Continue ({selectedGoals.length} selected)
            </PrimaryAction>
          </div>
        )}

        {/* STEP 4: GUARDIAN PROFILE & 4-DIGIT PIN */}
        {step === 4 && (
          <div className="my-2 flex flex-1 flex-col">
            <StepHeading
              title="Create guardian profile"
              subtitle="Your name, your companion's name, and a private PIN."
            />

            <div className="mb-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-emerald-800 dark:bg-[#13221b]">
              {/* Display Name */}
              <div>
                <label htmlFor="onboarding-username" className={LABEL_CLASS}>
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Display name</span>
                </label>
                <input
                  id="onboarding-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Rhonzo, GentleWanderer"
                  className={FIELD_CLASS}
                />
              </div>

              {/* Companion's Name */}
              <div>
                <label htmlFor="onboarding-companion" className={LABEL_CLASS}>
                  <PawPrint className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Companion&rsquo;s name</span>
                </label>
                <input
                  id="onboarding-companion"
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder={species === 'dog' ? 'Habi' : 'Muning'}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Private 4-Digit PIN */}
              <div>
                <label htmlFor="onboarding-pin" className={LABEL_CLASS}>
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Private journal PIN</span>
                </label>
                <input
                  id="onboarding-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setPin(e.target.value.replace(/\D/g, ''));
                  }}
                  placeholder="4 digits"
                  className={`${FIELD_CLASS} text-center font-mono font-bold tracking-[0.5em]`}
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-rose-500 dark:text-rose-400">
                  {errorMessage}
                </p>
              )}

              {/* Social Login Options in Account Creation */}
              <div className="border-t border-slate-100 pt-3.5 dark:border-emerald-900/60">
                <span className="mb-2 block text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Link an account (optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SOCIAL_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        if (!username) setUsername(provider.fallbackName);
                        handleFinalizeAccount(provider.id);
                      }}
                      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35805a] dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                    >
                      <LogIn className="h-3.5 w-3.5 text-slate-400 dark:text-emerald-400/70" />
                      {provider.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy & Safety */}
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50/70 px-3 py-2.5 dark:bg-emerald-950/40">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[11px] font-semibold leading-snug text-emerald-900/80 dark:text-emerald-200/90">
                  Your journal stays locked behind this PIN.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50/70 px-3 py-2.5 dark:bg-emerald-950/40">
                <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[11px] font-semibold leading-snug text-emerald-900/80 dark:text-emerald-200/90">
                  Kailangan ng kausap? Dial <span className="font-black">1553</span> &mdash;
                  libre, 24/7.
                </p>
              </div>
            </div>

            <PrimaryAction
              onClick={() => {
                setErrorMessage(null);

                if (!username.trim()) {
                  setErrorMessage("Please enter your display name.");
                  return;
                }

                if (!companionName.trim()) {
                  setErrorMessage("Please enter your companion's name.");
                  return;
                }

                if (!pin) {
                  setErrorMessage("Please create a 4-digit PIN.");
                  return;
                }

                if (pin.length !== 4) {
                  setErrorMessage("Your PIN must be exactly 4 digits.");
                  return;
                }

                handleNext();
              }}
            >
              Enter sanctuary
            </PrimaryAction>
          </div>
        )}
      </div>
    </div>
  );
};

