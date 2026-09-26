import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Shield,
  Check,
  ArrowRight,
  Clock,
  Lock,
  PhoneCall,
  RotateCcw,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetSpecies } from '../types';
import { CuteCompanion } from './CuteCompanion';
import { getPhilippineTime } from '../utils/timeUtils';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    species: PetSpecies;
    companionName: string;
    pin: string;
    intentions: string[];
    username?: string;
  }) => void;
  defaultSpecies?: PetSpecies;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  defaultSpecies = 'dog',
}) => {
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState<PetSpecies>(defaultSpecies);
  const [companionName, setCompanionName] = useState('Habi');
  const [username, setUsername] = useState('GentleWanderer');
  const [pin, setPin] = useState('1234');
  const [screenTimeIssue, setScreenTimeIssue] = useState('Often distracted by doomscrolling');
  const [intentions, setIntentions] = useState<string[]>([
    'Reduce screen anxiety',
    'Gentle daily habits',
    'Private reflective journaling',
  ]);

  // 5-Press Reveal State
  const [pressCount, setPressCount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealWobble, setRevealWobble] = useState(false);

  const phTime = getPhilippineTime();

  if (!isOpen) return null;

  const intentionOptions = [
    'Reduce screen anxiety & doomscrolling',
    'Gentle daily habits & mindfulness',
    'Mindful breathing & grounding exercises',
    'Private reflective journaling',
    'Compassionate peer support in Community',
    'Safe 24/7 crisis hotline access',
  ];

  const handleMysteryPress = () => {
    if (isRevealed) return;

    const nextCount = pressCount + 1;
    setPressCount(nextCount);
    setRevealWobble(true);
    setTimeout(() => setRevealWobble(false), 300);

    if (nextCount >= 5) {
      // 5th tap: Burst & Reveal!
      setIsRevealed(true);
      // Pick random initial species or cycle based on time/luck
      const chosenSpecies: PetSpecies = Math.random() > 0.5 ? 'dog' : 'cat';
      setSpecies(chosenSpecies);
      setCompanionName(chosenSpecies === 'dog' ? 'Habi' : 'Muning');

      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'],
      });
    }
  };

  const handleResetReveal = () => {
    setPressCount(0);
    setIsRevealed(false);
  };

  const toggleIntention = (item: string) => {
    if (intentions.includes(item)) {
      setIntentions(intentions.filter((i) => i !== item));
    } else {
      setIntentions([...intentions, item]);
    }
  };

  const handleFinish = () => {
    confetti({ particleCount: 70, spread: 80 });
    onComplete({
      species,
      companionName: companionName.trim() || (species === 'dog' ? 'Habi' : 'Muning'),
      username: username.trim() || 'GentleWanderer',
      pin: pin.length === 4 ? pin : '1234',
      intentions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121f17] border border-emerald-100 dark:border-emerald-800 p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* =========================================================
            STEP 1: 5-PRESS MYSTERY REVEAL COMPANION
            ========================================================= */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            {/* Philippine Time Header Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2 shadow-2xs">
              <span>🇵🇭</span>
              <span>{phTime.greeting.tagalog}!</span>
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                &bull; {phTime.timeFullStr}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50">
              {isRevealed ? 'Meet Your Sanctuary Companion!' : 'Tap 5 Times to Reveal Your Companion'}
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 max-w-sm leading-relaxed">
              {isRevealed
                ? `You revealed a gentle ${species === 'dog' ? 'Golden Dog' : 'Calico Cat'}! You can keep them or switch anytime.`
                : 'Press the glowing sanctuary mystery basket 5 times to reveal if you unlock the Dog or Cat!'}
            </p>

            {/* REVEAL STAGE */}
            <div className="w-full h-56 sm:h-60 my-4 rounded-3xl bg-gradient-to-b from-[#eaf4eb] via-[#d8ebdb] to-[#c6e5cb] dark:from-[#15271d] dark:to-[#0f1d15] border border-emerald-200/80 dark:border-emerald-800/40 relative overflow-hidden flex flex-col items-center justify-center p-4">
              <AnimatePresence mode="wait">
                {!isRevealed ? (
                  /* MYSTERY 5-PRESS EGG / BASKET */
                  <motion.div
                    key="mystery-box"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: revealWobble ? 1.12 : 1,
                      rotate: revealWobble ? [-6, 6, -4, 4, 0] : [0, 1.5, -1.5, 0],
                      opacity: 1,
                    }}
                    exit={{ scale: 1.25, opacity: 0 }}
                    transition={{
                      rotate: { duration: revealWobble ? 0.3 : 3, repeat: revealWobble ? 1 : Infinity },
                    }}
                    onClick={handleMysteryPress}
                    className="relative flex flex-col items-center justify-center cursor-pointer group select-none"
                  >
                    {/* Glowing Aura */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl transition-all duration-300 pointer-events-none"
                      style={{
                        backgroundColor:
                          pressCount === 4
                            ? 'rgba(245, 158, 11, 0.45)'
                            : pressCount >= 2
                            ? 'rgba(16, 185, 129, 0.35)'
                            : 'rgba(16, 185, 129, 0.15)',
                        transform: `scale(${1 + pressCount * 0.15})`,
                      }}
                    />

                    {/* Mystery Basket / Egg Graphic */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-xl">
                        <defs>
                          <radialGradient id="eggGrad" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" stopColor="#FEF3C7" />
                            <stop offset="60%" stopColor="#FDE68A" />
                            <stop offset="100%" stopColor="#D97706" />
                          </radialGradient>
                          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#047857" />
                          </linearGradient>
                        </defs>

                        {/* Shadow */}
                        <ellipse cx="70" cy="126" rx="42" ry="10" fill="#064E3B" opacity="0.25" />

                        {/* Golden Mystery Egg / Basket Body */}
                        <path
                          d="M 70 18 C 38 18 24 58 24 88 C 24 112 44 124 70 124 C 96 124 116 112 116 88 C 116 58 102 18 70 18 Z"
                          fill="url(#eggGrad)"
                          stroke="#B45309"
                          strokeWidth="3"
                        />

                        {/* Philippine Hanging Leaf & Bamboo Patterns */}
                        <path
                          d="M 44 80 Q 70 70 96 80 Q 70 90 44 80 Z"
                          fill="#F59E0B"
                          opacity="0.6"
                        />
                        <path
                          d="M 50 56 Q 70 48 90 56 Q 70 64 50 56 Z"
                          fill="#F59E0B"
                          opacity="0.6"
                        />

                        {/* Ribbon Ties */}
                        <path
                          d="M 70 18 L 70 124"
                          stroke="url(#ribbonGrad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 26 88 L 114 88"
                          stroke="url(#ribbonGrad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />

                        {/* Glowing Cracks based on press count */}
                        {pressCount >= 1 && (
                          <path
                            d="M 68 45 L 76 56 L 66 66 L 74 78"
                            stroke="#FFFBEB"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                        )}
                        {pressCount >= 2 && (
                          <path
                            d="M 85 60 L 98 68 L 92 80"
                            stroke="#FFFBEB"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                        )}
                        {pressCount >= 3 && (
                          <path
                            d="M 46 72 L 36 84 L 48 95"
                            stroke="#FFFBEB"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                        )}
                        {pressCount >= 4 && (
                          <circle cx="70" cy="80" r="14" fill="#FFFFFF" opacity="0.85" />
                        )}

                        {/* Cute Ribbon Bow on Top */}
                        <g>
                          <ellipse cx="58" cy="22" rx="12" ry="7" fill="#10B981" stroke="#047857" strokeWidth="2" />
                          <ellipse cx="82" cy="22" rx="12" ry="7" fill="#10B981" stroke="#047857" strokeWidth="2" />
                          <circle cx="70" cy="22" r="5" fill="#34D399" />
                        </g>
                      </svg>
                    </div>

                    {/* Dynamic Press Progress Button */}
                    <div className="mt-2 flex flex-col items-center">
                      <div className="px-4 py-1.5 rounded-full bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        <span>
                          {pressCount === 0 && 'Tap 1 of 5 to Crack!'}
                          {pressCount === 1 && 'Tap 2 of 5! (Wobbling...) ✨'}
                          {pressCount === 2 && 'Tap 3 of 5! (Cracking...) 💫'}
                          {pressCount === 3 && 'Tap 4 of 5! (Almost there!) 🐾'}
                          {pressCount === 4 && 'LAST TAP! Tap to Hatch! 🌟'}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
                        Click / Tap basket directly ({pressCount}/5 presses)
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  /* REVEALED COMPANION */
                  <motion.div
                    key="revealed-pet"
                    initial={{ scale: 0.6, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 14 }}
                    className="relative flex flex-col items-center justify-center"
                  >
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[11px] shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>REVEALED: {species === 'dog' ? '🐶 GOLDEN DOG' : '🐱 CALICO CAT'}</span>
                    </div>

                    <CuteCompanion
                      species={species}
                      mood="happy"
                      equipped={{ hat: null, glasses: false, scarf: false, collar: true }}
                      interactive={true}
                      size="md"
                    />

                    {/* Re-roll / Retest 5-press reveal */}
                    <button
                      onClick={handleResetReveal}
                      className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-try 5-Tap Hatching</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Once revealed, allow species toggle and companion name */}
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-3"
              >
                {/* Species Choice Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setSpecies('dog');
                      if (companionName === 'Muning') setCompanionName('Habi');
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      species === 'dog'
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm font-bold'
                        : 'bg-emerald-50 dark:bg-[#182a1f] text-emerald-900 dark:text-emerald-200 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="text-xl">🐶</span>
                    <div className="text-left">
                      <div className="text-xs font-black">Golden Dog</div>
                      <div className="text-[10px] opacity-80">Loyal &amp; joyful</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSpecies('cat');
                      if (companionName === 'Habi') setCompanionName('Muning');
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      species === 'cat'
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm font-bold'
                        : 'bg-emerald-50 dark:bg-[#182a1f] text-emerald-900 dark:text-emerald-200 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="text-xl">🐱</span>
                    <div className="text-left">
                      <div className="text-xs font-black">Calico Cat</div>
                      <div className="text-[10px] opacity-80">Gentle &amp; calm</div>
                    </div>
                  </button>
                </div>

                {/* Companion Name Field */}
                <div className="w-full text-left">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                    Name your companion:
                  </label>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="Give your friend a name..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-[#182a1f] border border-emerald-200 dark:border-emerald-800 text-sm font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-emerald-600"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-2xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue: Wellbeing &amp; Habit Survey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 2: MENTAL HEALTH & WELLBEING SURVEY
            ========================================================= */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Step 2 of 3 &bull; Wellbeing Survey
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Personalized for You
              </span>
            </div>

            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50 mb-1">
              How can Hangin support your mind?
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4 leading-relaxed">
              We shape your daily pacing and companion suggestions based on how you feel.
            </p>

            {/* Screen Time Anxiety Question */}
            <div className="mb-4">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1.5">
                How does your digital screen time feel lately?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Overwhelmed by news/feeds',
                  'Often distracted by doomscrolling',
                  'Lonely & looking for grounding',
                  'Need a peaceful quiet space',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setScreenTimeIssue(item)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-colors cursor-pointer ${
                      screenTimeIssue === item
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-emerald-50/60 dark:bg-[#182a1f] border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Intentions Checklist */}
            <div className="mb-5">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1.5">
                Select your wellness intentions:
              </label>
              <div className="space-y-2">
                {intentionOptions.map((opt) => {
                  const isSelected = intentions.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleIntention(opt)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-[#182a1f] border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold'
                          : 'bg-white dark:bg-[#14231a] border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      <span className="text-xs">{opt}</span>
                      <div
                        className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border ${
                          isSelected
                            ? 'bg-emerald-700 border-emerald-800 text-white'
                            : 'border-emerald-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next: Account &amp; Privacy PIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: ACCOUNT CREATION & PRIVACY PIN
            ========================================================= */}
        {step === 3 && (
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
              Step 3 of 3 &bull; Account &amp; Privacy
            </span>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-50 mb-1">
              Create Your Sanctuary Profile
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4 leading-relaxed">
              Your entries and journal stay completely private on your device.
            </p>

            {/* Display Name Input */}
            <div className="w-full text-left mb-4">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                Your Community / Display Name:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a screen name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-[#182a1f] border border-emerald-200 dark:border-emerald-800 text-sm font-semibold text-emerald-950 dark:text-emerald-100 focus:outline-emerald-600"
              />
            </div>

            {/* Private Journal PIN */}
            <div className="w-full text-left mb-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-[#14261b] border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                <label className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  4-Digit Private Journal PIN:
                </label>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mb-2">
                Locks your private mood diary. Default: <span className="font-mono font-bold">1234</span>
              </p>
              <div className="max-w-[180px]">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.8em] text-2xl py-2 rounded-xl bg-white dark:bg-[#0d1811] border border-emerald-300 dark:border-emerald-700 font-black text-emerald-950 dark:text-emerald-100 focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* 24/7 Crisis Hotline Notice */}
            <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-left mb-5 flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-rose-950 dark:text-rose-200 leading-snug">
                <span className="font-bold">24/7 Lifeline Support:</span> In crisis or need immediate help? Philippine NCMH Crisis Hotline: <span className="font-bold font-mono">1553</span> or <span className="font-bold font-mono">0917-899-8727</span>. Global: <span className="font-bold font-mono">988</span>.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-2xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Enter Sanctuary With {companionName}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
