import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Smartphone,
  Monitor,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Gift,
  ChevronDown,
  ChevronUp,
  Shield,
  Home,
  CheckCircle,
} from 'lucide-react';
import { PetSpecies, TimeOfDay } from '../types';
import { getPhilippineTime } from '../utils/timeUtils';

interface PrototypeTesterBarProps {
  species: PetSpecies;
  onToggleSpecies: (s: PetSpecies) => void;
  viewMode: 'web' | 'phone';
  onToggleViewMode: (mode: 'web' | 'phone') => void;
  timeOfDay?: TimeOfDay;
  onAddPoints: (amount: number) => void;
  onTriggerCrisis: () => void;
  onResetStats: () => void;
  onOpenGuide: () => void;
  onTestReveal: () => void;
  onOpenTutorial?: () => void;
  onOpenPhoneHome?: () => void;
  onOpenMinimizer?: () => void;
}

export const PrototypeTesterBar: React.FC<PrototypeTesterBarProps> = ({
  species,
  onToggleSpecies,
  viewMode,
  onToggleViewMode,
  onAddPoints,
  onTriggerCrisis,
  onResetStats,
  onOpenGuide,
  onTestReveal,
  onOpenTutorial,
  onOpenPhoneHome,
  onOpenMinimizer,
}) => {
  // Start collapsed by default on phones and smaller screens so it doesn't obstruct preview
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [phTime, setPhTime] = useState(() => getPhilippineTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setPhTime(getPhilippineTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#0d1e14]/95 backdrop-blur-md text-emerald-100 border-b border-emerald-800/60 text-xs select-none z-50 transition-all sticky top-0 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-black text-amber-300">
            <Wrench className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Prototype Controls</span>
          </span>
          <span className="hidden md:inline text-[11px] text-emerald-400/90 font-medium">
            &bull; 🇵🇭 PST: <span className="font-mono text-emerald-300 font-bold">{phTime.timeFullStr}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Pet Toggle right in header */}
          <button
            onClick={() => onToggleSpecies(species === 'dog' ? 'cat' : 'dog')}
            className="px-2 py-0.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 text-[10px] font-bold border border-emerald-700/60 transition-colors cursor-pointer"
          >
            {species === 'dog' ? '🐶 Dog' : '🐱 Cat'}
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer border border-emerald-700/60"
            title="Open Claude Prototype Tutorial & Evaluation Guide"
          >
            <HelpCircle className="w-3 h-3 text-amber-300" />
            <span>Guide</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-300 cursor-pointer flex items-center gap-0.5 text-[10px] font-semibold"
            title={isExpanded ? 'Collapse Toolbar' : 'Expand Toolbar'}
          >
            <span>{isExpanded ? 'Less' : 'More'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-6xl mx-auto px-3 pb-2 pt-1 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
          {/* Companion Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Pet:</span>
            <button
              onClick={() => onToggleSpecies('dog')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                species === 'dog'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs scale-105'
                  : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200'
              }`}
            >
              <span>🐶 Dog</span>
            </button>
            <button
              onClick={() => onToggleSpecies('cat')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                species === 'cat'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs scale-105'
                  : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200'
              }`}
            >
              <span>🐱 Cat</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Layout:</span>
            <button
              onClick={() => onToggleViewMode('web')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Web</span>
            </button>
            <button
              onClick={() => onToggleViewMode('phone')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'phone'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Phone</span>
            </button>
          </div>

          {/* Quick Prototype Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onOpenPhoneHome && (
              <button
                onClick={onOpenPhoneHome}
                className="px-2 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 font-bold flex items-center gap-1 cursor-pointer border border-emerald-700/60"
                title="View Phone Home Screen & Launcher"
              >
                <Home className="w-3 h-3 text-emerald-400" />
                <span>Phone Home</span>
              </button>
            )}

            {onOpenMinimizer && (
              <button
                onClick={onOpenMinimizer}
                className="px-2 py-1 rounded-lg bg-black hover:bg-zinc-900 text-white font-bold flex items-center gap-1 cursor-pointer border border-zinc-700"
                title="Launch AMOLED Phone Minimizer (Photo #4)"
              >
                <Smartphone className="w-3 h-3 text-white" />
                <span>Photo #4 Minimizer</span>
              </button>
            )}

            <button
              onClick={onTestReveal}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
              title="Test Duolingo Survey & Onboarding (Photos #5 & 6)"
            >
              <CheckCircle className="w-3 h-3 text-white" />
              <span>Onboarding (Photo #5,6)</span>
            </button>

            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="px-2.5 py-1 rounded-lg bg-[#58cc02] hover:bg-[#46a302] text-white font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                title="Open Spotlight In-App Tutorial"
              >
                <span>💡 Tutorial</span>
              </button>
            )}

            <button
              onClick={() => onAddPoints(20)}
              className="px-2 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 font-semibold flex items-center gap-1 cursor-pointer border border-emerald-800/60"
            >
              <Sparkles className="w-3 h-3" />
              <span>+20 WP</span>
            </button>

            <button
              onClick={onTriggerCrisis}
              className="px-2 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 font-semibold flex items-center gap-1 cursor-pointer border border-rose-800/50"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Crisis Safety</span>
            </button>

            <button
              onClick={onResetStats}
              className="px-2 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer border border-emerald-800/60"
              title="Reset state to fresh start"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
