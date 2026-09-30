import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Plus,
  BookOpen,
  Calendar,
  Delete,
  Image as ImageIcon,
  X,
  Search,
  Leaf,
  Sun,
  CloudRain,
  TreePine,
  Lightbulb,
  Flower2,
  Layers,
  Tags,
  Feather,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { JournalEntry } from '../types';

interface PrivateJournalProps {
  entries: JournalEntry[];
  pin: string;
  isLocked: boolean;
  onUnlock: (enteredPin: string) => boolean;
  onLock: () => void;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  onTriggerCrisisSafety: () => void;
}

interface MoodOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PrivateJournal: React.FC<PrivateJournalProps> = ({
  entries,
  pin,
  isLocked,
  onUnlock,
  onLock,
  onAddEntry,
  onTriggerCrisisSafety,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [shake, setShake] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('peaceful');
  const [attachedMedia, setAttachedMedia] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lucide icons replace the previous emoji visuals (same moods, same ids).
  const moods: MoodOption[] = [
    { id: 'peaceful', label: 'Peaceful', icon: Leaf },
    { id: 'grateful', label: 'Grateful', icon: Sun },
    { id: 'overwhelmed', label: 'Overwhelmed', icon: CloudRain },
    { id: 'grounded', label: 'Grounded', icon: TreePine },
    { id: 'reflective', label: 'Reflective', icon: Lightbulb },
    { id: 'healing', label: 'Healing', icon: Flower2 },
  ];

  const prompts = [
    'What brought a quiet moment of peace today?',
    'What is one boundary I kept with my screen?',
    'A thought or worry I am ready to release...',
    'Something I did today that made me proud.',
  ];

  const closeComposer = () => setIsComposing(false);

  // Escape closes the New Entry modal.
  useEffect(() => {
    if (!isComposing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeComposer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isComposing]);

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + digit;
    setPinInput(newPin);

    if (newPin.length === 4) {
      const success = onUnlock(newPin);
      if (!success) {
        setPinError(true);
        setShake(true);
        setTimeout(() => {
          setPinInput('');
          setPinError(false);
          setShake(false);
        }, 700);
      } else {
        setPinInput('');
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(pinInput.slice(0, -1));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedMedia(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const textLower = (title + ' ' + content).toLowerCase();
    const riskPhrases = ['harm myself', 'hurt myself', 'kill myself', 'suicide', 'end my life', 'want to die'];
    if (riskPhrases.some((p) => textLower.includes(p))) {
      onTriggerCrisisSafety();
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    onAddEntry({
      date: todayStr,
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      mood: selectedMood,
      tags: ['Private', selectedMood],
      mediaUrl: attachedMedia || undefined,
    });

    setTitle('');
    setContent('');
    setAttachedMedia(null);
    setIsComposing(false);
  };

  // ============================================================
  // VIEW 1: AESTHETIC PIN LOCK SCREEN
  // ============================================================
  if (isLocked) {
    return (
      <div className="w-full max-w-sm mx-auto my-auto px-4 py-8 flex flex-col items-center justify-center select-none text-center">
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-xl flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-emerald-900 dark:text-emerald-100">
            Sanctuary Journal
          </h2>
          <p className="text-xs text-emerald-700/70 dark:text-emerald-400 mt-1 mb-6">
            Enter your 4-digit PIN to access private reflections
          </p>

          {/* 4-Pin Dots Indicator */}
          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pinInput.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-emerald-600 scale-110 shadow-xs'
                      : pinError
                      ? 'bg-rose-500'
                      : 'border-2 border-emerald-200 dark:border-[#2d4d41] bg-transparent'
                  }`}
                />
              );
            })}
          </div>

          {/* Sleek Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeypadPress(digit)}
                className="h-14 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xl font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-14 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xl font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700/70 dark:text-emerald-400 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // VIEW 2: UNLOCKED PRIVATE JOURNAL DASHBOARD
  // ============================================================
  const filteredEntries = entries.filter((e) => {
    if (selectedMoodFilter && e.mood !== selectedMoodFilter) return false;
    if (
      searchFilter.trim() &&
      !e.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !e.content.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-5 py-5 sm:py-7 space-y-5 sm:space-y-6 select-none">
      {/* Header — flat, no outer card */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-50">
            Private Journal
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-700/70 dark:text-emerald-300/70">
            {entries.length} {entries.length === 1 ? 'reflection' : 'reflections'} stored only on this device
          </p>
        </div>

        <button
          onClick={onLock}
          title="Lock Journal"
          aria-label="Lock Journal"
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-3 py-2 cursor-pointer transition-all active:scale-95"
        >
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-200">
            Private
          </span>
        </button>
      </header>

      {/* Search + New Entry */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search journal..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#13221b] border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-700/40 dark:placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 transition-all"
          />
        </div>

        <button
          onClick={() => setIsComposing(true)}
          title="New Journal Entry"
          aria-label="New Journal Entry"
          className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mood Filter */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700/70 dark:text-emerald-300/70">
          Mood
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMoodFilter(null)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              selectedMoodFilter === null
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All</span>
          </button>
          {moods.map((m) => {
            const MoodIcon = m.icon;
            const isActive = selectedMoodFilter === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMoodFilter(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                }`}
              >
                <MoodIcon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3.5 sm:space-y-4">
        {filteredEntries.map((entry) => {
          const moodObj = moods.find((m) => m.id === entry.mood);
          const MoodIcon = moodObj ? moodObj.icon : Leaf;
          return (
            <article
              key={entry.id}
              className="rounded-3xl bg-white dark:bg-[#13221b] p-4 sm:p-5 border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  <MoodIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {moodObj ? moodObj.label : 'Reflection'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700/60 dark:text-emerald-300/60">
                  <Calendar className="w-3.5 h-3.5" />
                  {entry.date}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
                {entry.title}
              </h3>

              <p className="text-sm sm:text-[15px] leading-relaxed text-emerald-950/75 dark:text-emerald-100/80 whitespace-pre-wrap">
                {entry.content}
              </p>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                  <Tags className="w-3.5 h-3.5 text-emerald-400" />
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-bold uppercase tracking-wide text-emerald-700/60 dark:text-emerald-300/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {entry.mediaUrl && (
                <div className="rounded-2xl overflow-hidden max-h-60 border border-emerald-100 dark:border-emerald-800">
                  <img src={entry.mediaUrl} alt="Entry photo" className="w-full h-auto object-cover" />
                </div>
              )}
            </article>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#13221b] rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-800 p-6">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 mb-3">
              <BookOpen className="w-6 h-6" />
            </span>
            <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
              No journal entries found
            </p>
            <p className="mt-1 text-sm text-emerald-700/70 dark:text-emerald-300/70">
              Tap the <span className="font-bold">+</span> button to begin your first private reflection.
            </p>
          </div>
        )}
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeComposer}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="New Journal Entry"
              className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#13221b] border border-emerald-200 dark:border-emerald-800 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-white/95 dark:bg-[#13221b]/95 backdrop-blur border-b border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid place-items-center w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Feather className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-50 truncate">
                    New Journal Entry
                  </h2>
                </div>
                <button
                  onClick={closeComposer}
                  title="Close"
                  aria-label="Close"
                  className="shrink-0 grid place-items-center w-9 h-9 rounded-full text-emerald-700/70 hover:text-emerald-900 hover:bg-emerald-50 dark:text-emerald-300/70 dark:hover:text-white dark:hover:bg-emerald-900/60 cursor-pointer transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="px-5 sm:px-6 py-5 space-y-5">
                {/* Mood Selector */}
                <div>
                  <label className="block mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700/70 dark:text-emerald-300/70">
                    Current Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => {
                      const MoodIcon = m.icon;
                      const isSelected = selectedMood === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMood(m.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                          }`}
                        >
                          <MoodIcon className="w-4 h-4" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Suggestion Chips */}
                <div>
                  <label className="block mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700/70 dark:text-emerald-300/70">
                    Need Inspiration?
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {prompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setContent(p + '\n\n')}
                        className="whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer transition-colors"
                      >
                        "{p}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your thought a title..."
                    className="w-full px-4 py-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-[#2d4d41] text-sm font-bold text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-700/40 dark:placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                  />

                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Pour out your mind without fear of judgment. Only you hold the key..."
                    className="w-full px-4 py-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-[#2d4d41] text-sm sm:text-[15px] leading-relaxed text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-700/40 dark:placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                  />
                </div>

                {/* Attached Photo preview */}
                {attachedMedia && (
                  <div className="relative rounded-2xl overflow-hidden max-h-48 border border-emerald-200 dark:border-emerald-800">
                    <img src={attachedMedia} alt="Media" className="w-full h-auto object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedMedia(null)}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-950 text-white cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-2xl border border-emerald-200 dark:border-[#2d4d41] text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Add Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />

                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-[0.12em] shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
