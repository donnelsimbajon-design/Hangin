import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  Wifi,
  Battery,
  ChevronLeft,
  Settings,
  Bell,
  Search,
  MessageCircle,
  Camera,
  Calendar,
  Compass,
} from 'lucide-react';
import { getPhilippineTime } from '../utils/timeUtils';

interface SimulatedShellProps {
  children: React.ReactNode;
  companionName: string;
  onResetProgress: () => void;
  onLaunchTutorial: () => void;
}

export const SimulatedShell: React.FC<SimulatedShellProps> = ({
  children,
  companionName,
  onResetProgress,
  onLaunchTutorial,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'phone' | 'full'>('desktop');
  const [isAppOpen, setIsAppOpen] = useState(true);

  // Philippine Time State
  const [phTime, setPhTime] = useState(() => getPhilippineTime());
  const [resetFeedback, setResetFeedback] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhTime(getPhilippineTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTestReset = () => {
    onResetProgress();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 3000);
  };

  // If full window, render children directly without outer chrome
  if (deviceMode === 'full') {
    return (
      <div className="relative w-full min-h-screen">
        <div className="fixed top-2 right-2 z-50 flex items-center gap-1.5 bg-[#0b1411]/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs shadow-lg">
          <button
            onClick={() => setDeviceMode('desktop')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            title="Return to Computer Shell"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Computer View</span>
          </button>
          <button
            onClick={() => setDeviceMode('phone')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            title="Switch to Phone Shell"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Frame</span>
          </button>
          <button
            onClick={handleTestReset}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 transition-colors cursor-pointer text-white font-bold"
            title="Reset to test greetings, survey and account"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Flow</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 selection:bg-emerald-500 selection:text-white">
      {/* Top Test Bench Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md mb-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 flex items-center gap-1">
            💻 Simulated Testing Environment
          </span>
          <span className="hidden sm:inline text-slate-400">
            &bull; Philippine Standard Time: <span className="text-emerald-300 font-mono font-bold">🇵🇭 {phTime.timeFullStr}</span> ({phTime.phaseLabel})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                deviceMode === 'desktop' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computer OS</span>
            </button>
            <button
              onClick={() => setDeviceMode('phone')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                deviceMode === 'phone' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>
            <button
              onClick={() => setDeviceMode('full')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              title="Expand to Fullscreen"
            >
              <span>Full View</span>
            </button>
          </div>

          {/* Quick Testing Reset Button */}
          <button
            onClick={handleTestReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 border border-rose-700/60 text-rose-100 font-bold cursor-pointer transition-colors text-xs shadow-xs"
            title="Reset to test greetings, survey & account creation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset &amp; Test Onboarding</span>
          </button>
        </div>
      </div>

      {resetFeedback && (
        <div className="w-full max-w-5xl mb-2 px-4 py-2 rounded-xl bg-emerald-800/90 text-white text-xs font-bold text-center border border-emerald-500 shadow-md">
          ✨ App state reset! You can now test the Greetings, Wellbeing Survey, and Account Creation flow from scratch!
        </div>
      )}

      {/* =========================================================
          MODE 1: SIMULATED COMPUTER WORKSTATION / OS DESKTOP
          ========================================================= */}
      {deviceMode === 'desktop' && (
        <div className="w-full max-w-5xl h-[86vh] rounded-3xl bg-gradient-to-tr from-slate-950 via-[#13221b] to-emerald-950 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          {/* OS Desktop Wallpaper & Icons */}
          <div className="flex-1 p-6 relative flex flex-col justify-between">
            {/* Desktop App Icons */}
            <div className="grid grid-cols-1 gap-4 w-24">
              {/* Hangin App Icon on Desktop */}
              <button
                onClick={() => setIsAppOpen(true)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 group cursor-pointer transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-300 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                  🌿
                </div>
                <span className="text-[11px] font-bold text-white text-center drop-shadow-md">
                  Hangin
                </span>
              </button>

              {/* Other OS Apps */}
              <button className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-white/10 group opacity-75">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 flex items-center justify-center text-xl shadow-md">
                  📁
                </div>
                <span className="text-[10px] text-slate-300">Files</span>
              </button>

              <button className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-white/10 group opacity-75">
                <div className="w-12 h-12 rounded-2xl bg-sky-600/80 flex items-center justify-center text-xl shadow-md">
                  🌐
                </div>
                <span className="text-[10px] text-slate-300">Browser</span>
              </button>
            </div>

            {/* Hint Watermark */}
            <div className="text-right text-xs text-emerald-200/40 font-mono select-none pointer-events-none">
              Hangin Desktop OS &bull; Click Hangin icon to open
            </div>
          </div>

          {/* ACTIVE HANGIN APP WINDOW (Floating / Centered OS Window) */}
          <AnimatePresence>
            {isAppOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="absolute inset-4 sm:inset-6 rounded-2xl bg-white dark:bg-[#0b1411] border border-slate-700 shadow-2xl flex flex-col overflow-hidden z-20"
              >
                {/* OS Window Title Bar */}
                <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAppOpen(false)}
                      className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 cursor-pointer"
                      title="Close"
                    />
                    <button
                      onClick={() => setIsAppOpen(false)}
                      className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 cursor-pointer"
                      title="Minimize"
                    />
                    <button
                      onClick={() => setDeviceMode('full')}
                      className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                      title="Maximize to Screen"
                    />
                    <span className="ml-2 text-xs font-bold text-slate-300 flex items-center gap-1">
                      🌿 Hangin &bull; Philippine Mental Health Companion
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-emerald-400">🇵🇭 {phTime.timeStr} PHT</span>
                  </div>
                </div>

                {/* App Content inside Window */}
                <div className="flex-1 overflow-y-auto">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OS Taskbar at Bottom */}
          <div className="h-12 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-between z-30 select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAppOpen(true)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs px-3 flex items-center gap-2 cursor-pointer"
              >
                <span>🌿 Start</span>
              </button>

              {/* Running Hangin App Tab */}
              <button
                onClick={() => setIsAppOpen(!isAppOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  isAppOpen ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <span>🌿 Hangin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>🇵🇭 {phTime.timeFullStr}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODE 2: SIMULATED SMARTPHONE ENVIRONMENT WITH REALISTIC FRAME
          ========================================================= */}
      {deviceMode === 'phone' && (
        <div className="w-[390px] h-[820px] max-h-[88vh] rounded-[48px] bg-[#1a231d] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[6px] border-slate-700 relative flex flex-col overflow-hidden">
          {/* Phone Dynamic Island / Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 rounded-full bg-black z-40 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            <div className="w-2 h-2 rounded-full bg-emerald-900/50" />
          </div>

          {/* Phone Screen Inner Bezel */}
          <div className="flex-1 rounded-[38px] bg-[#13221b] overflow-hidden flex flex-col relative border border-slate-800">
            {/* Phone Status Bar with Philippine Time */}
            <div className="h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-bold text-slate-300 select-none z-30">
              <span className="font-mono text-emerald-400">{phTime.timeStr}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400">PHT</span>
                <Wifi className="w-3 h-3 text-slate-300" />
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* If app is closed: Phone Homescreen */}
            {!isAppOpen ? (
              <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950">
                <div className="grid grid-cols-4 gap-4 pt-8 text-center">
                  <button
                    onClick={() => setIsAppOpen(true)}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-300 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                      🌿
                    </div>
                    <span className="text-[11px] font-semibold text-white">Hangin</span>
                  </button>

                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                      💬
                    </div>
                    <span className="text-[11px] text-slate-400">Messages</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                      📅
                    </div>
                    <span className="text-[11px] text-slate-400">Calendar</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                      ⚙️
                    </div>
                    <span className="text-[11px] text-slate-400">Settings</span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400 pb-4">
                  Tap <span className="text-emerald-400 font-bold">Hangin</span> app icon to launch
                </div>
              </div>
            ) : (
              /* If app is open: App Content with Phone Back Bar */
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto">{children}</div>

                {/* Phone Bottom Home Indicator Bar */}
                <div className="h-6 bg-transparent flex items-center justify-center select-none z-40">
                  <button
                    onClick={() => setIsAppOpen(false)}
                    className="w-32 h-1 rounded-full bg-slate-400/60 hover:bg-white transition-colors cursor-pointer"
                    title="Swipe / Click Home"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
