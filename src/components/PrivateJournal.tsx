import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  Plus,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  X,
  Sparkles,
  ShieldCheck,
  Heart,
  Search,
  Trash2,
  Smile,
  Edit3,
  Feather,
} from 'lucide-react';
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

  const moods = [
    { id: 'peaceful', label: 'Peaceful', icon: '🌿', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'grateful', label: 'Grateful', icon: '☀️', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'overwhelmed', label: 'Overwhelmed', icon: '🌧️', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'grounded', label: 'Grounded', icon: '🪵', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
    { id: 'reflective', label: 'Reflective', icon: '💭', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    { id: 'healing', label: 'Healing', icon: '🌸', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  ];

  const prompts = [
    'What brought a quiet moment of peace today?',
    'What is one boundary I kept with my screen?',
    'A thought or worry I am ready to release...',
    'Something I did today that made me proud.',
  ];

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
          className="w-full bg-white dark:bg-[#112017] p-6 rounded-3xl border-2 border-slate-200 dark:border-emerald-800/80 shadow-xl flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-slate-800 dark:text-emerald-100">
            Sanctuary Journal
          </h2>
          <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1 mb-6">
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
                      ? 'bg-[#58cc02] scale-110 shadow-xs'
                      : pinError
                      ? 'bg-rose-500'
                      : 'border-2 border-slate-300 dark:border-emerald-700 bg-transparent'
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
                className="h-14 rounded-2xl bg-slate-50 dark:bg-emerald-950/50 hover:bg-slate-100 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-100 text-xl font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-14 rounded-2xl bg-slate-50 dark:bg-emerald-950/50 hover:bg-slate-100 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-100 text-xl font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-slate-50 dark:bg-emerald-950/50 hover:bg-slate-100 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-800 text-slate-500 dark:text-emerald-400 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              ⌫
            </button>
          </div>

          {/* Quick Demo Bypass hint */}
          <button
            onClick={() => onUnlock(pin || '1234')}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold mt-2"
          >
            Quick Unlock (Default: {pin || '1234'})
          </button>
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
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 select-none">
      {/* Top Header */}
      <div className="rounded-3xl bg-white dark:bg-[#112017] p-4 sm:p-5 border-2 border-slate-200 dark:border-emerald-800/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-emerald-100">
              Private Journal
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400">
              {entries.length} reflections saved locally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComposing(!isComposing)}
            className="px-3.5 py-2 rounded-xl bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-xs uppercase tracking-wide shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>

          <button
            onClick={onLock}
            className="p-2 rounded-xl bg-slate-100 dark:bg-emerald-950 text-slate-600 dark:text-emerald-300 hover:bg-slate-200 cursor-pointer"
            title="Lock Journal"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPOSER FORM (MODAL / EXPANDABLE) */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-3xl bg-white dark:bg-[#112017] p-5 border-2 border-emerald-500 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
                <Feather className="w-4 h-4 text-[#58cc02]" />
                <span>Today's Reflection</span>
              </h3>
              <button
                onClick={() => setIsComposing(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mood Selector Chips */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 block mb-1.5 uppercase tracking-wide">
                Current Mood
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedMood === m.id
                        ? 'bg-[#58cc02] text-white shadow-xs scale-105'
                        : 'bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Suggestion Chips */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 block mb-1.5 uppercase tracking-wide">
                Need Inspiration?
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setContent(p + '\n\n')}
                    className="whitespace-nowrap px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Body */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thought a title..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950/70 border border-slate-300 dark:border-emerald-700 text-sm font-bold text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
            />

            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pour out your mind without fear of judgment. Only you hold the key..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-emerald-950/70 border border-slate-300 dark:border-emerald-700 text-sm text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
            />

            {/* Attached Photo preview */}
            {attachedMedia && (
              <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                <img src={attachedMedia} alt="Media" className="w-full h-auto object-cover" />
                <button
                  onClick={() => setAttachedMedia(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-700 text-xs font-bold text-slate-700 dark:text-emerald-300 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-500" />
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
                onClick={handleSaveEntry}
                disabled={!content.trim()}
                className="px-6 py-2.5 rounded-full bg-[#58cc02] hover:bg-[#46a302] disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
              >
                Save Reflection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#112017] border border-slate-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
          />
        </div>

        {/* Mood Filter Pill */}
        <select
          value={selectedMoodFilter || ''}
          onChange={(e) => setSelectedMoodFilter(e.target.value || null)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-[#112017] border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-700 dark:text-emerald-200 focus:outline-none"
        >
          <option value="">All Moods</option>
          {moods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.icon} {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const moodObj = moods.find((m) => m.id === entry.mood);
          return (
            <div
              key={entry.id}
              className="rounded-2xl bg-white dark:bg-[#112017] p-4 sm:p-5 border border-slate-200 dark:border-emerald-800/80 shadow-2xs hover:border-slate-300 dark:hover:border-emerald-700 transition-all text-left space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800">
                    {moodObj ? `${moodObj.icon} ${moodObj.label}` : '🌿 Reflection'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{entry.date}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-emerald-50">
                {entry.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/90 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {entry.mediaUrl && (
                <div className="mt-2 rounded-xl overflow-hidden max-h-60 border border-slate-200">
                  <img src={entry.mediaUrl} alt="Entry photo" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-[#112017] rounded-3xl border border-dashed border-slate-300 dark:border-emerald-800 p-6">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-emerald-200">
              No journal entries found
            </p>
            <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1">
              Tap "New Entry" above to begin your first private reflection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
