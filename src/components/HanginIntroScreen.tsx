import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Shield,
  BookOpen,
  Users,
  Lock,
  ArrowRight,
  User,
  CheckCircle2,
  Wind,
  PhoneCall,
  Play,
  KeyRound,
  Eye,
  EyeOff,
  Download,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetSpecies } from '../types';

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
  savedUserName = 'Guardian',
  savedPin = '1234',
  species = 'dog',
  onInstallPWA,
  isPWAInstallable = false,
}) => {
  const [activeView, setActiveView] = useState<'intro' | 'login'>('intro');
  const [inputUserName, setInputUserName] = useState(savedUserName);
  const [inputPin, setInputPin] = useState(savedPin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isBreatheIn, setIsBreatheIn] = useState(true);

  // Soft breathing loop indicator
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIsBreatheIn((prev) => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDoLogin = (authProvider?: string) => {
    setLoginError(null);
    const trimmedUser = inputUserName.trim() || (authProvider ? `${authProvider} Guardian` : 'Guardian');
    const finalPin = inputPin.trim() || '1234';

    if (finalPin.length !== 4) {
      setLoginError('Paki-lagay ang iyong 4-digit PIN (Halimbawa: 1234)');
      return;
    }

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
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#13221b] via-[#0e1a15] to-[#0b1411] text-emerald-50 flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-x-hidden font-sans">
      {/* Organic Ambient Breathing Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-emerald-500/12 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      {/* Top Bar: Brand, Quick Crisis Indicator & PWA Install */}
      <header className="relative z-20 w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2f7a56] to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">🍃</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white leading-tight flex items-center gap-1.5">
              <span>hangin</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                PWA
              </span>
            </h1>
            <p className="text-[11px] text-emerald-300/80 font-medium">
              Mindful Companion &amp; Sanctuary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Install PWA in Top Bar (Available on both Intro and Login) */}
          {onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-100 shadow-sm transition-all cursor-pointer backdrop-blur-md active:scale-95"
              title="I-install ang Hangin sa phone o home screen"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
              <span className="hidden sm:inline">I-install</span>
              <span>App</span>
            </button>
          )}

          {/* Quick 24/7 Lifeline Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-[11px] font-bold text-rose-300">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>24/7 Lifeline: 1553</span>
          </div>

          <button
            onClick={() => setActiveView(activeView === 'intro' ? 'login' : 'intro')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-emerald-100 transition-all cursor-pointer backdrop-blur-md"
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
              {/* Soothing Breathing Leaf Cue */}
              <div className="relative mb-6">
                <motion.div
                  animate={{
                    scale: isBreatheIn ? 1.08 : 0.94,
                    opacity: isBreatheIn ? 0.9 : 0.65,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500/25 to-teal-400/15 border border-emerald-400/30 flex flex-col items-center justify-center p-3 shadow-2xl backdrop-blur-lg"
                >
                  <Wind className="w-8 h-8 text-emerald-300 animate-pulse mb-1" />
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
                    {isBreatheIn ? 'Huminga' : 'Ilabas'}
                  </span>
                </motion.div>
                <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-ping opacity-25 pointer-events-none" />
              </div>

              {/* Catchy Empathetic Taglines */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Isang Ihip ng Kapayapaan</span>
              </div>

              {/* Official Brand Tagline */}
              <p className="text-xs font-black tracking-widest uppercase text-emerald-400/90 mb-3">
                &ldquo;We hear you.&rdquo;
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight max-w-xl">
                Huminga nang malalim. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300 bg-clip-text text-transparent">
                  Ligtas ka rito sa Hangin.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/80 max-w-lg mx-auto mb-6 leading-relaxed font-normal">
                Ang iyong 3D animal companion na laging handang makinig, gumabay sa self-care, at magbigay-lakas sa araw-araw nang walang panghuhusga.
              </p>

              {/* Dedicated PWA Mobile App Card on Intro Page */}
              {onInstallPWA && (
                <div className="w-full max-w-md mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-r from-[#13221b]/85 via-[#182a22]/90 to-[#14251b]/85 border border-emerald-400/25 backdrop-blur-md flex items-center justify-between gap-3 text-left shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl flex-shrink-0">
                      📲
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">Gamitin Bilang Phone App (PWA)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-[9px] font-extrabold text-emerald-300 border border-emerald-400/30 uppercase">
                          No App Store
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-snug">
                        I-install sa Android o iPhone para sa 1-tap home screen access at full-screen view.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onInstallPWA}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>I-install</span>
                  </button>
                </div>
              )}

              {/* 4 Sanctuary Feature Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-1.5">🐶🐱</span>
                  <h4 className="text-xs font-bold text-emerald-200">Realistic 3D Pet</h4>
                  <p className="text-[10px] text-emerald-300/70 mt-0.5">Emosyonal na reaksyon at alaga</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-1.5">🛁🍎</span>
                  <h4 className="text-xs font-bold text-emerald-200">Pou-Like Care</h4>
                  <p className="text-[10px] text-emerald-300/70 mt-0.5">Liguan, pakainin, mini-games</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-1.5">🔒📖</span>
                  <h4 className="text-xs font-bold text-emerald-200">Locked Journal</h4>
                  <p className="text-[10px] text-emerald-300/70 mt-0.5">Private PIN para sa damdamin</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-1.5">💬🤝</span>
                  <h4 className="text-xs font-bold text-emerald-200">Safe AI &amp; 1553</h4>
                  <p className="text-[10px] text-emerald-300/70 mt-0.5">Bayanihan at crisis safety</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <button
                  onClick={onStartOnboarding}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#2f7a56] hover:from-emerald-400 hover:to-[#256049] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Mag-umpisa (Get Started)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('login')}
                  className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                  <span>Mag-log In</span>
                </button>
              </div>

              {/* One-tap Quick Demo */}
              <button
                onClick={onGuestAccess}
                className="mt-4 text-xs font-medium text-emerald-300/80 hover:text-emerald-200 hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Subukan agad bilang Guest Guardian (No Sign Up)</span>
                <span>&rarr;</span>
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
              className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white/10 dark:bg-[#182a22]/85 border border-white/15 dark:border-emerald-500/30 backdrop-blur-2xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg">
                    🔑
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Guardian Login</h3>
                    <p className="text-[11px] text-emerald-300/80">I-enter ang iyong profile para makapasok</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('intro')}
                  className="text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Bumalik
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 font-medium">
                  {loginError}
                </div>
              )}

              {/* PWA Install shortcut banner inside Login Page */}
              {onInstallPWA && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-sm flex-shrink-0">
                      📱
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        I-install sa iyong Phone
                      </span>
                      <span className="text-[10px] text-emerald-300/80 block">
                        1-tap access mula sa Home Screen
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onInstallPWA}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-emerald-100 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 text-emerald-300" />
                    <span>Install</span>
                  </button>
                </div>
              )}

              <div className="space-y-4 mb-5">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pangalan ng Guardian (Display Name)</span>
                  </label>
                  <input
                    type="text"
                    value={inputUserName}
                    onChange={(e) => setInputUserName(e.target.value)}
                    placeholder="e.g. Guardian, Rhonzo"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0b1411]/40 border border-white/15 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>

                {/* 4-Digit PIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>4-Digit Private Journal PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[11px] text-emerald-300/80 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPin ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0b1411]/40 border border-white/15 text-white text-lg font-mono tracking-widest text-center focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors font-bold"
                  />
                  <p className="text-[10px] text-emerald-300/70 mt-1 text-center">
                    Tip: Kung default ang iyong setup, ang PIN ay <strong>1234</strong>.
                  </p>
                </div>
              </div>

              {/* Main Login Button */}
              <button
                onClick={() => handleDoLogin()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#2f7a56] hover:from-emerald-400 hover:to-[#256049] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mb-4"
              >
                <span>Pumasok sa Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social Login Options */}
              <div className="relative flex py-2 items-center mb-3">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-emerald-300/60 uppercase tracking-wider">
                  O gamitin ang mabilisang pag-login
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleDoLogin('Google')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
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
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.78 1.42-.59.68-1.11 1.79-.97 2.87 1.06.08 2.14-.54 2.78-1.3" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Switch to New Account (Onboarding) */}
              <div className="pt-3 border-t border-white/10 text-center">
                <p className="text-xs text-emerald-200/80 mb-1.5">
                  Wala ka pa bang account o gusto mong pumili ng bagong alaga?
                </p>
                <button
                  onClick={onStartOnboarding}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  Mag-register at Mag-ampon ng Alaga &rarr;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300/60 pt-4 border-t border-white/10">
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
