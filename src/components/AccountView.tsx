import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Moon,
  Sun,
  Lock,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  LogOut,
  Plus,
  Trash2,
  Clock,
  Smartphone,
  EyeOff,
  AlertTriangle,
  Repeat,
  ShoppingBag,
  Heart,
  KeyRound,
  Download,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CuteCompanion } from './CuteCompanion';
import { PetSpecies, EquippedAccessories } from '../types';
import { DigitalShieldTab } from './DigitalShieldTab';

interface AccountViewProps {
  species: PetSpecies;
  companionName: string;
  userName: string;
  points: number;
  equipped: EquippedAccessories;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMarket: () => void;
  onTriggerCrisisSafety: () => void;
  onChangeSpecies?: (newSpecies: PetSpecies) => void;
  onLaunchMinimizer?: () => void;
  onLogout?: () => void;
  onInstallPWA?: () => void;
  pin?: string;
  onOpenBreathing?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  species,
  companionName,
  userName,
  points,
  equipped,
  darkMode,
  onToggleDarkMode,
  onOpenMarket,
  onTriggerCrisisSafety,
  onChangeSpecies,
  onLaunchMinimizer,
  onLogout,
  onInstallPWA,
  pin = '1234',
  onOpenBreathing,
}) => {
  // Merged section navigation inside Account: 'profile' | 'shield' | 'settings'
  const [activeSection, setActiveSection] = useState<'profile' | 'shield' | 'settings'>('profile');

  // Authentication State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'apple' | 'password' | null>(null);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [currentAccountName, setCurrentAccountName] = useState(userName);

  // Digital Shield State
  const [isAdultBlockerActive, setIsAdultBlockerActive] = useState(true);
  const [isDoomscrollBlockerActive, setIsDoomscrollBlockerActive] = useState(true);
  const [blockedCount, setBlockedCount] = useState(14);
  const [blockedDomains, setBlockedDomains] = useState<string[]>([
    'instagram.com',
    'tiktok.com',
    'x.com',
    'facebook.com',
    'youtube.com/shorts',
  ]);
  const [newDomainInput, setNewDomainInput] = useState('');

  // Pin verification for shield
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Handlers for Auth
  const handleOAuthLogin = (provider: 'google' | 'apple') => {
    setAuthProvider(provider);
    setIsSignedIn(true);
    const providerName = provider === 'apple' ? 'Apple User' : 'Google Explorer';
    setCurrentAccountName(authUsername.trim() || providerName);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() && !authEmail.trim()) return;
    setAuthProvider('password');
    setIsSignedIn(true);
    setCurrentAccountName(authUsername.trim() || authEmail.split('@')[0]);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setAuthProvider(null);
    setAuthPassword('');
  };

  // Handlers for Domain Blocker
  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!clean) return;
    if (!blockedDomains.includes(clean)) {
      setBlockedDomains((prev) => [...prev, clean]);
      setBlockedCount((c) => c + 1);
    }
    setNewDomainInput('');
  };

  const handleRemoveDomain = (domain: string) => {
    setBlockedDomains((prev) => prev.filter((d) => d !== domain));
  };

  const handleDownloadBackup = () => {
    try {
      const data = localStorage.getItem('hangin_wellness_v6_state') || '{}';
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hangin-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl mx-auto pb-10">
      {/* =========================================================
          MERGED ACCOUNT NAVIGATION PILL DOCK (Account / Shield / Settings)
          ========================================================= */}
      <div className="w-full bg-white dark:bg-[#122218] rounded-3xl border border-emerald-100 dark:border-emerald-800/60 p-2 shadow-xs flex items-center justify-between gap-1">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveSection('shield')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'shield'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Shield</span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'settings'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* =========================================================
          SECTION 1: COMPANION & PROFILE CARD
          ========================================================= */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          <div className="w-full rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#07160e] text-white p-5 sm:p-6 shadow-xl border border-emerald-700/60 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Grounded Companion Avatar */}
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <CuteCompanion
                    species={species}
                    mood="happy"
                    equipped={equipped}
                    size="md"
                    interactive={false}
                  />
                </div>
                {onChangeSpecies && (
                  <button
                    onClick={() => onChangeSpecies(species === 'dog' ? 'cat' : 'dog')}
                    className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Switch to {species === 'dog' ? 'Cat' : 'Dog'}</span>
                  </button>
                )}
              </div>

              {/* User and Companion Details */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-black text-white">
                    {isSignedIn ? currentAccountName : `${companionName}'s Guardian`}
                  </h3>
                  {isSignedIn && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{authProvider === 'apple' ? 'Apple ID' : authProvider === 'google' ? 'Google' : 'Verified'}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-emerald-200/80">
                  Companion: <strong className="text-white">{companionName}</strong> ({species === 'dog' ? 'Loyal Puppy 🐶' : 'Calm Cat 🐱'})
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-1.5 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{points} Wellness Points (WP)</span>
                  </div>

                  <button
                    onClick={onOpenMarket}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Sanctuary Wardrobe &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs text-center">
              <span className="text-2xl mb-1 block">🍃</span>
              <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">Level 4</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">Mindful Pacing</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs text-center">
              <span className="text-2xl mb-1 block">🔥</span>
              <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">7 Days</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">Sanctuary Streak</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs text-center">
              <span className="text-2xl mb-1 block">🛡️</span>
              <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">{blockedCount}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">Blocks Shielded</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 2: DIGITAL SHIELD & DISTRACTION BLOCKER (MERGED)
          ========================================================= */}
      {activeSection === 'shield' && (
        <DigitalShieldTab
          onLaunchMinimizer={onLaunchMinimizer || (() => {})}
          onOpenBreathing={onOpenBreathing || (() => {})}
          species={species}
          companionName={companionName}
          pin={pin}
        />
      )}

      {/* =========================================================
          SECTION 3: SETTINGS, AUTHENTICATION & THEME (MERGED)
          ========================================================= */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          {/* Authentication & Account Creation */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                  {isSignedIn ? 'Sanctuary Account' : authMode === 'signup' ? 'Create Your Sanctuary Account' : 'Sign In'}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {isSignedIn
                    ? `Logged in via ${authProvider || 'Account'}`
                    : 'Google, Apple, or Username & Password with local encryption'}
                </p>
              </div>

              {!isSignedIn && (
                <div className="flex bg-emerald-100 dark:bg-emerald-950 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      authMode === 'signup' ? 'bg-white dark:bg-emerald-800 shadow-xs' : 'text-emerald-700'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setAuthMode('signin')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      authMode === 'signin' ? 'bg-white dark:bg-emerald-800 shadow-xs' : 'text-emerald-700'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {isSignedIn ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#172b1e] border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentAccountName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                      {currentAccountName}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Bayanihan Member &bull; Encrypted Sync
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Official Google & Apple OAuth Quick Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Google Button with Official Google G Logo */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#17271e] hover:bg-slate-50 dark:hover:bg-[#1e3327] text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Apple Button with Official Apple Silhouette Logo */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('apple')}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-900 bg-black hover:bg-zinc-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.42-6.52-10.1-11.51-21.29-14.97-33.56-3.46-12.27-5.19-23.77-5.19-34.5 0-14.54 3.75-26.69 11.24-36.46 7.49-9.77 16.9-14.74 28.23-14.9 4.35 0 9.29 1.15 14.82 3.44 5.53 2.29 9.3 3.48 11.3 3.57 1.89 0 5.75-1.25 11.58-3.76 5.83-2.5 11.04-3.67 15.63-3.5 11.55.77 20.89 4.99 28.02 12.66-10.15 6.17-15.12 14.88-14.91 26.13.21 8.87 3.57 16.29 10.08 22.26 6.51 5.97 14.15 9.4 22.92 10.28-2.12 6.35-4.78 13.13-7.98 20.35zM119.22 31.95c0-7.39 2.66-14.39 7.98-21 5.32-6.61 11.83-10.57 19.53-11.88.22 1.3.33 2.51.33 3.63 0 7.27-2.77 14.37-8.31 21.3-5.54 6.93-12.04 10.97-19.53 12.12v-4.17z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-emerald-800/60" />
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">
                    or username &amp; password
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-emerald-800/60" />
                </div>

                {/* 2. Username + Password Fields */}
                <form onSubmit={handlePasswordSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Preferred Username..."
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-[#18291e] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-emerald-600"
                  />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Email address (optional for recovery)..."
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-[#18291e] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-emerald-600"
                  />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password..."
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-[#18291e] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 focus:outline-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={!authUsername.trim() && !authEmail.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {authMode === 'signup' ? 'Create Encrypted Account' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Calming Dark / White Mode Canvas Toggle */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {darkMode ? 'Dark Forest Mode (Active)' : 'Pure White Canvas (Active)'}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {darkMode ? 'Deep restorative night tones' : 'Bright clean day reading canvas'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:scale-105 transition-transform cursor-pointer"
            >
              {darkMode ? <span>☀️ Light Mode</span> : <span>🌙 Dark Mode</span>}
            </button>
          </div>

          {/* Backup & Data Privacy */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                Local Zero-Data-Loss Backup
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Download your private sanctuary progress (.json)
              </span>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* 24/7 CRISIS SUPPORT EMERGENCY SECTION */}
          <div className="p-5 rounded-3xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/70 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-950 dark:text-rose-100 font-black text-sm">
                <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>24/7 Crisis Support &amp; Emergency Lifeline</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                Toll-Free
              </span>
            </div>

            <p className="text-xs text-rose-950/80 dark:text-rose-200/80 leading-relaxed">
              If you are feeling overwhelmed, heavy, or having thoughts of giving up, you do not have to carry this alone. Free, confidential, loving human help is available 24/7:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="tel:1553"
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-between shadow-xs transition-colors"
              >
                <span>Dial NCMH Philippines</span>
                <span className="underline font-mono">1553</span>
              </a>

              <a
                href="tel:09178998727"
                className="p-2.5 rounded-xl bg-white dark:bg-rose-950 text-rose-900 dark:text-rose-100 border border-rose-200 font-bold flex items-center justify-between hover:bg-rose-50 transition-colors"
              >
                <span>NCMH Mobile Cell</span>
                <span className="font-mono text-[11px]">0917-899-8727</span>
              </a>
            </div>

            <button
              onClick={onTriggerCrisisSafety}
              className="w-full py-2 rounded-xl bg-rose-200/60 dark:bg-rose-900/50 hover:bg-rose-200 text-rose-950 dark:text-rose-100 text-xs font-black cursor-pointer transition-colors text-center"
            >
              Open Full Crisis Intercept Modal &rarr;
            </button>
          </div>

          {/* PROGRESSIVE WEB APP (PWA) INSTALLATION CARD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#122218] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  I-install sa Phone (PWA App)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                PWA Ready
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed">
              Puwede mong i-install ang Hangin nang direkta mula sa browser nang walang app store!
            </p>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div><strong>📱 Android / Chrome:</strong> Pindutin ang <strong>⋮ Menu</strong> sa browser &rarr; piliin ang <strong>"Install app"</strong> o <strong>"Add to Home screen"</strong>.</div>
              <div><strong>🍏 iPhone / Safari:</strong> Pindutin ang <strong>Share icon (⎙)</strong> &rarr; piliin ang <strong>"Add to Home Screen"</strong>.</div>
            </div>
            {onInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#10b981] hover:from-emerald-400 hover:to-[#059669] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Subukang I-install Ngayon</span>
              </button>
            )}
          </div>

          {/* LOG OUT / RETURN TO INTRO SCREEN */}
          {onLogout && (
            <div className="pt-2">
              <button
                onClick={onLogout}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-500 dark:text-emerald-400" />
                <span>Mag-log Out / Bumalik sa Hangin Intro</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
