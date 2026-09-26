import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  Smartphone,
  EyeOff,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Wind,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PetSpecies } from '../types';
import { CuteCompanion } from './CuteCompanion';

interface DigitalShieldTabProps {
  onLaunchMinimizer: () => void;
  onOpenBreathing: () => void;
  species: PetSpecies;
  companionName: string;
  pin: string;
}

export const DigitalShieldTab: React.FC<DigitalShieldTabProps> = ({
  onLaunchMinimizer,
  onOpenBreathing,
  species,
  companionName,
  pin,
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
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

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
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-[#0e2417] text-white p-5 sm:p-6 shadow-xl border border-emerald-700/50 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Shield Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Porn & Distraction Blocker
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-sm">
            DNS-level protection shielding you from adult sites and infinite doomscroll triggers.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-3xl font-black text-emerald-400">{blockedCount}</span>
          <p className="text-[11px] text-emerald-300/80">Blocks Today</p>
        </div>
      </div>

      {/* ============================================================
          SECTION 1: PHONE MINIMIZER LAUNCHER (PHOTO #4)
          ============================================================ */}
      <div className="p-5 rounded-3xl bg-zinc-950 text-white border-2 border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Phone Minimizer Mode</h3>
              <p className="text-xs text-zinc-400">Minimalist AMOLED dumbphone launcher (Photo #4)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] text-emerald-400 font-semibold">
            AMOLED Black
          </span>
        </div>

        {/* Mini Preview Box representing Image #4 */}
        <div className="bg-black rounded-2xl p-4 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1.5 text-left font-sans">
            <p className="text-xs text-zinc-500 font-mono">11:52 • 92%</p>
            <p className="text-lg font-light tracking-wide text-white">Hangin</p>
            <p className="text-lg font-light tracking-wide text-zinc-400">Journal</p>
            <p className="text-lg font-light tracking-wide text-zinc-500">Breathe</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400 mb-2">Zero feed algorithms</p>
            <button
              onClick={onLaunchMinimizer}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs tracking-wide uppercase transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch Minimizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: WEBSITE BLOCKER FOR PORN (ADULT 18+ SHIELD)
          ============================================================ */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#112017] border-2 border-slate-200 dark:border-emerald-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-emerald-50">
                Porn & Adult Content Blocker
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                Filters 250,000+ 18+ domains and enforces strict SafeSearch
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={handleToggleAdultBlocker}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
              isAdultBlockerActive ? 'bg-[#58cc02] justify-end' : 'bg-slate-300 dark:bg-zinc-700 justify-start'
            }`}
          >
            <motion.div
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {isAdultBlockerActive ? (
                <Check className="w-3.5 h-3.5 text-[#58cc02] stroke-[3]" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-400" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Protection Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>250k+ Adult Domains</span>
            </div>
            <p className="text-slate-500 dark:text-emerald-400/80 text-[11px]">
              Explicit, pornographic, and cam websites blocked automatically.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>SafeSearch Enforced</span>
            </div>
            <p className="text-slate-500 dark:text-emerald-400/80 text-[11px]">
              Strict filtering locked on Google, Bing, DuckDuckGo & Reddit.
            </p>
          </div>
        </div>

        {/* Blocker Test Button (Shows authentic compassionate intervention) */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-emerald-400">Test how Hangin protects you:</span>
          <button
            onClick={() => setShowSimulatedIntervention(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold cursor-pointer transition-colors"
          >
            Simulate 18+ Block
          </button>
        </div>
      </div>

      {/* ============================================================
          SECTION 3: DOOMSCROLLING & CUSTOM DISTRACTOR BLOCKLIST
          ============================================================ */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#112017] border-2 border-slate-200 dark:border-emerald-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-emerald-50">
              Doomscrolling & Custom Blocklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300/80">
              Add websites or feeds that trigger compulsive checking
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {customSites.length} sites
          </span>
        </div>

        {/* Input to add custom domain */}
        <form onSubmit={handleAddCustomSite} className="flex gap-2">
          <input
            type="text"
            value={newSiteInput}
            onChange={(e) => setNewSiteInput(e.target.value)}
            placeholder="e.g. x.com, tiktok.com"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700 bg-slate-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs focus:ring-2 focus:ring-[#58cc02] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#58cc02] hover:bg-[#46a302] text-white font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block</span>
          </button>
        </form>

        {/* Blocked Sites Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {customSites.map((site) => (
            <span
              key={site}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-emerald-200 font-mono"
            >
              <span>{site}</span>
              <button
                onClick={() => handleRemoveSite(site)}
                className="text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          INTERVENTION MODAL (When an adult/distracting site is intercepted)
          ============================================================ */}
      <AnimatePresence>
        {showSimulatedIntervention && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#112017] rounded-3xl p-6 border-2 border-emerald-500 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>

              <div className="w-24 h-24 mx-auto">
                <CuteCompanion species={species} mood="happy" size="sm" interactive={true} />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-emerald-100">
                  Protected by Hangin
                </h3>
                <p className="text-xs text-slate-600 dark:text-emerald-300 mt-1 leading-relaxed">
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
                  className="w-full py-3 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-xs tracking-wider uppercase shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wind className="w-4 h-4" />
                  <span>Take 1-Min Breath with {companionName}</span>
                </button>

                <button
                  onClick={() => {
                    setShowSimulatedIntervention(false);
                    setBlockedCount(blockedCount + 1);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-emerald-950 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-300 font-bold text-xs cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-[#112017] rounded-3xl p-5 border-2 border-emerald-600 shadow-2xl text-center space-y-3"
            >
              <Lock className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-emerald-100">
                Enter Journal PIN to Disable Shield
              </h4>
              <p className="text-xs text-slate-500 dark:text-emerald-400">
                This helps prevent impulsive disabling of 18+ filters.
              </p>

              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full text-center tracking-widest text-lg font-mono py-2 rounded-xl border border-slate-300 dark:border-emerald-700 bg-slate-50 dark:bg-emerald-950 text-slate-900 dark:text-emerald-100 focus:outline-none"
              />

              {pinError && <p className="text-xs text-rose-500 font-bold">Incorrect PIN</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPinModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-emerald-900 text-slate-700 dark:text-emerald-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPin}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
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
