import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Camera,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Shield,
  Sparkles,
  Phone,
  Compass,
  FileText,
  Sliders,
  Calendar,
  ChevronLeft,
  Circle,
  Menu,
} from 'lucide-react';
import { PetSpecies } from '../types';

interface PhoneHomeScreenProps {
  onLaunchHangin: () => void;
  onLaunchMinimizer: () => void;
  companionSpecies: PetSpecies;
  companionName: string;
  isShieldActive?: boolean;
}

export const PhoneHomeScreen: React.FC<PhoneHomeScreenProps> = ({
  onLaunchHangin,
  onLaunchMinimizer,
  companionSpecies,
  companionName,
  isShieldActive = true,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[640px] bg-gradient-to-b from-[#0b141a] via-[#091815] to-[#040a08] text-white flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden font-sans">
      {/* Dynamic Background Organic Fluid Wallpaper (Photo 6 style) */}
      <div className="absolute -top-10 -left-10 w-96 h-96 rounded-full bg-emerald-600/15 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full bg-teal-700/15 blur-[70px] pointer-events-none" />

      {/* Top Phone Status Bar */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs font-semibold text-white/80 px-2 pt-1">
        <span className="font-mono font-bold tracking-tight">{timeStr}</span>
        <div className="flex items-center gap-2">
          {isShieldActive && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Shield Active</span>
            </span>
          )}
          <span className="text-xs font-mono">100%</span>
        </div>
      </div>

      {/* Hero Widgets Section (Photo 6 style) */}
      <div className="relative z-10 flex flex-col items-center my-3 text-center">
        <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-white drop-shadow-md">
          {timeStr}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-emerald-300/90 mt-1">
          {dateStr || 'Wednesday, Oct 24'}
        </p>

        {/* Mindful Daily Companion Widget Card (Tappable to launch Hangin) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLaunchHangin}
          className="mt-4 w-full max-w-xs p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-xs text-white/95 flex items-center justify-between cursor-pointer shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
              {companionSpecies === 'dog' ? '🐶' : '🐱'}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <span>{companionName}</span>
                <span className="text-[10px] bg-[#58cc02] text-black font-extrabold px-1.5 rounded-full">
                  Waiting
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Tap to enter your mindful sanctuary
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        </motion.div>
      </div>

      {/* Phone App Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-y-5 gap-x-3 my-auto max-w-sm mx-auto w-full px-2">
        {/* 1. HANGIN (PRIMARY APP) */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onLaunchHangin}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#58cc02] via-[#46a302] to-emerald-800 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(88,204,2,0.45)] border-2 border-emerald-300/40 group-hover:border-white transition-all">
            <span className="text-2xl">🌿</span>
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#091815]">
              1
            </span>
          </div>
          <span className="text-xs font-black mt-1.5 text-emerald-300 tracking-wide drop-shadow-sm">
            hangin
          </span>
        </motion.div>

        {/* 2. PHONE MINIMIZER */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLaunchMinimizer}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/30 text-white flex items-center justify-center shadow-lg group-hover:border-emerald-400 transition-all">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Minimizer</span>
        </motion.div>

        {/* 3. Journal / Notes */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLaunchHangin}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-600/90 text-white flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Journal</span>
        </motion.div>

        {/* 4. Photos */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center cursor-pointer opacity-85 hover:opacity-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Photos</span>
        </motion.div>

        {/* 5. Camera */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center cursor-pointer opacity-85 hover:opacity-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-700 text-white flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Camera</span>
        </motion.div>

        {/* 6. Clock */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center cursor-pointer opacity-85 hover:opacity-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-lg border border-white/10">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Clock</span>
        </motion.div>

        {/* 7. Settings / Digital Shield */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLaunchHangin}
          className="flex flex-col items-center cursor-pointer opacity-85 hover:opacity-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-lg">
            <Sliders className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Shield</span>
        </motion.div>

        {/* 8. Browser */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center cursor-pointer opacity-85 hover:opacity-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium mt-1.5 text-white/90">Browser</span>
        </motion.div>
      </div>

      {/* Bottom Dock (Photo 6) */}
      <div className="relative z-10 w-full max-w-xs mx-auto p-2.5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-around shadow-2xl mb-2">
        <button
          onClick={() => {}}
          className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={() => {}}
          className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          onClick={onLaunchHangin}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#58cc02] to-emerald-700 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform relative"
        >
          <span className="text-2xl">🌿</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-[#091815]" />
        </button>

        <button
          onClick={onLaunchMinimizer}
          className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/30 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
          title="Minimizer Mode"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
