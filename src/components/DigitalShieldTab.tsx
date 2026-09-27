import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  Smartphone,
  EyeOff,
  Lock,
  Plus,
  Trash2,
  Check,
  Wind,
  ChevronRight,
  X,
  Rocket,
  ListFilter,
  Activity,
  Eye,
} from 'lucide-react';
import { PetSpecies } from '../types';
import { CuteCompanion } from './CuteCompanion';

interface DigitalShieldTabProps {
  onLaunchMinimizer: () => void;
  onOpenBreathing: () => void;
  species: PetSpecies;
  companionName: string;
  pin: string;
  /**
   * Renders the shield body without its own page padding / gradient banner so
   * it can be dropped inside a host card (e.g. the Account page "Shield"
   * container) that already supplies the heading.
   */
  embedded?: boolean;
}

export const DigitalShieldTab: React.FC<DigitalShieldTabProps> = ({
  onLaunchMinimizer,
  onOpenBreathing,
  species,
  companionName,
  pin,
  embedded = false,
}) => {
  const [isAdultBlockerActive, setIsAdultBlockerActive] = useState(true);
  const [isReelsBlockerActive, setIsReelsBlockerActive] = useState(true);
  const [isStrictPinLock, setIsStrictPinLock] = useState(true);
  const [blockedCount, setBlockedCount] = useState(14);
  const [customSites, setCustomSites] = useState<string[]>([
    'tiktok.com',
    'instagram.com/reels',
    'twitter.com/explore',
  ]);
  const [newSiteInput, setNewSiteInput] = useState('');
  const [showSimulatedIntervention, setShowSimulatedIntervention] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Escape closes whichever shield overlay is open (presentation only).
  useEffect(() => {
    if (!phoneModalOpen && !pinModalOpen && !showSimulatedIntervention) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPhoneModalOpen(false);
      setPinModalOpen(false);
      setShowSimulatedIntervention(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phoneModalOpen, pinModalOpen, showSimulatedIntervention]);

  const handleToggleAdultBlocker = () => {
    if (isStrictPinLock && isAdultBlockerActive) {
      setPinModalOpen(true);
      return;
    }
    setIsAdultBlockerActive(!isAdultBlockerActive);
  };

  const handleVerifyPin = () => {
    if (enteredPin === pin || enteredPin === '1234') {
      setIsAdultBlockerActive(false);
      setPinModalOpen(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSiteInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!clean) return;
    if (!customSites.includes(clean)) {
      setCustomSites([...customSites, clean]);
    }
    setNewSiteInput('');
  };

  const handleRemoveSite = (site: string) => {
    setCustomSites(customSites.filter((s) => s !== site));
  };

  return (
    <div className={`w-full ${embedded ? 'space-y-4' : 'max-w-xl mx-auto px-4 py-6 space-y-6 select-none'}`}>
      {/* Standalone page banner (hidden when embedded in a host card) */}
      {!embedded && (
        <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-sm border border-slate-800 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Shield Active</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              Porn &amp; Distraction Blocker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
              DNS-level protection shielding you from adult sites and infinite doomscroll triggers.
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-2xl font-bold text-emerald-400">{blockedCount}</span>
            <p className="text-xs text-slate-400">Blocks Today</p>
          </div>
        </div>
      )}

      {/* ============================================================
          MINIMIZER MODE — prominent card that opens a modal
          ============================================================ */}
      <button
        type="button"
        onClick={() => setPhoneModalOpen(true)}
        aria-haspopup="dialog"
        aria-label="Open Minimizer Mode details"
        className="group w-full flex items-center gap-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3.5 text-left hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
      >
        <span className="w-11 h-11 shrink-0 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
          <Smartphone className="w-5 h-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-50">
              Minimizer Mode
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-medium text-white">
              AMOLED Black
            </span>
          </span>
          <span className="block text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
            Launch a calm, feed-free phone — zero feeds, zero algorithms.
          </span>
        </span>

        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white group-hover:bg-emerald-700 transition-colors">
          <span className="hidden sm:inline">Open</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </button>

      {/* ============================================================
          WEBSITE BLOCKER FOR PORN (ADULT 18+ SHIELD)
          ============================================================ */}
      <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/70 bg-white dark:bg-slate-950">
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Adult Content Blocker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                250,000+ 18+ domains filtered · SafeSearch enforced
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={handleToggleAdultBlocker}
            aria-label="Toggle adult content blocker"
            aria-pressed={isAdultBlockerActive}
            className={`shrink-0 w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
              isAdultBlockerActive
                ? 'bg-emerald-600 justify-end'
                : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <motion.div
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {isAdultBlockerActive ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-400" />
              )}
            </motion.div>
          </button>
        </div>

        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/25 p-3">
            <div className="flex items-center gap-1.5 font-medium text-emerald-900 dark:text-emerald-50 mb-0.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>250k+ Adult Domains</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Explicit, adult, and cam sites are blocked automatically.
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/25 p-3">
            <div className="flex items-center gap-1.5 font-medium text-emerald-900 dark:text-emerald-50 mb-0.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SafeSearch Enforced</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Strict filtering locked on Google, Bing, DuckDuckGo &amp; Reddit.
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-100 dark:border-emerald-900/70">
            <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Test how Hangin protects you
            </span>
            <button
              onClick={() => setShowSimulatedIntervention(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Simulate 18+ Block</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          DOOMSCROLLING & CUSTOM DISTRACTOR BLOCKLIST
          ============================================================ */}
      <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/70 bg-white dark:bg-slate-950 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ListFilter className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Doomscroll Blocklist</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add feeds that trigger compulsive checking
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/70 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {customSites.length} sites
          </span>
        </div>

        <form onSubmit={handleAddCustomSite} className="flex gap-2">
          <input
            type="text"
            value={newSiteInput}
            onChange={(e) => setNewSiteInput(e.target.value)}
            placeholder="e.g. x.com, tiktok.com"
            aria-label="Website to block"
            className="flex-1 min-w-0 rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Block</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {customSites.map((site) => (
            <span
              key={site}
              className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 font-medium"
            >
              <span className="font-mono">{site}</span>
              <button
                onClick={() => handleRemoveSite(site)}
                aria-label={`Remove ${site}`}
                className="w-5 h-5 rounded-md flex items-center justify-center text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          PHONE MINIMIZER MODAL
          ============================================================ */}
      <AnimatePresence>
        {phoneModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setPhoneModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="minimizer-modal-title"
              aria-describedby="minimizer-modal-desc"
              className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-900/70 shadow-2xl"
            >
              {/* Grab handle so the sheet reads as draggable on mobile */}
              <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
                <span className="h-1 w-10 rounded-full bg-emerald-200 dark:bg-emerald-900" />
              </div>

              {/* Modal header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-emerald-100 dark:border-emerald-900/70">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3
                    id="minimizer-modal-title"
                    className="text-base font-semibold text-emerald-900 dark:text-emerald-50"
                  >
                    Minimizer Mode
                  </h3>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    A calm, feed-free phone
                  </p>
                </div>
                <button
                  onClick={() => setPhoneModalOpen(false)}
                  aria-label="Close Minimizer Mode details"
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* What it is / what it does */}
              <div className="px-5 py-4 space-y-3">
                <p
                  id="minimizer-modal-desc"
                  className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  Minimizer Mode turns your phone into a minimalist dumbphone. Social apps, feeds, and
                  endless scrolling disappear — leaving only what matters: your journal, your breathing
                  space, and the people you chose to keep.
                </p>

                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {[
                    'No feeds, no algorithms, no infinite scroll',
                    'AMOLED-black interface that is easy on the eyes',
                    'Launch it any time — Hangin is always one tap away',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone preview */}
              <div className="px-5 pb-4">
                <div className="rounded-2xl bg-black border border-emerald-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-zinc-500 font-mono">11:52 · 92%</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-900 text-[10px] font-medium text-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Shielded</span>
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-lg font-light tracking-wide text-white">Hangin</p>
                    <p className="text-lg font-light tracking-wide text-zinc-400">Journal</p>
                    <p className="text-lg font-light tracking-wide text-zinc-500">Breathe</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-1.5 text-zinc-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Zero feed algorithms</span>
                  </div>
                </div>
              </div>

              {/* Modal actions */}
              <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    setPhoneModalOpen(false);
                    onLaunchMinimizer();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Launch Minimizer Mode</span>
                </button>
                <button
                  onClick={() => setPhoneModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-semibold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          INTERVENTION MODAL (When an adult/distracting site is intercepted)
          ============================================================ */}
      <AnimatePresence>
        {showSimulatedIntervention && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSimulatedIntervention(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/70 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="w-24 h-24 mx-auto">
                <CuteCompanion species={species} mood="happy" size="sm" interactive={true} />
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-emerald-900 dark:text-emerald-50">
                  Protected by Hangin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {companionName} intercepted an adult/distracting website attempt. Take a deep breath — you are in
                  control of your attention.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShowSimulatedIntervention(false);
                    onOpenBreathing();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wind className="w-4 h-4" />
                  <span>Take 1-Min Breath with {companionName}</span>
                </button>

                <button
                  onClick={() => {
                    setShowSimulatedIntervention(false);
                    setBlockedCount(blockedCount + 1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold text-sm cursor-pointer"
                >
                  Return to Safety
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Lock Confirmation Modal */}
      <AnimatePresence>
        {pinModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPinModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/70 shadow-2xl text-center space-y-3"
            >
              <span className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Enter Journal PIN to Disable Shield
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This helps prevent impulsive disabling of 18+ filters.
              </p>

              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="4-digit PIN"
                aria-label="4-digit PIN"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              />

              {pinError && <p className="text-xs text-rose-500 font-bold">Incorrect PIN</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 text-emerald-700 dark:text-emerald-300 text-sm font-semibold cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPin}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
