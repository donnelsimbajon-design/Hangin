import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Utensils,
  Bath,
  Moon,
  Sun,
  Smile,
  Compass,
  CheckCircle2,
  AlertCircle,
  Apple,
  Droplets,
} from 'lucide-react';
import { ThreePetCanvas } from './ThreePetCanvas';
import { PetSpecies, PetAnimationMood, PetStats, EquippedAccessories, Inventory } from '../types';

interface CompanionStageProps {
  species: PetSpecies;
  companionName: string;
  stats: PetStats;
  equipped: EquippedAccessories;
  inventory: Inventory;
  points: number;
  onUpdateStats: (newStats: Partial<PetStats>) => void;
  onUseInventory: (item: keyof Inventory) => boolean;
  onAddPoints: (amount: number) => void;
  onOpenMindfulStudio: () => void;
}

export const CompanionStage: React.FC<CompanionStageProps> = ({
  species,
  companionName,
  stats,
  equipped,
  inventory,
  onUpdateStats,
  onUseInventory,
  onAddPoints,
  onOpenMindfulStudio,
}) => {
  const [currentMood, setCurrentMood] = useState<PetAnimationMood>(
    stats.isSleeping ? 'sleeping' : 'idle'
  );
  const [interactionToast, setInteractionToast] = useState<string | null>(null);
  const [showFeedDrawer, setShowFeedDrawer] = useState(false);

  const showToast = (msg: string) => {
    setInteractionToast(msg);
    setTimeout(() => setInteractionToast(null), 2400);
  };

  const handlePet = () => {
    if (stats.isSleeping) {
      showToast(`${companionName} is peacefully sleeping... 💤`);
      return;
    }
    setCurrentMood('happy');
    onUpdateStats({
      happiness: Math.min(100, stats.happiness + 6),
      health: Math.min(100, stats.health + 1),
    });
    showToast(`*purrs and wags gently* ${companionName} feels loved! ✨`);
    setTimeout(() => setCurrentMood('idle'), 3000);
  };

  const handleFeed = (item: keyof Inventory, name: string, hungerGain: number) => {
    const success = onUseInventory(item);
    if (!success) {
      showToast(`No ${name} left in inventory. Visit the Market! 🍎`);
      return;
    }
    setCurrentMood('eating');
    onUpdateStats({
      hunger: Math.min(100, stats.hunger + hungerGain),
      happiness: Math.min(100, stats.happiness + 4),
      health: Math.min(100, stats.health + 2),
    });
    showToast(`${companionName} enjoyed the fresh ${name}! 😋`);
    setTimeout(() => {
      setCurrentMood('happy');
      setTimeout(() => setCurrentMood('idle'), 2200);
    }, 2500);
  };

  const handleBathe = () => {
    if (inventory.soap <= 0) {
      showToast('Need gentle soap from the Market! 🧼');
      return;
    }
    onUseInventory('soap');
    setCurrentMood('bathing');
    onUpdateStats({
      cleanliness: 100,
      happiness: Math.min(100, stats.happiness + 8),
      isSoapy: false,
    });
    showToast('Bath time! Fresh, bubbly and clean ✨');
    setTimeout(() => {
      setCurrentMood('happy');
      setTimeout(() => setCurrentMood('idle'), 2400);
    }, 3200);
  };

  const handleToggleSleep = () => {
    if (stats.isSleeping) {
      onUpdateStats({ isSleeping: false });
      setCurrentMood('idle');
      showToast(`${companionName} woke up refreshed and ready! ☀️`);
    } else {
      onUpdateStats({
        isSleeping: true,
        energy: Math.min(100, stats.energy + 25),
      });
      setCurrentMood('sleeping');
      showToast(`Tucked ${companionName} in for a peaceful nap 🌙`);
    }
  };

  const handleWalk = () => {
    if (stats.energy < 15) {
      showToast(`${companionName} is too sleepy for a walk. Let them rest! 😴`);
      return;
    }
    onUpdateStats({
      happiness: Math.min(100, stats.happiness + 12),
      energy: Math.max(0, stats.energy - 10),
      health: Math.min(100, stats.health + 4),
    });
    onAddPoints(2);
    setCurrentMood('happy');
    showToast('Nature stroll in the fresh air (+2 WP, +12 Happiness) 🍃');
    setTimeout(() => setCurrentMood('idle'), 3000);
  };

  // Calming companion affirmations
  const getAffirmation = () => {
    if (stats.hunger < 30) return `${companionName} is feeling hungry. A light snack would help!`;
    if (stats.cleanliness < 35) return `A warm bubble bath would make ${companionName} feel so fresh.`;
    if (stats.energy < 30) return `Taking breaks is productive too. Let's rest our eyes.`;
    if (stats.happiness > 80) return `"You are doing wonderful today. Take things one breath at a time."`;
    return `"I am right here with you. Whatever comes, we can handle it gently."`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Model Stage Container */}
      <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-3xl bg-gradient-to-b from-[#eaf4eb] to-[#d8ebdb] dark:from-[#132219] dark:to-[#0d1712] border border-[#d2e4d5] dark:border-[#1e3829] shadow-inner overflow-hidden flex items-center justify-center">
        {/* Soft atmospheric background lights */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.7),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_25%,rgba(70,140,95,0.18),transparent_70%)]" />

        {/* Top Companion Status Badges */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-700/30 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-100">
              {companionName}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 capitalize font-medium">
              &bull; {species}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {stats.isSleeping && (
              <span className="inline-flex items-center gap-1 bg-indigo-900/70 text-indigo-100 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-xs">
                <Moon className="w-3 h-3 text-indigo-300" /> Sleeping
              </span>
            )}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40 text-xs font-bold text-amber-900 dark:text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{Math.round(stats.happiness)}% happy</span>
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <ThreePetCanvas
          species={species}
          animationMood={stats.isSleeping ? 'sleeping' : currentMood}
          equipped={equipped}
          onPet={handlePet}
        />

        {/* Live Interaction Toast */}
        <AnimatePresence>
          {interactionToast && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute bottom-12 px-4 py-2 rounded-xl bg-emerald-900/90 text-emerald-50 text-xs font-medium backdrop-blur-md shadow-lg pointer-events-none z-20 border border-emerald-700/40"
            >
              {interactionToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Companion Affirmation Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-3 p-3.5 rounded-2xl bg-white/90 dark:bg-[#14231a] border border-[#dce9de] dark:border-[#223d2d] shadow-xs flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300">
          <Smile className="w-5 h-5" />
        </div>
        <p className="text-xs text-emerald-900 dark:text-emerald-200 italic font-medium leading-relaxed">
          {getAffirmation()}
        </p>
      </motion.div>

      {/* Calming Stat Bars */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        {/* Fullness / Hunger */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#14231a] border border-[#deecdf] dark:border-[#1e3829] shadow-2xs">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#274735] dark:text-emerald-200 mb-1">
            <span className="flex items-center gap-1">
              <Utensils className="w-3 h-3 text-orange-500" /> Fullness
            </span>
            <span>{Math.round(stats.hunger)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-orange-400"
              style={{ width: `${stats.hunger}%` }}
            />
          </div>
        </div>

        {/* Cleanliness */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#14231a] border border-[#deecdf] dark:border-[#1e3829] shadow-2xs">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#274735] dark:text-emerald-200 mb-1">
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3 text-sky-500" /> Clean
            </span>
            <span>{Math.round(stats.cleanliness)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 to-teal-400"
              style={{ width: `${stats.cleanliness}%` }}
            />
          </div>
        </div>

        {/* Energy */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#14231a] border border-[#deecdf] dark:border-[#1e3829] shadow-2xs">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#274735] dark:text-emerald-200 mb-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> Energy
            </span>
            <span>{Math.round(stats.energy)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-300 to-yellow-500"
              style={{ width: `${stats.energy}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#14231a] border border-[#deecdf] dark:border-[#1e3829] shadow-2xs">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#274735] dark:text-emerald-200 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" /> Health
            </span>
            <span>{Math.round(stats.health)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-400 to-emerald-500"
              style={{ width: `${stats.health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Companion Action Bar */}
      <div className="w-full grid grid-cols-5 gap-2 mt-3.5">
        {/* Feed */}
        <button
          onClick={() => setShowFeedDrawer(!showFeedDrawer)}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
            showFeedDrawer
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
              : 'bg-white dark:bg-[#15241b] text-emerald-950 dark:text-emerald-100 border-[#dce8de] dark:border-[#223d2c] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95'
          }`}
        >
          <Utensils className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
          <span className="text-[11px] font-semibold">Feed</span>
        </button>

        {/* Bathe */}
        <button
          onClick={handleBathe}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#15241b] text-emerald-950 dark:text-emerald-100 border border-[#dce8de] dark:border-[#223d2c] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <Bath className="w-5 h-5 text-sky-600 dark:text-sky-400 mb-1" />
          <span className="text-[11px] font-semibold">Bathe</span>
        </button>

        {/* Nap / Wake */}
        <button
          onClick={handleToggleSleep}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
            stats.isSleeping
              ? 'bg-indigo-900 text-indigo-50 border-indigo-950 shadow-sm'
              : 'bg-white dark:bg-[#15241b] text-emerald-950 dark:text-emerald-100 border-[#dce8de] dark:border-[#223d2c] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 shadow-2xs'
          }`}
        >
          {stats.isSleeping ? (
            <>
              <Sun className="w-5 h-5 text-amber-300 mb-1" />
              <span className="text-[11px] font-semibold">Wake</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-1" />
              <span className="text-[11px] font-semibold">Sleep</span>
            </>
          )}
        </button>

        {/* Nature Stroll */}
        <button
          onClick={handleWalk}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#15241b] text-emerald-950 dark:text-emerald-100 border border-[#dce8de] dark:border-[#223d2c] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[11px] font-semibold">Walk</span>
        </button>

        {/* Mindful Studio */}
        <button
          onClick={onOpenMindfulStudio}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white border border-emerald-700 hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-5 h-5 text-amber-200 mb-1" />
          <span className="text-[11px] font-semibold">Breathe</span>
        </button>
      </div>

      {/* Feed Snacks Drawer */}
      <AnimatePresence>
        {showFeedDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-3 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                Pantry &amp; Refreshments
              </span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300">
                Tap an item to nourish {companionName}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleFeed('apple', 'Apple', 20)}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-[#1c2e22] border border-amber-100 dark:border-emerald-800/40 text-center hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-xl">🍎</span>
                <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-100 mt-1">Apple</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">x{inventory.apple}</span>
              </button>

              <button
                onClick={() => handleFeed('banana', 'Banana', 22)}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-[#1c2e22] border border-amber-100 dark:border-emerald-800/40 text-center hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-xl">🍌</span>
                <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-100 mt-1">Banana</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">x{inventory.banana}</span>
              </button>

              <button
                onClick={() => handleFeed('riceBowl', 'Rice Bowl', 35)}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-[#1c2e22] border border-amber-100 dark:border-emerald-800/40 text-center hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-xl">🍚</span>
                <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-100 mt-1">Rice</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">x{inventory.riceBowl}</span>
              </button>

              <button
                onClick={() => handleFeed('water', 'Fresh Water', 12)}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-[#1c2e22] border border-amber-100 dark:border-emerald-800/40 text-center hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-xl">💧</span>
                <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-100 mt-1">Water</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">x{inventory.water}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
