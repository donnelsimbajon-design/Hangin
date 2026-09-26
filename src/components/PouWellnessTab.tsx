import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  Bath,
  Moon,
  Sun,
  Trees,
  ShoppingBag,
  Sparkles,
  Heart,
  Pill,
  ShowerHead,
  Droplets,
  Wind,
  Smile,
  RefreshCw,
  Repeat,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CuteCompanion } from './CuteCompanion';
import { WellnessMiniGames } from './WellnessMiniGames';
import { PetSpecies, PetStats, EquippedAccessories, Inventory, PetAnimationMood } from '../types';

interface PouWellnessTabProps {
  species: PetSpecies;
  companionName: string;
  stats: PetStats;
  equipped: EquippedAccessories;
  inventory: Inventory;
  points: number;
  onUpdateStats: (newStats: Partial<PetStats>) => void;
  onUseInventory: (item: keyof Inventory) => boolean;
  onAddPoints: (amount: number) => void;
  onOpenChat?: () => void;
  onOpenMarket: () => void;
  onTriggerCrisisSafety?: () => void;
  onChangeSpecies?: (newSpecies: PetSpecies) => void;
}

type CareRoom = 'kitchen' | 'bathroom' | 'bedroom' | 'outside' | 'clinic';

interface DraggableTool {
  id: string;
  name: string;
  icon: string;
  type: 'food' | 'soap' | 'shower' | 'medicine' | 'toy' | 'thermometer';
  inventoryKey?: keyof Inventory;
  amount?: number;
}

export const PouWellnessTab: React.FC<PouWellnessTabProps> = ({
  species,
  companionName,
  stats,
  equipped,
  inventory,
  points,
  onUpdateStats,
  onUseInventory,
  onAddPoints,
  onOpenChat,
  onOpenMarket,
  onTriggerCrisisSafety,
  onChangeSpecies,
}) => {
  const [activeRoom, setActiveRoom] = useState<CareRoom>('kitchen');
  const [roomMood, setRoomMood] = useState<PetAnimationMood>(stats.isSleeping ? 'sleeping' : 'idle');
  const [interactionToast, setInteractionToast] = useState<string | null>(null);

  // Fridge door open state in kitchen
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);

  // Outside stormy weather state ("the outside its stormy so sad")
  const [isOutsideStormy, setIsOutsideStormy] = useState(true);

  // Dragging interaction state
  const [activeDragItem, setActiveDragItem] = useState<DraggableTool | null>(null);
  const [isHoveringPet, setIsHoveringPet] = useState(false);
  const [isShowerRunning, setIsShowerRunning] = useState(false);
  const [soapBubbles, setSoapBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Ball bouncing in outside room
  const [isBallThrown, setIsBallThrown] = useState(false);

  const petAreaRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setInteractionToast(msg);
    setTimeout(() => setInteractionToast(null), 2400);
  };

  // Sync mood with sleep
  useEffect(() => {
    if (stats.isSleeping) {
      setRoomMood('sleeping');
    } else if (roomMood === 'sleeping') {
      setRoomMood('idle');
    }
  }, [stats.isSleeping]);

  // Check if drag coordinates land on pet target
  const checkHitPet = (clientX: number, clientY: number): boolean => {
    if (!petAreaRef.current) return false;
    const rect = petAreaRef.current.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  // Drag End handler: execute action if dropped on pet
  const handleDragEnd = (event: any, info: any, item: DraggableTool) => {
    const clientX = info.point.x;
    const clientY = info.point.y;
    const hit = checkHitPet(clientX, clientY);

    if (hit) {
      applyItemAction(item);
    }
    setActiveDragItem(null);
    setIsHoveringPet(false);
  };

  const applyItemAction = (item: DraggableTool) => {
    if (item.type === 'food' && item.inventoryKey) {
      if ((inventory[item.inventoryKey] || 0) <= 0) {
        showToast(`No ${item.name} left in pantry! Get more at Market 🛍️`);
        return;
      }
      const success = onUseInventory(item.inventoryKey);
      if (!success) return;

      setRoomMood('eating');
      onUpdateStats({
        hunger: Math.min(100, stats.hunger + 24),
        happiness: Math.min(100, stats.happiness + 8),
        health: Math.min(100, stats.health + 4),
      });
      confetti({ particleCount: 22, spread: 50, origin: { y: 0.65 } });
      showToast(`*crunch nom nom* ${companionName} loved the tasty ${item.name}! 😋`);
      setTimeout(() => {
        setRoomMood('happy');
        setTimeout(() => setRoomMood('idle'), 1400);
      }, 2200);
    } else if (item.type === 'soap') {
      if (inventory.soap <= 0) {
        showToast(`Out of gentle soap! Pick some up in the Market 🫧`);
        return;
      }
      // Generate bubbles on pet
      const newBubbles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
      }));
      setSoapBubbles((prev) => [...prev.slice(-14), ...newBubbles]);
      setRoomMood('bathing');
      onUpdateStats({
        cleanliness: Math.min(100, stats.cleanliness + 22),
        happiness: Math.min(100, stats.happiness + 5),
        isSoapy: true,
      });
      showToast(`Lathered ${companionName} with warm foamy bubbles! 🫧`);
    } else if (item.type === 'shower') {
      setIsShowerRunning(true);
      setSoapBubbles([]);
      setRoomMood('happy');
      onUpdateStats({
        cleanliness: 100,
        happiness: Math.min(100, stats.happiness + 8),
        isSoapy: false,
      });
      showToast(`Warm water rinsed ${companionName} sparkling fresh and clean! ✨`);
      setTimeout(() => {
        setIsShowerRunning(false);
        setRoomMood('idle');
      }, 2500);
    } else if (item.type === 'medicine') {
      if (inventory.medicine <= 0) {
        showToast(`No animal vitamins left in medicine kit! 💊`);
        return;
      }
      onUseInventory('medicine');
      setRoomMood('happy');
      onUpdateStats({
        health: 100,
        energy: Math.min(100, stats.energy + 20),
        isSick: false,
      });
      showToast(`Administered gentle wellness vitamins to ${companionName}! ❤️🩹`);
      setTimeout(() => setRoomMood('idle'), 2000);
    } else if (item.type === 'thermometer') {
      setRoomMood('happy');
      showToast(`Checked temperature: 38.5°C Normal! ${companionName} is comfortable 🌡️✨`);
      setTimeout(() => setRoomMood('idle'), 1800);
    } else if (item.type === 'toy') {
      triggerBallPlay();
    }
  };

  // Kitchen Bowl Click Handlers (Activates 3D Ceramic Bowl & 3D Eating Animation!)
  const handleEatFromBowl = () => {
    setRoomMood('eating');
    onUpdateStats({
      hunger: Math.min(100, stats.hunger + 18),
      happiness: Math.min(100, stats.happiness + 6),
    });
    confetti({ particleCount: 20, spread: 50, origin: { y: 0.65 } });
    showToast(`*crunch crunch* ${companionName} is enjoying their 3D fresh food bowl! 🥣😋`);
    setTimeout(() => {
      setRoomMood('happy');
      setTimeout(() => setRoomMood('idle'), 1400);
    }, 2200);
  };

  const handleDrinkWater = () => {
    setRoomMood('happy');
    onUpdateStats({
      hunger: Math.min(100, stats.hunger + 8),
      cleanliness: Math.min(100, stats.cleanliness + 5),
      happiness: Math.min(100, stats.happiness + 5),
    });
    showToast(`*slurp slurp* ${companionName} drank cool refreshing water! 💧✨`);
    setTimeout(() => setRoomMood('idle'), 1200);
  };

  // Outside Toy Play
  const triggerBallPlay = () => {
    setIsBallThrown(true);
    setRoomMood('playing');
    onUpdateStats({
      happiness: Math.min(100, stats.happiness + 15),
      energy: Math.max(10, stats.energy - 8),
    });
    showToast(`*squeak!* ${companionName} caught the bouncing tennis ball! 🎾`);
    setTimeout(() => {
      setIsBallThrown(false);
      setRoomMood('idle');
    }, 2200);
  };

  // Bedroom Sleep
  const handleToggleBed = () => {
    if (stats.isSleeping) {
      onUpdateStats({ isSleeping: false });
      setRoomMood('idle');
      showToast(`${companionName} woke up well-rested and happy! ☀️`);
    } else {
      onUpdateStats({ isSleeping: true, energy: Math.min(100, stats.energy + 40) });
      setRoomMood('sleeping');
      showToast(`Lights dimmed. ${companionName} is tucked into bed... 🌙💤`);
    }
  };

  const toggleSpecies = () => {
    if (onChangeSpecies) {
      onChangeSpecies(species === 'dog' ? 'cat' : 'dog');
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 select-none pb-8">
      {/* POU STATUS METRICS BAR */}
      <div className="w-full rounded-2xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              {companionName} ({species === 'dog' ? '🐶 Dog' : '🐱 Cat'})
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Wellness Level: Active
            </span>
          </div>

          {onChangeSpecies && (
            <button
              onClick={toggleSpecies}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60 cursor-pointer transition-colors"
            >
              <Repeat className="w-3 h-3" />
              <span>Switch to {species === 'dog' ? 'Cat 🐱' : 'Dog 🐶'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 dark:text-emerald-100 mb-1">
              <span>Hunger</span>
              <span>{stats.hunger}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.hunger > 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${stats.hunger}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 dark:text-emerald-100 mb-1">
              <span>Clean</span>
              <span>{stats.cleanliness}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500"
                style={{ width: `${stats.cleanliness}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 dark:text-emerald-100 mb-1">
              <span>Energy</span>
              <span>{stats.energy}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${stats.energy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 dark:text-emerald-100 mb-1">
              <span>Happy</span>
              <span>{stats.happiness}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.happiness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          REALISTIC CARTOON POU ROOM STAGE (GROUNDED - NOT FLYING!)
          ========================================================= */}
      <div className="w-full h-84 sm:h-96 rounded-3xl relative overflow-hidden border border-emerald-200/80 dark:border-emerald-800 shadow-md select-none">
        {/* =========================================================
            ROOM 1: KITCHEN WITH REALISTIC REFRIGERATOR, COUNTER & FLOOR
            ========================================================= */}
        {activeRoom === 'kitchen' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#fef5e7] via-[#faebd7] to-[#e8d5bc] dark:from-[#251f18] dark:to-[#17130f] flex flex-col justify-between overflow-hidden">
            {/* Kitchen Wallpaper Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

            {/* Top Cabinets & Wall Clock */}
            <div className="flex justify-between items-start p-4 z-10">
              <div className="flex gap-2">
                <div className="w-24 h-12 rounded-b-xl bg-amber-900/90 border-b-2 border-amber-950 shadow-sm flex items-end justify-center pb-1">
                  <div className="w-5 h-1 bg-amber-300/80 rounded-full" />
                </div>
                <div className="w-24 h-12 rounded-b-xl bg-amber-900/90 border-b-2 border-amber-950 shadow-sm flex items-end justify-center pb-1">
                  <div className="w-5 h-1 bg-amber-300/80 rounded-full" />
                </div>
              </div>

              {/* Kitchen Clock */}
              <div className="w-10 h-10 rounded-full bg-white dark:bg-amber-950 border-2 border-amber-700 shadow-xs flex items-center justify-center font-mono text-[10px] font-bold text-amber-900 dark:text-amber-200">
                12:00
              </div>
            </div>

            {/* Realistic Refrigerator on the Left with Open/Close Toggle */}
            <div
              onClick={() => setIsFridgeOpen(!isFridgeOpen)}
              className="absolute left-3 bottom-14 w-28 sm:w-32 h-56 sm:h-64 rounded-t-2xl bg-gradient-to-r from-[#e2e8f0] via-[#f8fafc] to-[#cbd5e1] border-2 border-slate-300 shadow-xl z-10 flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
              title="Click to open/close fridge"
            >
              {/* Freezer Door */}
              <div className="h-20 border-b-2 border-slate-300 relative p-2 flex flex-col justify-between">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  HANGIN FREEZE
                </div>
                {/* Ice Cubes inside or magnet on outside */}
                <div className="text-[11px] opacity-70">🧊 🍨</div>
                <div className="absolute right-2.5 top-5 w-2 h-10 rounded-full bg-slate-400 shadow-inner" />
              </div>

              {/* Fridge Main Door / Open Pantry View */}
              <div className="flex-1 relative p-2 flex flex-col justify-between bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
                {isFridgeOpen ? (
                  <div className="flex flex-col gap-1 text-[11px] bg-white/80 p-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-[9px] text-slate-600">PANTRY SHELF</span>
                    <div className="flex justify-around">
                      <span>🍎</span>
                      <span>🍌</span>
                      <span>🥛</span>
                    </div>
                    <div className="flex justify-around">
                      <span>🍪</span>
                      <span>🍚</span>
                      <span>🍵</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Cute Fridge Magnets */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="w-5 h-5 rounded-md bg-rose-400 shadow-xs flex items-center justify-center text-[10px]">
                        ❤️
                      </div>
                      <div className="w-10 h-3 rounded-xs bg-amber-200 border border-amber-300 text-[7px] font-bold text-amber-900 px-1">
                        GROCERY
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold text-center pb-1">
                      Tap to open
                    </div>
                  </>
                )}
                {/* Main Handle */}
                <div className="absolute right-2.5 top-6 w-2 h-16 rounded-full bg-slate-400 shadow-inner" />
              </div>
            </div>

            {/* Kitchen Floor: Warm Checkerboard tiles */}
            <div className="absolute bottom-0 inset-x-0 h-22 bg-gradient-to-b from-[#d4a373] to-[#bc6c25] border-t-4 border-[#935116] shadow-inner opacity-95">
              <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px] [background-position:0_0,12px_12px]" />
            </div>

            {/* Woven Kitchen Floor Rug (Grounded beneath the pet!) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-16 rounded-full bg-gradient-to-r from-[#b5763b] via-[#cf9358] to-[#b5763b] border-2 border-[#8c4f1c] shadow-inner z-10 flex items-center justify-around px-4 opacity-90">
              <div className="w-48 h-12 rounded-full border border-dashed border-[#fef3c7]/40" />
            </div>

            {/* Quick Kitchen Hydration & Food Station on Wall Shelf (Cleanly elevated to avoid floor collision - Image 2 Fix) */}
            <div className="absolute top-14 right-3.5 z-20 flex flex-col gap-2">
              <button
                onClick={handleEatFromBowl}
                className="h-8 px-3 rounded-full bg-white/95 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700/60 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                title={`Feed ${companionName} from the 3D ceramic bowl`}
              >
                <span className="text-sm">🥣</span>
                <span className="text-[10px] font-black text-amber-900 dark:text-amber-200 whitespace-nowrap">
                  {species === 'dog' ? 'Dog Bowl' : 'Cat Bowl'}
                </span>
              </button>

              <button
                onClick={handleDrinkWater}
                className="h-8 px-3 rounded-full bg-white/95 dark:bg-sky-950/90 border border-sky-300 dark:border-sky-700/60 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                title={`Give fresh water to ${companionName}`}
              >
                <span className="text-sm">💧</span>
                <span className="text-[10px] font-black text-sky-900 dark:text-sky-200 whitespace-nowrap">
                  Fresh Water
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            ROOM 2: BATHROOM WITH REALISTIC TILE WALL, SHOWER & TUB
            ========================================================= */}
        {activeRoom === 'bathroom' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] dark:from-[#0c2233] dark:to-[#081824] flex flex-col justify-between overflow-hidden">
            {/* Ceramic Tile Grid */}
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] [background-size:28px_28px]" />

            {/* Overhead Realistic Shower Head on Right */}
            <div className="absolute top-2 right-8 z-10 flex flex-col items-center pointer-events-none">
              <div className="w-3 h-8 bg-slate-400 rounded-b-md shadow-xs" />
              <div className="w-16 h-6 rounded-b-2xl bg-gradient-to-r from-slate-300 via-white to-slate-400 border border-slate-400 shadow-md flex items-center justify-around px-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-slate-600" />
                ))}
              </div>
              {/* Flowing Water Jet Streams when showering */}
              {isShowerRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 0.85, height: 180 }}
                  className="w-14 bg-gradient-to-b from-sky-400/80 to-transparent flex justify-around overflow-hidden"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, 90] }}
                      transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.06 }}
                      className="w-0.5 h-6 bg-white rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Bathroom Mirror / Medicine Cabinet on Left */}
            <div className="absolute top-4 left-4 w-24 h-28 rounded-2xl bg-sky-50/90 dark:bg-sky-950/80 border-2 border-sky-300 shadow-md p-2 flex flex-col items-center justify-between z-10">
              <span className="text-[10px] font-bold text-sky-800 dark:text-sky-200">
                Bath Sanctuary
              </span>
              <div className="w-full border-t border-sky-200 pt-1 flex justify-center gap-1.5">
                <span className="text-xs">🫧</span>
                <span className="text-xs">🧼</span>
                <span className="text-xs">🧽</span>
              </div>
            </div>

            {/* Bathroom Tile Floor at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-[#0284c7] to-[#0369a1] border-t-2 border-sky-300/60" />

            {/* Plush Fluffy Bath Rug in front of Tub */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full bg-sky-200/80 border border-sky-300 shadow-sm z-10 flex items-center justify-center">
              <span className="text-[10px] text-sky-700 font-bold">🐾 Warm Bath Mat 🐾</span>
            </div>

            {/* REALISTIC PORCELAIN BATHTUB:
                The back wall of the tub sits at z-10 behind the companion.
                The front rim & bubbly water sits at z-25 in front of pet's paws,
                so the animal is genuinely sitting INSIDE the tub! */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 sm:w-76 h-28 rounded-t-[42px] bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#cbd5e1] border-t-4 border-l-2 border-r-2 border-slate-300 shadow-xl z-10 pointer-events-none" />

            {/* Front Tub Wall with Water Line (Rendered in front of the pet at z-25) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 sm:w-76 h-14 rounded-t-3xl bg-gradient-to-t from-[#f8fafc] to-[#e2e8f0] border-t-4 border-sky-200 shadow-md z-25 pointer-events-none flex flex-col justify-start overflow-hidden">
              {/* Warm Bubbly Water Surface Line */}
              <div className="w-full h-3 bg-gradient-to-r from-sky-300 via-sky-200 to-sky-300 flex items-center justify-around px-4">
                <span className="text-[9px]">🫧</span>
                <span className="text-[8px]">🫧</span>
                <span className="text-[9px]">🫧</span>
                <span className="text-[8px]">🫧</span>
              </div>
              {/* Soap Bar resting on Tub Rim */}
              <div className="absolute right-4 top-1 w-6 h-3 rounded-md bg-amber-200 border border-amber-300 shadow-xs" />
            </div>
          </div>
        )}

        {/* =========================================================
            ROOM 3: BEDROOM WITH REALISTIC COZY BED, LAMP & MOON WINDOW
            ========================================================= */}
        {activeRoom === 'bedroom' && (
          <div
            className={`absolute inset-0 transition-colors duration-700 flex flex-col justify-between overflow-hidden ${
              stats.isSleeping
                ? 'bg-gradient-to-b from-[#050b1a] via-[#0d1633] to-[#131f47]'
                : 'bg-gradient-to-b from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe] dark:from-[#1b122c] dark:to-[#120a1f]'
            }`}
          >
            {/* Arched Window with Moon & Stars */}
            <div className="absolute top-4 left-6 w-20 h-28 rounded-t-full border-2 border-indigo-300/70 bg-[#090f26] overflow-hidden shadow-inner z-10">
              <div className="absolute top-3 right-3 text-sm">🌙</div>
              <div className="absolute top-8 left-4 text-[8px] text-amber-200 animate-ping">
                ✦
              </div>
              <div className="absolute top-14 right-5 text-[9px] text-amber-100 animate-pulse">
                ✦
              </div>
              <div className="absolute inset-x-0 top-14 h-0.5 bg-indigo-300/40" />
              <div className="absolute inset-y-0 left-10 w-0.5 bg-indigo-300/40" />
            </div>

            {/* Nightstand with Vintage Bedside Lamp */}
            <div className="absolute top-5 right-6 z-10 flex flex-col items-center">
              <button
                onClick={handleToggleBed}
                className="flex flex-col items-center cursor-pointer group"
                title="Click to toggle sleep & lamp"
              >
                {/* Lampshade */}
                <div
                  className={`w-14 h-10 rounded-t-sm transition-all ${
                    stats.isSleeping
                      ? 'bg-amber-950/70 border border-amber-950 text-slate-400'
                      : 'bg-amber-300 border-2 border-amber-400 shadow-[0_0_26px_#fde047]'
                  }`}
                  style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                />
                <div className="w-1.5 h-6 bg-amber-800" />
                <div className="w-8 h-2 rounded-full bg-amber-900" />
                <span className="text-[10px] font-bold text-amber-950 dark:text-amber-200 mt-1 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded-full shadow-xs">
                  {stats.isSleeping ? 'Turn Lamp On ☀️' : 'Sleep Lamp 🌙'}
                </span>
              </button>
            </div>

            {/* Hardwood Bedroom Floor at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-18 bg-gradient-to-b from-[#5c3a21] to-[#3a2212] border-t-2 border-[#7c4d28]" />

            {/* Cozy Bedside Rug */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-60 h-14 rounded-full bg-indigo-200/50 border border-indigo-300 shadow-inner z-10" />

            {/* REALISTIC WOODEN BED (Backboard & Mattress at z-10) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 sm:w-72 h-32 rounded-t-3xl bg-gradient-to-t from-[#312e81] to-[#4338ca] border-t-4 border-indigo-300 shadow-xl z-10 flex flex-col items-center justify-start pt-2 pointer-events-none">
              {/* Fluffy Pillow */}
              <div className="w-40 h-8 rounded-full bg-white/95 border border-indigo-200 shadow-sm" />
            </div>

            {/* When Pet is Sleeping: Warm Quilt Blanket Over Body (z-25) */}
            {stats.isSleeping && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 sm:w-72 h-18 rounded-t-3xl bg-gradient-to-t from-[#1e1b4b] to-[#3730a3] border-t-4 border-indigo-200 shadow-2xl z-25 pointer-events-none flex flex-col items-center pt-1">
                {/* Blanket Pattern Trim */}
                <div className="w-full h-3 bg-indigo-300/30 border-b border-indigo-200/40" />
                <span className="text-[10px] text-indigo-200 font-bold mt-2">
                  Tucked in &bull; Sleeping soundly 💤
                </span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            ROOM 4: OUTSIDE MEADOW / STORMY RAIN ("THE OUTSIDE ITS STORMY SO SAD")
            ========================================================= */}
        {activeRoom === 'outside' && (
          <div
            className={`absolute inset-0 transition-colors duration-700 flex flex-col justify-between overflow-hidden ${
              isOutsideStormy
                ? 'bg-gradient-to-b from-[#1e293b] via-[#334155] to-[#142e20]'
                : 'bg-gradient-to-b from-[#bae6fd] via-[#7dd3fc] to-[#86efac] dark:from-[#0d2818] dark:to-[#1a4a28]'
            }`}
          >
            {/* Top Weather Toggle: Stormy vs Sunny */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
              <button
                onClick={() => setIsOutsideStormy(!isOutsideStormy)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-md cursor-pointer transition-colors flex items-center gap-1"
                title="Toggle Stormy Rain / Sunny Meadow"
              >
                <span>{isOutsideStormy ? '⛈️ Stormy (So sad)' : '☀️ Sunny Meadow'}</span>
                <span className="text-[9px] text-emerald-300 underline">toggle</span>
              </button>
            </div>

            {/* Stormy Raindrop Simulation */}
            {isOutsideStormy && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-30, 360], x: [0, -25] }}
                    transition={{
                      duration: 0.55 + (i % 5) * 0.1,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: (i % 8) * 0.08,
                    }}
                    className="absolute w-0.5 h-6 bg-gradient-to-b from-transparent to-sky-200/80 rounded-full"
                    style={{ left: `${(i * 4.2) % 100}%`, top: '-20px' }}
                  />
                ))}
                {/* Wet Puddle Ripples on Grass */}
                <div className="absolute bottom-10 left-12 w-20 h-4 rounded-full bg-slate-900/30 border border-sky-300/30 animate-pulse" />
                <div className="absolute bottom-6 right-16 w-24 h-5 rounded-full bg-slate-900/30 border border-sky-300/30 animate-pulse" />
              </div>
            )}

            {/* Drifting Clouds (Dark storm clouds or white fluffy clouds) */}
            <motion.div
              animate={{ x: [-50, 420] }}
              transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 left-0 flex items-center opacity-90 pointer-events-none"
            >
              <div
                className={`w-18 h-9 rounded-full shadow-xs ${
                  isOutsideStormy ? 'bg-slate-700' : 'bg-white'
                }`}
              />
              <div
                className={`w-12 h-12 rounded-full -ml-5 -mt-3 shadow-xs ${
                  isOutsideStormy ? 'bg-slate-800' : 'bg-white'
                }`}
              />
              <div
                className={`w-14 h-8 rounded-full -ml-4 shadow-xs ${
                  isOutsideStormy ? 'bg-slate-700' : 'bg-white'
                }`}
              />
            </motion.div>

            {/* Tree Branch on the Top Left with Swaying Leaves */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 w-44 pointer-events-none origin-top-left z-10"
            >
              <svg viewBox="0 0 160 120" className="w-full h-auto">
                <path d="M 0 0 Q 60 20 120 40" stroke="#78350f" strokeWidth="6" fill="none" />
                <circle cx="90" cy="35" r="22" fill={isOutsideStormy ? '#1e3a24' : '#22c55e'} opacity="0.9" />
                <circle cx="120" cy="45" r="18" fill={isOutsideStormy ? '#162e1c' : '#16a34a'} opacity="0.9" />
                <circle cx="70" cy="40" r="16" fill={isOutsideStormy ? '#102416' : '#15803d'} opacity="0.9" />
              </svg>
            </motion.div>

            {/* Distant Hills Layer */}
            <div className="absolute bottom-16 inset-x-0 h-36 pointer-events-none">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 80 Q 140 20 280 65 T 500 45 L 500 150 L 0 150 Z"
                  fill={isOutsideStormy ? '#1b4332' : '#4ade80'}
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Garden White Picket Fence in Midground */}
            <div className="absolute bottom-16 inset-x-6 flex justify-around pointer-events-none opacity-60 z-5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-10 bg-white border border-slate-300 rounded-t-sm"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)' }}
                />
              ))}
            </div>

            {/* Foreground Lush Hill Mound with Wildflowers */}
            <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10">
              <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 45 Q 240 5 500 35 L 500 120 L 0 120 Z"
                  fill={isOutsideStormy ? '#143422' : '#22c55e'}
                />
              </svg>
            </div>

            {/* Wildflowers on the Meadow Hill */}
            <div className="absolute bottom-4 inset-x-8 flex justify-between pointer-events-none z-15 text-sm sm:text-base">
              <span>🌼</span>
              <span>🌸</span>
              <span>🌻</span>
              <span>🌷</span>
              <span>🌼</span>
            </div>

            {/* Thrown Play Ball Animation */}
            {isBallThrown && (
              <motion.div
                initial={{ x: 40, y: 180, scale: 0.8 }}
                animate={{
                  x: [40, 160, 260],
                  y: [180, 50, 170],
                  rotate: [0, 360, 720],
                }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute z-30 text-3xl pointer-events-none"
              >
                🎾
              </motion.div>
            )}
          </div>
        )}

        {/* =========================================================
            ROOM 5: CLINIC & WELLNESS CHECK-UP (HEALTH & RECOVERY)
            ========================================================= */}
        {activeRoom === 'clinic' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] dark:from-[#062c20] dark:to-[#041a13] flex flex-col justify-between overflow-hidden">
            {/* Top Clinic Cross Banner */}
            <div className="p-3.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-emerald-950/80 px-3 py-1.5 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-xs">
                <div className="w-6 h-6 rounded-md bg-rose-500 text-white font-black flex items-center justify-center text-xs">
                  ✚
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black text-emerald-950 dark:text-emerald-100">
                    SANCTUARY CLINIC
                  </div>
                  <div className="text-[8px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    Health: {stats.health}%
                  </div>
                </div>
              </div>

              <div className="text-xl">🩺 📋</div>
            </div>

            {/* Clinic Floor */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-b from-[#059669] to-[#047857] border-t-4 border-emerald-600 shadow-inner" />

            {/* Clean Medical Examination Mat under pet */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full bg-white/90 dark:bg-emerald-900/80 border-2 border-emerald-400 shadow-md z-10 flex items-center justify-center">
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-200">
                ✦ Examination Table ✦
              </span>
            </div>
          </div>
        )}

        {/* =========================================================
            POU-STYLE COMPANION GROUNDED IN CENTER (NOT FLOATING!)
            ========================================================= */}
        <div
          ref={petAreaRef}
          className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-transform ${
            isHoveringPet ? 'scale-105' : ''
          }`}
        >
          {/* Soapy Suds on Pet */}
          {soapBubbles.map((b) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              className="absolute z-30 pointer-events-none text-xl"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              🫧
            </motion.div>
          ))}

          {/* Real-time Pet Reaction & Emotional Feeling Bubble (User Request: Drag Feedback & Emotions) */}
          <AnimatePresence>
            {activeDragItem && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                className="absolute -top-16 z-40 bg-white/95 dark:bg-[#122218]/95 px-3.5 py-1.5 rounded-2xl border-2 border-emerald-400 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none whitespace-nowrap"
              >
                <span className="text-xl animate-bounce">
                  {isHoveringPet ? '😋' : '👃'}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black text-emerald-950 dark:text-emerald-50">
                    {isHoveringPet
                      ? `Subuan mo na ako ng ${activeDragItem.name}! 👅✨`
                      : `*Sniff sniff...* Amoy ${activeDragItem.name}! 🤤`}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {isHoveringPet ? 'Bitawan dito para kainin! 🐾' : 'I-drag palapit sa akin 🐾'}
                  </span>
                </div>
                {/* Speech bubble arrow pointer */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#122218] border-b-2 border-r-2 border-emerald-400 rotate-45" />
              </motion.div>
            )}

            {roomMood === 'eating' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8 }}
                className="absolute -top-14 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-2 border-amber-300 pointer-events-none whitespace-nowrap"
              >
                <span className="text-sm">🥣✨</span>
                <span>*Crunch crunch nom nom!* Ang sarap! 😋❤️</span>
              </motion.div>
            )}

            {roomMood === 'bathing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8 }}
                className="absolute -top-14 z-40 bg-gradient-to-r from-sky-500 to-teal-500 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-2 border-sky-300 pointer-events-none whitespace-nowrap"
              >
                <span className="text-sm animate-pulse">🫧✨</span>
                <span>Mabangong ligo! Tanggal pagod! 🧼💚</span>
              </motion.div>
            )}
          </AnimatePresence>

          <CuteCompanion
            species={species}
            mood={roomMood}
            equipped={equipped}
            size="lg"
            interactive={true}
            showBowl={activeRoom === 'kitchen' || roomMood === 'eating'}
            isEating={roomMood === 'eating'}
            isSniffing={activeDragItem !== null && (activeDragItem.type === 'food' || isHoveringPet)}
            onPet={() => {
              if (stats.isSleeping) {
                showToast(`${companionName} is sleeping soundly... 💤`);
                return;
              }
              setRoomMood('happy');
              onUpdateStats({ happiness: Math.min(100, stats.happiness + 5) });
              showToast(`${companionName} purrs happily! 💚`);
              setTimeout(() => setRoomMood('idle'), 1800);
            }}
          />

          {/* Companion Name Tag (Clean & Proportionate) */}
          <div className="flex items-center gap-2 mt-2 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800 shadow-sm z-30">
            <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              {companionName}
            </span>
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Chat</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Drop Instruction Hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-semibold backdrop-blur-md pointer-events-none border border-white/20 shadow-sm text-center whitespace-nowrap">
          Drag any item from below with your finger onto {companionName}!
        </div>

        {/* Interaction Toast Alert */}
        <AnimatePresence>
          {interactionToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-950/95 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-emerald-700/50 pointer-events-none text-center whitespace-nowrap"
            >
              {interactionToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================
          POU ROOM SWITCHER DOCK (Kitchen / Bath / Bed / Outside / Clinic)
          ========================================================= */}
      <div className="w-full grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveRoom('kitchen')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
            activeRoom === 'kitchen'
              ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
              : 'bg-white dark:bg-[#14241a] text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-amber-500" />
          <span className="text-[10px] sm:text-xs font-bold">Kitchen</span>
        </button>

        <button
          onClick={() => setActiveRoom('bathroom')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
            activeRoom === 'bathroom'
              ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
              : 'bg-white dark:bg-[#14241a] text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Bath className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-sky-500" />
          <span className="text-[10px] sm:text-xs font-bold">Bathroom</span>
        </button>

        <button
          onClick={() => setActiveRoom('bedroom')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
            activeRoom === 'bedroom'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
              : 'bg-white dark:bg-[#14241a] text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-indigo-400" />
          <span className="text-[10px] sm:text-xs font-bold">Bedroom</span>
        </button>

        <button
          onClick={() => setActiveRoom('outside')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
            activeRoom === 'outside'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
              : 'bg-white dark:bg-[#14241a] text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Trees className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-emerald-500" />
          <span className="text-[10px] sm:text-xs font-bold">Outside</span>
        </button>

        <button
          onClick={() => setActiveRoom('clinic')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
            activeRoom === 'clinic'
              ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
              : 'bg-white dark:bg-[#14241a] text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Pill className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-rose-500" />
          <span className="text-[10px] sm:text-xs font-bold">Clinic</span>
        </button>
      </div>

      {/* =========================================================
          DRAGGABLE INTERACTIVE ITEM TRAY (Feed, Bathe, Meds, Play)
          ========================================================= */}
      <div className="w-full p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#122218] border border-emerald-100 dark:border-emerald-800/60 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <span>🐾 KITCHEN PANTRY &bull; Drag to Feed or Tap to Serve</span>
          </span>
          <button
            onClick={onOpenMarket}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Market</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Room Specific Draggables */}
        {activeRoom === 'kitchen' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(species === 'dog'
                ? [
                    { id: 'kibble', name: 'Beef Kibble', icon: '🥩', type: 'food' as const, inventoryKey: 'kibble' as keyof Inventory },
                    { id: 'bone', name: 'Puppy Bone', icon: '🦴', type: 'food' as const, inventoryKey: 'bone' as keyof Inventory },
                    { id: 'treat', name: 'Bickie Treat', icon: '🍪', type: 'food' as const, inventoryKey: 'treat' as keyof Inventory },
                    { id: 'apple', name: 'Apple Slice', icon: '🍎', type: 'food' as const, inventoryKey: 'apple' as keyof Inventory },
                  ]
                : [
                    { id: 'salmon', name: 'Steamed Salmon', icon: '🐟', type: 'food' as const, inventoryKey: 'salmon' as keyof Inventory },
                    { id: 'catKibble', name: 'Tuna Kibble', icon: '🍣', type: 'food' as const, inventoryKey: 'catKibble' as keyof Inventory },
                    { id: 'catnip', name: 'Catnip Herb', icon: '🌿', type: 'food' as const, inventoryKey: 'catnip' as keyof Inventory },
                    { id: 'catMilk', name: 'Cat Milk', icon: '🥛', type: 'food' as const, inventoryKey: 'catMilk' as keyof Inventory },
                  ]
              ).map((item) => {
                const count = inventory[item.inventoryKey] || 0;
                const isOutOfStock = count <= 0;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                      isOutOfStock
                        ? 'bg-amber-50/40 dark:bg-[#1a211b] border-amber-200/40 opacity-70'
                        : 'bg-amber-50/80 dark:bg-[#1e271f] border-amber-200 dark:border-amber-900/50 shadow-2xs hover:border-amber-400 hover:shadow-xs'
                    }`}
                  >
                    <motion.div
                      drag={!isOutOfStock}
                      dragSnapToOrigin
                      whileDrag={{ scale: 1.25, zIndex: 50 }}
                      onDragStart={() => setActiveDragItem(item)}
                      onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
                      onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                      className={`flex flex-col items-center touch-none w-full ${
                        isOutOfStock ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      <span className="text-3xl mb-1 filter drop-shadow-xs transition-transform group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center leading-tight">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800">
                          x{count}
                        </span>
                        {!isOutOfStock && (
                          <span className="text-[9px] text-amber-700/80 dark:text-amber-300/80 font-medium">
                            Drag 👆
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* Direct Feed / Restock Button */}
                    {isOutOfStock ? (
                      <button
                        onClick={onOpenMarket}
                        className="mt-2 w-full py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] cursor-pointer transition-colors shadow-2xs"
                      >
                        + Restock 🛍️
                      </button>
                    ) : (
                      <button
                        onClick={() => applyItemAction(item)}
                        className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-[10px] shadow-xs cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>Pakainin</span>
                        <span>{item.icon}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vet-Approved Nutrition Safety Card */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300">
              <span className="text-lg">🛡️</span>
              <div className="flex flex-col text-left">
                <span className="font-bold">
                  {species === 'dog' ? 'Vet-Approved Canine Nutrition' : 'Vet-Approved Feline Nutrition'}
                </span>
                <span className="text-[10px] opacity-85">
                  {species === 'dog'
                    ? '100% canine-safe protein, biscuits, and apples. Chocolate, grapes, and onions are strictly excluded.'
                    : '100% feline-safe steamed fish, kibble, and catnip. Coconut, chocolate, and cow milk are strictly excluded.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeRoom === 'bathroom' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'soap', name: 'Bath Soap', icon: '🧼', type: 'soap' as const, inventoryKey: 'soap' as keyof Inventory },
              { id: 'shower', name: 'Rinse Shower', icon: '🚿', type: 'shower' as const },
              { id: 'brush', name: 'Soft Sponge', icon: '🧽', type: 'soap' as const, inventoryKey: 'soap' as keyof Inventory },
            ].map((item) => (
              <motion.div
                key={item.id}
                drag
                dragSnapToOrigin
                whileDrag={{ scale: 1.25, zIndex: 50 }}
                onDragStart={() => setActiveDragItem(item)}
                onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
                onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50/80 dark:bg-[#15252b] border border-sky-200 dark:border-sky-900/50 cursor-grab active:cursor-grabbing shadow-2xs hover:bg-sky-100 transition-colors touch-none"
              >
                <span className="text-3xl mb-1">{item.icon}</span>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {item.name}
                </span>
                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold">
                  {item.inventoryKey ? `x${inventory[item.inventoryKey] || 0}` : 'Unlimited'}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {activeRoom === 'bedroom' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tea',
                  name: 'Bedtime Chamomile',
                  icon: '🍵',
                  type: 'food',
                  inventoryKey: 'herbalTea',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tea',
                  name: 'Bedtime Chamomile',
                  icon: '🍵',
                  type: 'food',
                  inventoryKey: 'herbalTea',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">🍵</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Chamomile Tea
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                x{inventory.herbalTea || 0}
              </span>
            </motion.div>

            <button
              onClick={handleToggleBed}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 cursor-pointer shadow-2xs hover:bg-indigo-100"
            >
              <span className="text-3xl mb-1">{stats.isSleeping ? '☀️' : '🌙'}</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                {stats.isSleeping ? 'Turn Lamp On (Wake)' : 'Bedside Lamp (Sleep)'}
              </span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                {stats.isSleeping ? 'Sleeping peacefully' : 'Dim lights to rest'}
              </span>
            </button>
          </div>
        )}

        {activeRoom === 'outside' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'ball',
                  name: 'Tennis Ball',
                  icon: '🎾',
                  type: 'toy',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'ball',
                  name: 'Tennis Ball',
                  icon: '🎾',
                  type: 'toy',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">🎾</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Drag to Throw Ball
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                Play in rain or sun!
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tea',
                  name: 'Herbal Tea',
                  icon: '🍵',
                  type: 'food',
                  inventoryKey: 'herbalTea',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tea',
                  name: 'Herbal Tea',
                  icon: '🍵',
                  type: 'food',
                  inventoryKey: 'herbalTea',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">🍵</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Warm Tea
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                x{inventory.herbalTea || 0}
              </span>
            </motion.div>
          </div>
        )}

        {activeRoom === 'clinic' && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'thermometer',
                  name: 'Clinical Thermometer',
                  icon: '🌡️',
                  type: 'thermometer',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'thermometer',
                  name: 'Clinical Thermometer',
                  icon: '🌡️',
                  type: 'thermometer',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">🌡️</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Thermometer
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                Check Health
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'meds',
                  name: 'Vitamins',
                  icon: '💊',
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'meds',
                  name: 'Vitamins',
                  icon: '💊',
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">💊</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Vitamins
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                x{inventory.medicine || 0}
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tonic',
                  name: 'Herbal Tonic',
                  icon: '🧪',
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tonic',
                  name: 'Herbal Tonic',
                  icon: '🧪',
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <span className="text-3xl mb-1">🧪</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Healing Tonic
              </span>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-semibold">
                Cures Sickness
              </span>
            </motion.div>
          </div>
        )}
      </div>

      {/* =========================================================
          2 RECTANGLE BOXES: TALK WITH COMPANION & SANCTUARY MARKETPLACE
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {/* Box 1: Talk with [animal name] */}
        <button
          onClick={onOpenChat}
          className="w-full p-4 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-md hover:shadow-lg border border-emerald-600/50 flex items-center justify-between text-left transition-all cursor-pointer group hover:scale-[1.01] active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
              💬
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                Intelligent Companion AI
              </span>
              <h4 className="text-sm font-black text-white">
                Talk with {companionName}
              </h4>
              <p className="text-[11px] text-emerald-100/85 line-clamp-1">
                Ask how {companionName} is feeling or share your thoughts
              </p>
            </div>
          </div>
          <span className="text-emerald-300 font-black text-base group-hover:translate-x-1 transition-transform pl-2">
            &rarr;
          </span>
        </button>

        {/* Box 2: Sanctuary Marketplace */}
        <button
          onClick={onOpenMarket}
          className="w-full p-4 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white shadow-md hover:shadow-lg border border-amber-400/50 flex items-center justify-between text-left transition-all cursor-pointer group hover:scale-[1.01] active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
              🛍️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                Wardrobe, Food &amp; Points
              </span>
              <h4 className="text-sm font-black text-white">
                Sanctuary Marketplace
              </h4>
              <p className="text-[11px] text-amber-100/85 line-clamp-1">
                {points} WP &bull; Hats, treats, care supplies &amp; top-up
              </p>
            </div>
          </div>
          <span className="text-amber-200 font-black text-base group-hover:translate-x-1 transition-transform pl-2">
            &rarr;
          </span>
        </button>
      </div>

      {/* =========================================================
          6 WORKING MINDFUL MINI-GAMES BELOW CARE FEATURES
          ========================================================= */}
      <WellnessMiniGames
        species={species}
        companionName={companionName}
        onAddPoints={onAddPoints}
        onBoostHappiness={(amt) =>
          onUpdateStats({ happiness: Math.min(100, stats.happiness + amt) })
        }
      />
    </div>
  );
};
