import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  Share2,
  Heart,
  Quote,
  X,
  ChevronRight,
  BookOpen,
  Leaf,
  Wind,
  Cloud,
  CloudSun,
  Flower2,
  Sprout,
  Moon,
  Star,
  Feather,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface AffirmationItem {
  id: string;
  quote: string;
  author: string;
  category: 'peace' | 'compassion' | 'courage' | 'rest' | 'taglish';
  categoryLabel: string;
  icon: LucideIcon;
  gradient: string;
}

export const AFFIRMATION_LIBRARY: AffirmationItem[] = [
  {
    id: 'aff-1',
    quote: 'You do not have to carry the whole mountain today. Just take the single gentle step in front of you.',
    author: 'Sanctuary Wisdom',
    category: 'peace',
    categoryLabel: 'Peace & Grounding',
    icon: Leaf,
    gradient: 'from-emerald-500/10 via-teal-500/10 to-emerald-600/10',
  },
  {
    id: 'aff-2',
    quote: 'Huminga nang malalim. You are safe in this moment, and your pace is completely enough.',
    author: 'Hangin Gentle Mind',
    category: 'taglish',
    categoryLabel: 'Taglish Sanctuary',
    icon: Wind,
    gradient: 'from-lime-500/10 via-emerald-500/10 to-teal-500/10',
  },
  {
    id: 'aff-3',
    quote: 'Your worth is not measured by your productivity. You are allowed to rest without earning it first.',
    author: 'Self-Compassion',
    category: 'compassion',
    categoryLabel: 'Self-Compassion',
    icon: Heart,
    gradient: 'from-amber-500/10 via-yellow-500/10 to-orange-500/10',
  },
  {
    id: 'aff-4',
    quote: 'Even the stormiest skies clear when the gentle wind blows. Be as gentle with yourself as you are with the world.',
    author: 'Nature Reflection',
    category: 'peace',
    categoryLabel: 'Peace & Grounding',
    icon: Cloud,
    gradient: 'from-sky-500/10 via-cyan-500/10 to-emerald-500/10',
  },
  {
    id: 'aff-5',
    quote: 'Minsan ang pinakamalaking tagumpay ay ang pagpili na magpatuloy nang may kapayapaan sa puso.',
    author: 'Filipino Reflection',
    category: 'taglish',
    categoryLabel: 'Taglish Sanctuary',
    icon: Flower2,
    gradient: 'from-rose-500/10 via-pink-500/10 to-amber-500/10',
  },
  {
    id: 'aff-6',
    quote: 'Feelings are like clouds passing through the sky. You are the wide, steady blue sky beneath them.',
    author: 'Mindful Presence',
    category: 'peace',
    categoryLabel: 'Peace & Grounding',
    icon: CloudSun,
    gradient: 'from-blue-500/10 via-indigo-500/10 to-teal-500/10',
  },
  {
    id: 'aff-7',
    quote: 'Give yourself permission to be a work in progress. Growth happens in quiet, unnoticed moments.',
    author: 'Gentle Growth',
    category: 'courage',
    categoryLabel: 'Courage & Growth',
    icon: Sprout,
    gradient: 'from-emerald-500/10 via-green-500/10 to-lime-500/10',
  },
  {
    id: 'aff-8',
    quote: 'Pahinga muna. The world can wait while you refill your cup with stillness and warmth.',
    author: 'Sanctuary Haven',
    category: 'rest',
    categoryLabel: 'Gentle Rest',
    icon: Moon,
    gradient: 'from-indigo-500/10 via-purple-500/10 to-slate-500/10',
  },
  {
    id: 'aff-9',
    quote: 'You survived every difficult day before today. Trust your gentle resilience.',
    author: 'Small Wins',
    category: 'courage',
    categoryLabel: 'Courage & Growth',
    icon: Star,
    gradient: 'from-amber-500/10 via-orange-500/10 to-rose-500/10',
  },
  {
    id: 'aff-10',
    quote: 'It is okay if all you did today was breathe and get through. That is more than enough.',
    author: 'Gentle Compassion',
    category: 'compassion',
    categoryLabel: 'Self-Compassion',
    icon: Feather,
    gradient: 'from-teal-500/10 via-emerald-500/10 to-cyan-500/10',
  },
];

interface DailyAffirmationWidgetProps {
  companionName?: string;
  onAddPoints?: (amount: number) => void;
}

const BOOKMARK_STORAGE_KEY = 'hangin_bookmarked_affirmations';

export const DailyAffirmationWidget: React.FC<DailyAffirmationWidgetProps> = ({
  companionName = 'Habi',
  onAddPoints,
}) => {
  // Deterministic daily index based on current date
  const getTodayIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return dayOfYear % AFFIRMATION_LIBRARY.length;
  };

  const [currentIndex, setCurrentIndex] = useState(getTodayIndex());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['aff-1', 'aff-2'];
    } catch {
      return ['aff-1'];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [bookmarkedIds]);

  const currentAffirmation = AFFIRMATION_LIBRARY[currentIndex];
  const isBookmarked = bookmarkedIds.includes(currentAffirmation.id);

  // Cycle to next quote
  const handleNextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATION_LIBRARY.length);
  };

  // Toggle bookmark
  const handleToggleBookmark = (item: AffirmationItem) => {
    const isSaved = bookmarkedIds.includes(item.id);
    if (isSaved) {
      setBookmarkedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      setBookmarkedIds((prev) => [...prev, item.id]);
      confetti({
        particleCount: 22,
        spread: 45,
        origin: { y: 0.7 },
      });
      if (onAddPoints) {
        onAddPoints(2);
      }
    }
  };

  // Copy to clipboard
  const handleCopyQuote = (quoteText: string, authorText: string) => {
    const textToCopy = `"${quoteText}" — ${authorText} (via Hangin Sanctuary 🌿)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  // Soft text-to-speech read aloud
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Calm, soothing cadence
      utterance.pitch = 1.05;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  const bookmarkedItems = AFFIRMATION_LIBRARY.filter((item) =>
    bookmarkedIds.includes(item.id)
  );

  return (
    <div className="w-full mt-4 select-none">
      {/* ============================================================
          MAIN AFFIRMATION CARD
          ============================================================ */}
      <motion.div
        layout
        className={`relative rounded-3xl p-4 sm:p-5 border-2 border-emerald-500/30 dark:border-emerald-700/40 bg-gradient-to-br ${currentAffirmation.gradient} bg-white/90 dark:bg-[#112017]/90 backdrop-blur-md shadow-lg overflow-hidden`}
      >
        {/* Decorative Watermark Quotation Mark */}
        <Quote className="absolute -right-3 -bottom-4 w-28 h-28 text-emerald-500/10 dark:text-emerald-400/5 pointer-events-none stroke-[1]" />

        {/* Top Widget Bar */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#58cc02]/20 text-[#58cc02] dark:text-emerald-300 flex items-center justify-center text-sm shadow-2xs">
              <currentAffirmation.icon className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                <span>Daily Affirmation</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Bookmarked Favorites Button */}
            <button
              onClick={() => setShowSavedModal(true)}
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer shadow-2xs"
              title={`View Bookmarked Affirmations (${bookmarkedIds.length} saved)`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-500 fill-[#58cc02]" />
              {bookmarkedIds.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#076700] text-white text-[9px] font-black flex items-center justify-center leading-none shadow-sm">
                  {bookmarkedIds.length}
                </span>
              )}
            </button>

            {/* Cycle to Next Affirmation */}
            <button
              onClick={handleNextQuote}
              className="p-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 cursor-pointer transition-transform active:rotate-45"
              title="Cycle to next calming affirmation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Affirmation Text Body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAffirmation.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="my-3 relative z-10"
          >
            <p className="text-sm sm:text-base font-semibold italic text-emerald-950 dark:text-emerald-50 leading-relaxed font-serif">
              "{currentAffirmation.quote}"
            </p>
            <span className="block mt-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-500">
              &mdash; {currentAffirmation.author}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-2.5 border-t border-emerald-100/80 dark:border-emerald-800/50 relative z-10">
          <div className="flex items-center gap-1.5">
            {/* Bookmark Button */}
            <button
              onClick={() => handleToggleBookmark(currentAffirmation)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isBookmarked
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-white/80 dark:bg-emerald-950/70 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 hover:bg-emerald-50'
              }`}
              title={isBookmarked ? 'Remove from Saved' : 'Bookmark this Affirmation'}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                  <span>Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmark</span>
                </>
              )}
            </button>

            {/* Read Aloud Button */}
            <button
              onClick={() => handleSpeak(currentAffirmation.quote)}
              className={`p-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-purple-100 text-purple-700 border-purple-300 animate-pulse'
                  : 'bg-white/80 dark:bg-emerald-950/70 text-slate-600 dark:text-emerald-300 border-slate-200 dark:border-emerald-800 hover:bg-emerald-50'
              }`}
              title={isSpeaking ? 'Stop Reading' : 'Listen with Soothing Audio Voice'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Quote Button */}
            <button
              onClick={() => handleCopyQuote(currentAffirmation.quote, currentAffirmation.author)}
              className="p-1.5 rounded-full bg-white/80 dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer transition-colors"
              title="Copy affirmation to clipboard"
            >
              {copiedToast ? (
                <Check className="w-3.5 h-3.5 text-[#58cc02]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Quick cycle button */}
          <button
            onClick={handleNextQuote}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Next Quote</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* ============================================================
          SAVED / BOOKMARKED AFFIRMATIONS MODAL DRAWER
          ============================================================ */}
      <AnimatePresence>
        {showSavedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="w-full max-w-md max-h-[85vh] bg-white dark:bg-[#11231a] rounded-3xl border-2 border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 bg-emerald-50 dark:bg-[#16271c] border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <BookmarkCheck className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-emerald-100">
                      Bookmarked Affirmations
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowSavedModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-500 dark:text-emerald-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Bookmarks List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {bookmarkedItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-emerald-400/80">
                    <Bookmark className="w-10 h-10 mx-auto mb-2 text-emerald-400/70" />
                    <p className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                      No bookmarks saved yet
                    </p>
                    <p className="text-[11px] mt-1 max-w-xs mx-auto">
                      Tap the 'Bookmark' button on any daily affirmation that brings peace to your mind!
                    </p>
                  </div>
                ) : (
                  bookmarkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#16271d] border border-slate-200 dark:border-emerald-800/60 flex flex-col justify-between gap-2 shadow-2xs hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black uppercase text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.categoryLabel}</span>
                        </span>
                        <button
                          onClick={() => handleToggleBookmark(item)}
                          className="p-1.5 rounded-full text-red-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                          title="Remove bookmark"
                          aria-label="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm font-medium italic text-slate-800 dark:text-emerald-100 font-serif leading-relaxed">
                        "{item.quote}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-400 pt-1.5 border-t border-slate-200/60 dark:border-emerald-800/40">
                        <span>&mdash; {item.author}</span>
                        <button
                          onClick={() => handleCopyQuote(item.quote, item.author)}
                          className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-white dark:bg-[#11231a] border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {companionName} treasures these with you 🌸
                </span>
                <button
                  onClick={() => setShowSavedModal(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-xs transation-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};