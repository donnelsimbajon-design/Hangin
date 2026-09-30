import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  RefreshCw,
  MessageSquareHeart,
  Sun,
  Sunset,
  Moon,
  X,
  Target,
  Smartphone,
  Wind,
  Droplet,
  Lock,
  Smile,
  Leaf,
  CloudRain,
  Zap,
  Quote,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CuteCompanion } from './CuteCompanion';
import { ScenicBackdrop } from './ScenicBackdrop';
import {
  AFFIRMATION_LIBRARY,
  getTodayAffirmation,
} from './DailyAffirmationWidget';
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

/*
 * The mood-matched reflection copy that used to live here
 * (MOOD_REFLECTIONS / GENERIC_REFLECTIONS / MOOD_REFLECTION_LABELS and the
 * getReflectionsForMood resolver) has been removed. The companion's
 * follow-up bubble now speaks the shared Daily Affirmation from
 * DailyAffirmationWidget, so the sanctuary has one source of affirmation
 * text rather than two that could drift apart. No replacement copy was
 * written here — AFFIRMATION_LIBRARY is the only one.
 */

const goalLabels: Record<string, { icon: React.ElementType; label: string }> = {
  screentime: { icon: Smartphone, label: 'Reduce Doomscrolling' },
  stress: { icon: Wind, label: 'Relieve Stress & Anxiety' },
  habits: { icon: Droplet, label: 'Self-Care Habits' },
  journal: { icon: Lock, label: 'Private Journaling' },
  sleep: { icon: Moon, label: 'Rest & Sleep Hygiene' },
};

/**
 * Mood check-in categories. Selecting one logs the mood and starts the
 * companion conversation that ends in a matching reflection.
 */
const MOOD_OPTIONS: Array<{
  id: MoodLog['mood'];
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'happy', label: 'Happy', icon: Smile },
  { id: 'calm', label: 'Calm', icon: Leaf },
  { id: 'sad', label: 'Sad', icon: CloudRain },
  { id: 'tired', label: 'Tired', icon: Moon },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: Zap },
];

/**
 * Expressive shortcuts: these change how the companion looks and what it says,
 * without logging a mood check-in.
 */
const FEELING_OPTIONS: Array<{ id: PetAnimationMood; label: string }> = [
  { id: 'happy', label: 'Joyful' },
  { id: 'calm', label: 'Calm' },
  { id: 'sad', label: 'Comfort' },
  { id: 'tired', label: 'Sleepy' },
  { id: 'overwhelmed', label: 'Grounding' },
];

const FEELING_MESSAGES: Record<string, string[]> = {
  happy: [
    `*wags tail happily and pants with soft joyful bounce* I love seeing you happy! ☀️`,
    `*does a little joyful spin* Your smile just made my whole day brighter! 🌞`,
    `*ears perked up, eyes sparkling* This happiness looks so good on you. Let's savor it. 🌼`,
  ],
  calm: [
    `*breathes slowly with you, ears relaxed* Peaceful moments are so restorative. 🍃`,
    `*settles down beside you, calm and steady* This quiet is a gift. Let's stay here a while. 🌿`,
    `*soft, even breathing* Nothing to fix, nowhere to be. Just this gentle now. 🌊`,
  ],
  sad: [
    `*rests chin tenderly on your knee and gazes up warmly* I'm right here with you. It's okay. 🫂`,
    `*curls up close, quiet and steady* You don't have to explain it. I'm just staying near. 💛`,
    `*nuzzles gently* Sadness can visit without you having to fix it right away. I've got you. 🫂`,
  ],
  tired: [
    `*yawns softly and snuggles down* Take gentle rest. You've done well today. 🌙`,
    `*curls into a soft ball nearby* Your body is asking for rest. That's worth listening to. 😴`,
    `*slows down, voice hushed* Let today be enough. Tomorrow can wait for you to rest first. 🌙`,
  ],
  overwhelmed: [
    `*plants paws firmly, breathing in a steady 4-second box cadence* Breathe with me: in 2 3 4... out 2 3 4. You are safe. ⚓`,
    `*stays low and grounded beside you* One breath at a time. We don't have to solve everything now. 🌬️`,
    `*presses gently against your side, steady and unhurried* Let's shrink the moment down to just this breath. ⚓`,
  ],
};

const pickVariant = (pool: string[] | undefined, fallback: string): string =>
  pool?.[Math.floor(Math.random() * pool.length)] ?? fallback;


/**
 * Daily goal completions are scoped to the Philippine calendar date, so the
 * checklist clears itself the moment it rolls past 12:00 AM PHT.
 */
const DAILY_GOALS_STORAGE_PREFIX = 'hangin_daily_goals_';

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
  const [reactionText, setReactionText] = useState<string | null>(null);
  const [companionMood, setCompanionMood] = useState<PetAnimationMood>('excited');

  // The pet's affirmation, shown as a follow-up chat message once it
  // has answered a mood check-in. Minimizable so it never holds the scene.
  // A returning user (lastMood already logged) resumes straight on today's
  // Daily Affirmation.
  const [showAffirmation, setShowAffirmation] = useState(() => Boolean(lastMood));
  const [isAffirmationMinimized, setIsAffirmationMinimized] = useState(false);

  /*
   * The companion's follow-up message is today's Daily Affirmation, drawn
   * from the same library the Daily Affirmation widget renders — same date
   * mapping, same text, so the two surfaces can never disagree.
   *
   * It opens on today's entry (a returning user sees the bubble
   * immediately), and `currentQuoteIdx` steps through that library so the
   * existing "Next" control still cycles, exactly as it did across the
   * reflections it replaces.
   */
  const todayAffirmation = getTodayAffirmation();
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(
    () => AFFIRMATION_LIBRARY.indexOf(getTodayAffirmation())
  );
  const affirmation = AFFIRMATION_LIBRARY[currentQuoteIdx % AFFIRMATION_LIBRARY.length];

  // Pending mood check-in timers, so a new selection never races an old one.
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Today's completed mindful goals (checkbox task list).
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

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

  // Never let a queued conversation beat land after the scene is gone.
  useEffect(
    () => () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
    },
    []
  );

  const activePhase = phTime.phase;
  const doneCount = mindfulGoals.filter((g) => completedGoals.includes(g)).length;

  // Automatic 12:00 AM reset: `phTime.dateStr` is the PHT calendar date, so
  // crossing midnight switches the storage key and loads a fresh, empty day.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`${DAILY_GOALS_STORAGE_PREFIX}${phTime.dateStr}`);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setCompletedGoals(Array.isArray(parsed) ? (parsed as string[]) : []);
    } catch {
      setCompletedGoals([]);
    }
  }, [phTime.dateStr]);

  const handleToggleGoal = (goalId: string) => {
    setCompletedGoals((prev) => {
      const next = prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId];
      try {
        window.localStorage.setItem(
          `${DAILY_GOALS_STORAGE_PREFIX}${phTime.dateStr}`,
          JSON.stringify(next)
        );
      } catch {
        // Storage may be unavailable (private mode) — the list still works
        // for the current session.
      }
      return next;
    });
  };

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

    const responseVariants: Record<string, string[]> = {
      happy: [
        `Seeing you smile makes my heart flutter! Let's cherish this gentle joy today. ☀️`,
        `Your happiness is contagious right now. I'm soaking it in with you. 🌼`,
        `This lightness in you is worth noticing. Let's hold onto it a little longer. 🌸`,
      ],
      calm: [
        `That steady calm is such a gift. Let's hold onto this quiet peace together. 🌿`,
        `Calm looks good on you. Let's stay in this stillness a little longer. 🍃`,
        `Nothing urgent right now. Just this quiet, and you're safe in it. 🌊`,
      ],
      sad: [
        `I'm sitting right here beside you. It's okay to feel sad. You don't have to face it alone. 🫂`,
        `Whatever this sadness is carrying, you don't have to carry it alone right now. 💛`,
        `You don't need to explain it. I'm just staying close while you feel it. 🫂`,
      ],
      tired: [
        `You've been carrying so much. Please rest your eyes and breathe softly with me. 🌙`,
        `Tired is your body asking for gentleness. Let's slow down together. 😴`,
        `Rest isn't something you have to earn. Let today be enough. 🌙`,
      ],
      overwhelmed: [
        `Let's pause. Listen to the gentle breeze (Hangin). Right here, right now, you are safe. 🌬️`,
        `One thing at a time. We don't have to hold it all at once. ⚓`,
        `Let's shrink this moment down to just one breath. You're safe with me. ⚓`,
      ],
    };

    const variants = responseVariants[mood];
    const chosenResponse = pickVariant(
      variants,
      'Thank you for checking in with me! 💚'
    );

    setReactionText(chosenResponse);
    setShowMoodSelector(false);
    setShowAffirmation(false);
    setIsAffirmationMinimized(false);
    setIsBubbleDismissed(false);

    // Return to today's affirmation first, matching a fresh check-in.
    setCurrentQuoteIdx(AFFIRMATION_LIBRARY.indexOf(getTodayAffirmation()));

    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }

    reactionTimerRef.current = setTimeout(() => {
      setCompanionMood('idle');
      setReactionText(null);
      // The pet follows its reply with a mood-matched reflection, as one
      // more message in the same conversation.
      setShowAffirmation(true);
      setIsBubbleDismissed(false);
    }, 6000);
  };

  const handleOpenMoodCheckIn = () => {
    setShowMoodSelector(true);
    setShowAffirmation(false);
    setReactionText(null);
    setIsAffirmationMinimized(false);
    setIsBubbleDismissed(false);
    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
  };

  // Cycle through the Daily Affirmation library.
  const handleNextQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % AFFIRMATION_LIBRARY.length);
    setCompanionMood('happy');
    if (quoteTimerRef.current) {
      clearTimeout(quoteTimerRef.current);
    }
    quoteTimerRef.current = setTimeout(() => setCompanionMood('idle'), 800);
  };

  /**
   * Expressive shortcut from the Feeling row: the companion reacts straight
   * away and the conversation stays anchored to that feeling.
   */
  const handleFeelingSelect = (feeling: PetAnimationMood) => {
    setCompanionMood(feeling);
    setReactionText(
      pickVariant(
        FEELING_MESSAGES[feeling],
        "Thank you for checking in with me! 💚"
      )
    );
    setShowMoodSelector(false);
    setIsAffirmationMinimized(false);
    setIsBubbleDismissed(false);
    setCurrentQuoteIdx(AFFIRMATION_LIBRARY.indexOf(getTodayAffirmation()));
  };

  const toggleSpecies = () => {
    if (onChangeSpecies) {
      onChangeSpecies(species === 'dog' ? 'cat' : 'dog');
    }
  };

  return (
    /*
     * ONE cohesive HANGIN column:
     *   scenic area → feeling → mood categories → daily goals
     * The scene keeps every animated layer it had; only the panels that used
     * to float on top of it now flow underneath, so nothing overlaps.
     */
    <div className="w-full select-none space-y-3 sm:space-y-4">
      {/* =========================================================
          SCENIC AREA — flex column so the companion is grounded in flow
          instead of being pinned with absolute offsets.
          ========================================================= */}
      <div className="relative flex h-[560px] w-full flex-col overflow-hidden rounded-3xl border border-emerald-900/30 shadow-2xl transition-colors duration-700 sm:h-[600px] lg:h-[640px]">
      {/* =========================================================
          SCENIC MOUNTAIN LAKE & DRIFTING CLOUDS
          The scenery itself now lives in <ScenicBackdrop> so the chat
          modal can paint the very same scene behind the conversation.
          ========================================================= */}
      <ScenicBackdrop phase={activePhase} />

      {/* =========================================================
          TOP BAR: PHILIPPINE STANDARD TIME & DAY PHASE TESTER
          (Note: Whisper button completely removed per user request)
          ========================================================= */}
      <div className="pointer-events-none absolute inset-x-2 top-2 z-30 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-3">
        {/* Real Philippine Time Badge */}
        <div className="pointer-events-auto flex min-w-0 items-center gap-1.5 rounded-full border border-white/20 bg-[#0b1411]/45 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-md sm:px-3 sm:text-[11px]">
          <span className="shrink-0 text-xs">🇵🇭</span>
          <span className="truncate font-mono tabular-nums">{phTime.timeFullStr}</span>
          <span className="hidden shrink-0 font-bold text-emerald-300 sm:inline">
            &bull; {phTime.phaseLabel}
          </span>
        </div>

        {/* Time Simulator Controls */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
          {/* Time of Day Switcher */}
          <div className="flex items-center gap-0.5 rounded-full border border-white/20 bg-[#0b1411]/45 p-0.5 text-xs backdrop-blur-md sm:gap-1">
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

      {/* =========================================================
          GROUNDED COMPANION + CONVERSATION
          Kept in normal flow and bottom-anchored inside the scene, so the
          pet's paws land on the grass and the chat bubbles grow upward
          instead of being pinned with absolute offsets.
          ========================================================= */}
      <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-2 px-3 pb-3 sm:px-5 sm:pb-4">
        {/* ---- Companion conversation: chat-style, minimizable ----
            Centered above the companion so every bubble's tail points
            straight down at the pet. */}
        <div className="flex w-full min-w-0 justify-center">
          <AnimatePresence mode="wait">
            {/* Minimized: the affirmation collapses to a restorable chip */}
            {isAffirmationMinimized && showAffirmation ? (
              <motion.button
                key="affirmation-minimized"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={() => setIsAffirmationMinimized(false)}
                title="Show today's affirmation again"
                className="flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-emerald-400/50 bg-[#0b1411]/70 px-3 py-1.5 text-[10px] font-bold text-emerald-200 shadow-md backdrop-blur-md transition-colors hover:bg-[#0b1411]/85"
              >
                <Quote className="h-3 w-3 text-emerald-400" />
                <span>Today&rsquo;s affirmation</span>
                <ChevronUp className="h-3 w-3" />
              </motion.button>
            ) : !isBubbleDismissed && reactionText ? (
              /* Empathetic Reaction Bubble */
              <motion.div
                key="reaction"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white/95 p-3.5 text-center shadow-xl backdrop-blur-md dark:border-emerald-800 dark:bg-[#182a22]/95"
              >
                <Heart className="pointer-events-none absolute -bottom-3 -right-2 h-16 w-16 text-rose-500/10 dark:text-rose-400/10" />

                <div className="relative z-10 mb-1.5 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 animate-pulse fill-rose-500 text-rose-500" />
                    <span>{companionName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBubbleDismissed(true)}
                    className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Dismiss message"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="relative z-10 text-xs font-semibold leading-relaxed text-emerald-950 sm:text-sm dark:text-emerald-50">
                  {reactionText}
                </p>
                {/* Aesthetic Pointer Tail directly over companion */}
                <div className="absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-emerald-200 bg-white dark:border-emerald-800 dark:bg-[#182a22]" />
              </motion.div>
            ) : !isBubbleDismissed && showAffirmation ? (
              /* Daily Affirmation — the pet's follow-up message */
              <motion.div
                key="affirmation"
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white/95 p-3.5 text-left shadow-xl backdrop-blur-md dark:border-emerald-800 dark:bg-[#182a22]/95"
              >
                <Quote className="pointer-events-none absolute -bottom-3 -right-2 h-14 w-14 text-emerald-500/10 dark:text-emerald-400/10" />

                <div className="relative z-10 mb-1.5 flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span className="truncate">{companionName}&rsquo;s Daily Affirmation</span>
                    {affirmation === todayAffirmation && (
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-px text-[9px] font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
                        Today&rsquo;s
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={handleNextQuote}
                      className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-800/60"
                      title="Another affirmation"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      <span>Next</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAffirmationMinimized(true)}
                      className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                      title="Minimize message"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBubbleDismissed(true)}
                      className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                      title="Dismiss bubble"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>

                <p className="relative z-10 text-xs font-semibold italic leading-relaxed text-emerald-950 dark:text-emerald-50">
                  &ldquo;{affirmation.quote}&rdquo;
                </p>

                {/* Author, verbatim from the shared affirmation entry. */}
                <p className="relative z-10 mt-1 text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-200/80">
                  &mdash; {affirmation.author}
                </p>

                <button
                  type="button"
                  onClick={handleOpenMoodCheckIn}
                  className="relative z-10 mt-2 flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                >
                  <Smile className="h-3 w-3" />
                  <span>Log another mood check-in</span>
                </button>

                {/* Aesthetic Pointer Tail */}
                <div className="absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-emerald-200 bg-white dark:border-emerald-800 dark:bg-[#182a22]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ---- Companion, standing ON the grass ----
            The scene's hill fills the bottom band, so keeping the pet low
            and adding an ambient contact shadow makes the paws read as
            planted on the grass rather than floating above it. */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <span className="pointer-events-none absolute bottom-[6%] left-1/2 h-4 w-40 -translate-x-1/2 rounded-[50%] bg-emerald-950/25 blur-[6px] dark:bg-black/40" />
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
          </div>

          {/* Companion Name, Chat & Check-in controls */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-[11px] font-black tracking-wide text-emerald-100 shadow-sm backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-xs">
              <span className="text-sm">{species === 'dog' ? '🐶' : '🐱'}</span>
              {companionName}
              <span className="text-emerald-400">{species === 'dog' ? 'Dog' : 'Cat'}</span>
            </span>

            <button
              type="button"
              onClick={handleOpenMoodCheckIn}
              title="Tell your companion how you're feeling"
              className="flex cursor-pointer items-center gap-1 rounded-full border border-emerald-400/50 bg-[#0b1411]/70 px-2.5 py-1 text-[11px] font-bold text-emerald-100 backdrop-blur-md transition-colors hover:bg-[#0b1411]/85 sm:px-3 sm:text-xs"
            >
              <Smile className="h-3.5 w-3.5 text-emerald-400" />
              <span>Check in</span>
            </button>

            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-700/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md transition-colors hover:bg-emerald-600 sm:px-3 sm:text-xs"
              >
                <MessageSquareHeart className="h-3.5 w-3.5" />
                <span>Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* =========================================================
          FEELING — expressive shortcuts that change how the companion
          looks and what it says (no mood log; behaviour unchanged).
          ========================================================= */}
      <section
        aria-label="Expressive feelings"
        className="rounded-3xl border border-emerald-100 bg-white/90 p-3.5 shadow-sm backdrop-blur-md transition-colors sm:p-4 dark:border-emerald-800/60 dark:bg-[#13221b]/90"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>Feeling</span>
          </span>
          <span className="truncate text-[10px] font-semibold text-slate-500 dark:text-emerald-400/80">
            Let {companionName} mirror you
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {FEELING_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFeelingSelect(f.id)}
              title={`Make ${companionName} express ${f.label}`}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 sm:text-sm ${
                companionMood === f.id
                  ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          MOOD CATEGORIES — the single mood check-in surface
          ========================================================= */}
      <section
        aria-label="Mood check-in"
        className={`rounded-3xl border p-3.5 shadow-sm backdrop-blur-md transition-all sm:p-4 ${
          showMoodSelector && !reactionText && !showAffirmation
            ? 'border-emerald-300 bg-white/95 ring-2 ring-emerald-400/50 dark:border-emerald-700 dark:bg-[#13221b]/95'
            : 'border-emerald-100 bg-white/90 dark:border-emerald-800/60 dark:bg-[#13221b]/90'
        }`}
      >
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Smile className="h-3.5 w-3.5" />
            <span>Mood check-in</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-emerald-400/80">
            {phTime.greeting.tagalog} &middot; {companionName}
          </span>
        </div>

        <h3 className="mb-2 text-sm font-bold text-emerald-950 dark:text-emerald-50">
          How are you feeling right now?
        </h3>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {MOOD_OPTIONS.map((m) => {
            const MoodIcon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMood(m.id, m.label)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-100 active:scale-95 sm:text-sm dark:border-[#2d4d41]/60 dark:bg-emerald-900/40 dark:text-emerald-100 dark:hover:bg-emerald-800/60"
              >
                <MoodIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          DAILY GOALS — compact checkbox list, persisted per PHT day
          ========================================================= */}
      {mindfulGoals.length > 0 && (
        <section
          aria-label="Daily goals"
          title="Your daily mindful goals — resets automatically at 12:00 AM"
          className="rounded-3xl border border-emerald-100 bg-white/90 p-3.5 shadow-sm backdrop-blur-md transition-colors sm:p-4 dark:border-emerald-800/60 dark:bg-[#13221b]/90"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Target className="h-3.5 w-3.5" />
              <span>Today&rsquo;s Goals</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black tabular-nums text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
              {doneCount}/{mindfulGoals.length} done
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {mindfulGoals.map((gKey) => {
              const gInfo = goalLabels[gKey] || { icon: Target, label: gKey };
              const GoalIcon = gInfo.icon;
              const isDone = completedGoals.includes(gKey);
              return (
                <button
                  key={gKey}
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  onClick={() => handleToggleGoal(gKey)}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-2.5 py-2 text-left transition-colors ${
                    isDone
                      ? 'border-emerald-400/60 bg-emerald-500/15'
                      : 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2 transition-colors ${
                      isDone
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-[#2d4d41]'
                    }`}
                  >
                    {isDone && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <GoalIcon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : 'text-emerald-500/70'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold leading-tight sm:text-xs ${
                      isDone
                        ? 'text-emerald-800 line-through decoration-emerald-500/60 dark:text-emerald-200'
                        : 'text-slate-700 dark:text-emerald-100'
                    }`}
                  >
                    {gInfo.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-1 border-t border-emerald-100 pt-2 text-[10px] font-semibold text-slate-500 dark:border-emerald-800/50 dark:text-emerald-400/80">
            <RefreshCw className="h-3 w-3" />
            <span>Resets at 12:00 AM Philippine time</span>
          </div>
        </section>
      )}
    </div>
  );
};