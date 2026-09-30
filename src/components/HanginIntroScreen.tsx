import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Sparkles,
  Shield,
  BookOpen,
  Lock,
  ArrowRight,
  User,
  Wind,
  PhoneCall,
  KeyRound,
  Eye,
  EyeOff,
  Download,
  Leaf,
  Bath,
  HeartHandshake,
  Sun,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetSpecies } from '../types';
import { useTheme } from '../hooks/useTheme';

interface HanginIntroScreenProps {
  onStartOnboarding: () => void;
  onLogin: (data: { userName: string; pin: string }) => void;
  onGuestAccess: () => void;
  savedUserName?: string;
  savedPin?: string;
  species?: PetSpecies;
  onInstallPWA?: () => void;
  isPWAInstallable?: boolean;
}

export const HanginIntroScreen: React.FC<HanginIntroScreenProps> = ({
  onStartOnboarding,
  onLogin,
  onGuestAccess,
  savedUserName = '',
  savedPin = '',
  species = 'dog',
  onInstallPWA,
  isPWAInstallable = false,
}) => {
  const [activeView, setActiveView] = useState<'intro' | 'login'>('intro');
  // Both fields start empty so nobody can enter the sanctuary on a silent
  // "Guardian" / "1234" fallback. Any saved profile is shown as a hint only.
  const [inputUserName, setInputUserName] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isBreatheIn, setIsBreatheIn] = useState(true);

  /*
   * Shares the app-wide theme rather than keeping a private copy, so the
   * welcome screen can never disagree with the sanctuary behind it. The
   * choice made here is persisted and honoured everywhere else, and the
   * toggle still visibly works because it drives the same state.
   */
  const {
    isDark: isDarkMode,
    toggleTheme,
  } = useTheme();

  // Soft breathing loop indicator
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIsBreatheIn((prev) => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDoLogin = (authProvider?: string) => {
    const trimmedUser = inputUserName.trim();
    const finalPin = inputPin.trim();

    // Both fields are required. No fallback values — an empty field is
    // reported back to the user instead of being filled in for them.
    const isNameMissing = trimmedUser.length === 0;
    const isPinInvalid = !/^\d{4}$/.test(finalPin);

    setNameError(
      isNameMissing ? 'Kailangan namin ng pangalan mo. Pakilala ang iyong pangalan.' : null
    );
    setPinError(
      isPinInvalid
        ? finalPin.length === 0
          ? 'Kailangan ng PIN para sa iyong private journal.'
          : '4 lamang digits ang PIN, halimbawa: 1234.'
        : null
    );

    if (isNameMissing || isPinInvalid) {
      setLoginError(
        authProvider
          ? `Kumpleto muna ang pangalan at 4-digit PIN bago gamitin ang ${authProvider}.`
          : 'Kumpleto muna ang pangalan at 4-digit PIN bago makapasok.'
      );
      return;
    }

    setLoginError(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    onLogin({
      userName: trimmedUser,
      pin: finalPin,
    });
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-x-hidden font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0e1a15] text-emerald-50' : 'bg-white text-emerald-950'
      }`}
    >
      {/* Organic Ambient Breathing Glows — flat emerald, no gradient.
          Tinted per mode: the stock emerald steps are pale mint, which all
          but vanishes against the light canvas. */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/25'}`} />
      <div className={`absolute bottom-10 right-10 w-[380px] h-[380px] rounded-full blur-[100px] pointer-events-none ${isDarkMode ? 'bg-emerald-400/10' : 'bg-emerald-200/30'}`} />

      {/* Top Bar: Brand, Theme Toggle, Quick Crisis Indicator & PWA Install */}
      <header className="relative z-20 w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className={`text-lg font-black tracking-wide leading-tight flex items-center gap-1.5 ${
                isDarkMode ? 'text-white' : 'text-emerald-950'
              }`}
            >
              <span>HANGIN</span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}
              >
                PWA
              </span>
            </h1>
            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-emerald-300/80' : 'text-emerald-700/80'}`}>
              Mindful Companion &amp; Sanctuary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-pressed={isDarkMode}
            className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Install PWA in Top Bar (the ONE install prompt on this screen) */}
          {onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all cursor-pointer active:scale-95 ${
                isDarkMode
                  ? 'bg-emerald-500/25 hover:bg-emerald-500/40 border-emerald-400/50 text-emerald-100'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
              title="I-install ang Hangin sa phone o home screen"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">I-install</span>
              <span>App</span>
            </button>
          )}

          {/* Quick 24/7 Lifeline Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
              isDarkMode
                ? 'bg-red-950/60 border-red-500/40 text-emerald-300'
                : 'bg-red-100 border-red-300 text-red-700'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>24/7 Lifeline: 1553</span>
          </div>

          <button
            onClick={() => setActiveView(activeView === 'intro' ? 'login' : 'intro')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-emerald-100'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
          >
            {activeView === 'intro' ? 'Mag-log In' : 'Bumalik sa Intro'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-3xl mx-auto my-auto py-8">
        <AnimatePresence mode="wait">
          {/* VIEW 1: IMMERSIVE INTRO EXPERIENCE */}
          {activeView === 'intro' ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Soothing Breathing Leaf Cue — flat emerald, no gradient */}
              <div className="relative mb-6">
                <motion.div
                  animate={{
                    scale: isBreatheIn ? 1.08 : 0.94,
                    opacity: isBreatheIn ? 0.9 : 0.65,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-28 h-28 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex flex-col items-center justify-center p-3 shadow-2xl backdrop-blur-lg"
                >
                  <Wind className={`w-8 h-8 mb-1 animate-pulse ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {isBreatheIn ? 'Huminga' : 'Ilabas'}
                  </span>
                </motion.div>
                <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-ping opacity-25 pointer-events-none" />
              </div>

              {/* Brand Tagline (chip) */}
              <div
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border font-bold text-xs uppercase tracking-wider mb-4 ${
                  isDarkMode
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <span>&ldquo;We hear you.&rdquo;</span>
              </div>

              <h2
                className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 leading-tight max-w-xl ${
                  isDarkMode ? 'text-white' : 'text-emerald-950'
                }`}
              >
                Huminga nang malalim. <br className="hidden sm:inline" />
                <span className={isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}>Ligtas ka rito sa Hangin.</span>
              </h2>

              <p className={`text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed ${isDarkMode ? 'text-emerald-100/80' : 'text-emerald-800/80'}`}>
                Ang iyong 3D animal companion na laging handang makinig, gumabay sa self-care, at magbigay-lakas sa araw-araw nang walang panghuhusga.
              </p>

              {/* 3 Sanctuary Feature Highlights — one Lucide icon each, flat emerald/white cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto mb-8">
                {[
                  { icon: Bath, title: 'Pou-Like Care', desc: 'Liguan, pakainin, mini-games' },
                  { icon: BookOpen, title: 'Locked Journal', desc: 'Private PIN para sa damdamin' },
                  { icon: HeartHandshake, title: 'Safe AI & 1553', desc: 'Bayanihan at crisis safety' },
                ].map(({ icon: FeatureIcon, title, desc }) => (
                  <div
                    key={title}
                    className={`p-3.5 rounded-2xl border backdrop-blur-md flex flex-col items-center text-center transition-colors ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <FeatureIcon className={`w-6 h-6 mb-1.5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>{title}</h4>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>{desc}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons — flat emerald, no gradient */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <button
                  onClick={onStartOnboarding}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Mag-umpisa (Get Started)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('login')}
                  className={`w-full sm:w-auto py-4 px-6 rounded-2xl border font-bold text-sm tracking-wide active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <KeyRound className={`w-4 h-4 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />
                  <span>Mag-log In</span>
                </button>
              </div>

              {/* One-tap Quick Demo */}
              <button
                onClick={onGuestAccess}
                className={`mt-4 text-xs font-medium hover:underline transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDarkMode ? 'text-emerald-300/80 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>Subukan agad bilang Guest Guardian (No Sign Up)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            /* VIEW 2: DEDICATED GUARDIAN LOGIN */
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className={`w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl flex flex-col ${
                isDarkMode ? 'bg-[#182a22]/85 border-emerald-500/30' : 'bg-white border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${
                      isDarkMode ? 'bg-emerald-500/20 border-emerald-400/40' : 'bg-emerald-50 border-emerald-300'
                    }`}
                  >
                    <KeyRound className={`w-4 h-4 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>Guardian Login</h3>
                    <p className={`text-[11px] ${isDarkMode ? 'text-emerald-300/80' : 'text-emerald-700/80'}`}>
                      I-enter ang iyong profile para makapasok
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('intro')}
                  className={`text-xs cursor-pointer ${isDarkMode ? 'text-emerald-300 hover:text-white' : 'text-emerald-700 hover:text-emerald-950'}`}
                >
                  Bumalik
                </button>
              </div>

              {loginError && (
                <div
                  className={`mb-4 p-3 rounded-xl border-2 text-xs font-bold flex items-start gap-1.5 ${
                    isDarkMode
                      ? 'bg-rose-950/50 border-rose-500/50 text-rose-100'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4 mb-5">
                {/* Username Input */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                      isDarkMode ? 'text-emerald-200' : 'text-emerald-800'
                    }`}
                  >
                    <User className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>Pangalan ng Guardian (Display Name)</span>
                  </label>
                  <input
                    type="text"
                    value={inputUserName}
                    required
                    aria-required="true"
                    aria-invalid={nameError ? 'true' : 'false'}
                    aria-describedby={nameError ? 'guardian-name-error' : undefined}
                    onChange={(e) => {
                      setInputUserName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder={savedUserName ? `e.g. ${savedUserName}` : 'e.g. Rhonzo'}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-1 transition-colors ${
                      nameError
                        ? isDarkMode
                          ? 'bg-[#0b1411]/40 border-rose-400/70 text-white focus:border-rose-400 focus:ring-rose-400'
                          : 'bg-emerald-50 border-rose-300 text-emerald-950 focus:border-rose-500 focus:ring-rose-500'
                        : isDarkMode
                          ? 'bg-[#0b1411]/40 border-white/15 text-white placeholder-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-950 placeholder-emerald-400 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  />

                  {nameError && (
                    <p
                      id="guardian-name-error"
                      className={`mt-1.5 flex items-start gap-1 text-[11px] font-bold ${
                        isDarkMode ? 'text-rose-300' : 'text-rose-600'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3 mt-px shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                {/* 4-Digit PIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      <Lock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span>4-Digit Private Journal PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className={`text-[11px] flex items-center gap-1 cursor-pointer ${
                        isDarkMode ? 'text-emerald-300/80 hover:text-white' : 'text-emerald-700 hover:text-emerald-950'
                      }`}
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPin ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    value={inputPin}
                    required
                    aria-required="true"
                    aria-invalid={pinError ? 'true' : 'false'}
                    aria-describedby={pinError ? 'guardian-pin-error' : undefined}
                    onChange={(e) => {
                      setInputPin(e.target.value.replace(/\D/g, ''));
                      if (pinError) setPinError(null);
                    }}
                    placeholder={savedPin || '1234'}
                    className={`w-full px-4 py-3 rounded-2xl border text-lg font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-1 transition-colors ${
                      pinError
                        ? isDarkMode
                          ? 'bg-[#0b1411]/40 border-rose-400/70 text-white focus:border-rose-400 focus:ring-rose-400'
                          : 'bg-emerald-50 border-rose-300 text-emerald-950 focus:border-rose-500 focus:ring-rose-500'
                        : isDarkMode
                          ? 'bg-[#0b1411]/40 border-white/15 text-white focus:border-emerald-400 focus:ring-emerald-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-950 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  />

                  {pinError ? (
                    <p
                      id="guardian-pin-error"
                      className={`mt-1.5 flex items-start gap-1 text-[11px] font-bold ${
                        isDarkMode ? 'text-rose-300' : 'text-rose-600'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3 mt-px shrink-0" />
                      <span>{pinError}</span>
                    </p>
                  ) : (
                    <p className={`text-[10px] mt-1 text-center ${isDarkMode ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
                      Tip: Kung default ang iyong setup, ang PIN ay <strong>1234</strong>.
                    </p>
                  )}
                </div>
              </div>

              {/* Main Login Button — flat emerald, no gradient */}
              <button
                onClick={() => handleDoLogin()}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mb-4"
              >
                <span>Pumasok sa Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social Login Options */}
              <div className="relative flex py-2 items-center mb-3">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-emerald-100'}`} />
                <span
                  className={`flex-shrink mx-3 text-[10px] font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-emerald-300/60' : 'text-emerald-700/60'
                  }`}
                >
                  O gamitin ang mabilisang pag-login
                </span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-emerald-100'}`} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleDoLogin('Google')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                  }`}
                >
                  {/* Google's own logo keeps its official brand colors — the only
                      non-emerald/white marks in this screen, since recoloring a
                      third-party brand mark would misrepresent it. */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  onClick={() => handleDoLogin('Apple')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <svg className={`w-4 h-4 fill-current ${isDarkMode ? 'text-white' : 'text-emerald-900'}`} viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.78 1.42-.59.68-1.11 1.79-.97 2.87 1.06.08 2.14-.54 2.78-1.3" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Sign up — a single button, no accompanying text */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-white/10' : 'border-emerald-100'}`}>
                <button
                  onClick={onStartOnboarding}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <span>Mag-register at Mag-ampon ng Alaga</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer
        className={`relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] pt-4 border-t ${
          isDarkMode ? 'text-emerald-300/60 border-white/10' : 'text-emerald-700/70 border-emerald-100'
        }`}
      >
        <span>&copy; 2026 Hangin &bull; Progressive Web App (PWA) &bull; Philippines Mental Health</span>
        <div className="flex items-center gap-3 mt-2 sm:mt-0 font-medium">
          <span>Toll-Free Hotline: 1553</span>
          <span>&bull;</span>
          <span>Globe: 0966-351-4518</span>
          <span>&bull;</span>
          <span>Smart: 0908-639-2672</span>
        </div>
      </footer>
    </div>
  );
};
