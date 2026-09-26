import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Check,
  Gift,
  Calendar,
  Award,
  Shirt,
  Utensils,
  Bath,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyHabits } from './DailyHabits';
import { Inventory, AccessoryInventory, EquippedAccessories, DailyHabit } from '../types';

interface ExpandedMarketProps {
  points: number;
  inventory: Inventory;
  accessories: AccessoryInventory;
  equipped: EquippedAccessories;
  habits: DailyHabit[];
  companionName: string;
  onBack: () => void;
  onBuyItem: (itemKey: keyof Inventory, cost: number) => boolean;
  onBuyAccessory: (accKey: keyof AccessoryInventory, cost: number) => boolean;
  onEquipAccessory: (slot: 'hat' | 'glasses' | 'scarf', value: any) => void;
  onToggleHabit: (habitId: string) => void;
  onAddPoints: (amount: number) => void;
}

export const ExpandedMarket: React.FC<ExpandedMarketProps> = ({
  points,
  inventory,
  accessories,
  equipped,
  habits,
  companionName,
  onBack,
  onBuyItem,
  onBuyAccessory,
  onEquipAccessory,
  onToggleHabit,
  onAddPoints,
}) => {
  const [activeCategory, setActiveCategory] = useState<'topup' | 'food' | 'care' | 'wearables' | 'awards'>('topup');
  const [claimedDay, setClaimedDay] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [purchasingBundle, setPurchasingBundle] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const iapBundles = [
    {
      id: 'sprout',
      name: 'Sprout Pouch',
      wp: 50,
      bonus: 0,
      pricePhp: '₱49',
      priceUsd: '$0.99',
      icon: '🪙',
      badge: 'Starter',
      desc: 'Quick refill for treats and pantry care items',
    },
    {
      id: 'meadow',
      name: 'Sanctuary Meadow',
      wp: 150,
      bonus: 20,
      pricePhp: '₱99',
      priceUsd: '$1.99',
      icon: '🌿',
      badge: 'Most Popular ⭐',
      desc: '+20 Bonus WP! Great for cozy beanies & sunglasses',
    },
    {
      id: 'canopy',
      name: 'Ancient Canopy Vault',
      wp: 400,
      bonus: 80,
      pricePhp: '₱199',
      priceUsd: '$3.99',
      icon: '🌸',
      badge: 'Best Value 🔥',
      desc: '+80 Bonus WP! Generous wardrobe & care stash',
    },
    {
      id: 'guardian',
      name: 'Guardian Sanctuary Chest',
      wp: 1000,
      bonus: 300,
      pricePhp: '₱399',
      priceUsd: '$7.99',
      icon: '👑',
      badge: 'Ultimate 💎',
      desc: '+300 Bonus WP! Patron blessing & endless nourishment',
    },
  ];

  const handleSimulateIAP = (bundle: typeof iapBundles[0]) => {
    const totalWp = bundle.wp + bundle.bonus;
    onAddPoints(totalWp);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast(`🎉 Payment Confirmed! +${totalWp} WP credited!`);
    setPurchasingBundle(null);
  };

  // 7-day newcomer bonus calendar
  const newcomerDays = [
    { day: 1, reward: '+10 WP', icon: '✨', item: 'points', claimed: true },
    { day: 2, reward: '2x Apples', icon: '🍎', item: 'apple', claimed: false },
    { day: 3, reward: 'Sage Beanie', icon: '🧶', item: 'hatBeanie', claimed: false },
    { day: 4, reward: '+20 WP', icon: '🪙', item: 'points', claimed: false },
    { day: 5, reward: '3x Lavender Soap', icon: '🧼', item: 'soap', claimed: false },
    { day: 6, reward: 'Cozy Scarf', icon: '🧣', item: 'cozyScarf', claimed: false },
    { day: 7, reward: "Blessing Award", icon: '🏆', item: 'award', claimed: false },
  ];

  const handleClaimNewcomerDay = (dayNum: number) => {
    if (dayNum !== claimedDay + 1 && dayNum !== 1) {
      showToast('Log in tomorrow to claim the next day reward! 🌿');
      return;
    }
    setClaimedDay(dayNum);
    confetti({ particleCount: 40, spread: 60 });
    if (dayNum === 2) onBuyItem('apple', 0);
    if (dayNum === 4) onAddPoints(20);
    if (dayNum === 5) onBuyItem('soap', 0);
    showToast(`Claimed Day ${dayNum} reward! 🎁`);
  };

  const foodCatalog = [
    // Dog Delights
    { key: 'kibble' as const, name: 'Savory Beef Kibble', icon: '🥩', cost: 6, desc: '🐶 Balanced hearty meal for dogs' },
    { key: 'bone' as const, name: 'Puppy Chew Bone', icon: '🦴', cost: 7, desc: '🐶 Relieves canine teething & stress' },
    { key: 'treat' as const, name: 'Bickie Biscuit Treat', icon: '🍪', cost: 4, desc: '🐶 Crunchy oven-baked puppy reward' },
    { key: 'apple' as const, name: 'Crisp Apple Slice', icon: '🍎', cost: 3, desc: '🐶 Vet-safe seedless crisp crunch' },
    // Cat Delights
    { key: 'salmon' as const, name: 'Steamed Salmon Fillet', icon: '🐟', cost: 8, desc: '🐱 Rich Omega-3 feline gourmet meal' },
    { key: 'catKibble' as const, name: 'Crunchy Tuna Kibble', icon: '🍣', cost: 6, desc: '🐱 High-protein daily cat food' },
    { key: 'catnip' as const, name: 'Catnip Herb Delight', icon: '🌿', cost: 5, desc: '🐱 Aromatic soothing feline herb' },
    { key: 'catMilk' as const, name: 'Lactose-Free Cat Milk', icon: '🥛', cost: 4, desc: '🐱 Gentle & digestible for cats' },
    // Hydration
    { key: 'water' as const, name: 'Fresh Spring Water', icon: '💧', cost: 2, desc: '🐾 Pure hydration for all pets' },
  ];

  const careCatalog = [
    { key: 'soap' as const, name: 'Lavender Soap Bar', icon: '🧼', cost: 5, desc: 'Fluffy suds for bath time' },
    { key: 'brush' as const, name: 'Wooden Coat Brush', icon: '🪮', cost: 7, desc: '+15 Coat shine & happiness' },
  ];

  const wearablesCatalog = [
    { key: 'hatSalakot' as const, slot: 'hat' as const, val: 'salakot', name: 'Woven Salakot Hat', icon: '👒', cost: 15, desc: 'Classic Filipino straw sun hat' },
    { key: 'hatBeanie' as const, slot: 'hat' as const, val: 'beanie', name: 'Cozy Knit Beanie', icon: '🧶', cost: 18, desc: 'Warm sage pom-pom winter beanie' },
    { key: 'sunglasses' as const, slot: 'glasses' as const, val: true, name: 'Cool Dark Shades', icon: '🕶️', cost: 14, desc: 'Classic sunglasses' },
    { key: 'cozyScarf' as const, slot: 'scarf' as const, val: true, name: 'Hand-knit Scarf', icon: '🧣', cost: 20, desc: 'Soft neck scarf' },
  ];

  const circleAwardsCatalog = [
    { id: 'tier-1', name: 'Leaf Thanks', price: '₱50', icon: '🍃', desc: 'A gentle pat on the back for a thoughtful post' },
    { id: 'tier-2', name: 'Warm Hug Award', price: '₱100', icon: '🫂', desc: 'Sends cozy warmth and highlighted border' },
    { id: 'tier-3', name: 'Guiding Star', price: '₱250', icon: '⭐', desc: 'Recognizes exceptional compassion & honesty' },
    { id: 'tier-4', name: 'Golden Lotus', price: '₱500', icon: '🪷', desc: 'Honors profound vulnerability and peer leadership' },
    { id: 'tier-5', name: "Companion's Blessing", price: '₱1,000', icon: '👑', desc: 'The highest community token of mutual healing' },
  ];

  return (
    <div className="w-full flex flex-col gap-5 max-w-2xl mx-auto">
      {/* =========================================================
          MARKET TOP BAR & BACK NAVIGATION
          ========================================================= */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#132219] border border-emerald-100 dark:border-emerald-800/60 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Sanctuary Market</span>
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Nourishment, toys, accessories, and wellness points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('topup')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span>+ Top-up</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{points} WP</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          TODAY'S HABITS AT TOP OF MARKET (§10 Spec Requirement)
          ========================================================= */}
      <DailyHabits habits={habits} onToggleHabit={onToggleHabit} companionName={companionName} />

      {/* =========================================================
          7-DAY NEWCOMER BONUS CALENDAR STRIP (§10 Spec Requirement)
          ========================================================= */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-50/80 to-emerald-50/80 dark:from-[#1b261b] dark:to-[#172b1e] border border-amber-200/80 dark:border-emerald-800/50 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
              7-Day Newcomer Welcome Bonus
            </h4>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
            Daily check-in streak
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {newcomerDays.map((d) => {
            const isClaimed = d.day <= claimedDay;
            const canClaim = d.day === claimedDay + 1;

            return (
              <button
                key={d.day}
                onClick={() => handleClaimNewcomerDay(d.day)}
                className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  isClaimed
                    ? 'bg-emerald-100/70 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700'
                    : canClaim
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 animate-pulse'
                    : 'bg-white/60 dark:bg-[#14231a] border-emerald-100 dark:border-emerald-800/40 opacity-70'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-200">
                  Day {d.day}
                </span>
                <span className="text-xl my-1">{d.icon}</span>
                <span className="text-[9px] font-semibold text-emerald-950 dark:text-emerald-100 leading-tight">
                  {d.reward}
                </span>
                {isClaimed && (
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          MARKET CATALOG TABS
          ========================================================= */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveCategory('topup')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'topup'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-md font-black'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>🪙 Top-up (IAP)</span>
        </button>

        <button
          onClick={() => setActiveCategory('food')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'food'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#14231a] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food &amp; Snacks</span>
        </button>

        <button
          onClick={() => setActiveCategory('care')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'care'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#14231a] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Bath className="w-3.5 h-3.5" />
          <span>Bath &amp; Care</span>
        </button>

        <button
          onClick={() => setActiveCategory('wearables')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'wearables'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#14231a] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Clothing &amp; Hats</span>
        </button>

        <button
          onClick={() => setActiveCategory('awards')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'awards'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#14231a] text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Circle Awards</span>
        </button>
      </div>

      {/* =========================================================
          CATALOG ITEMS GRID
          ========================================================= */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#132219] border border-emerald-100 dark:border-emerald-800/60 p-4 sm:p-5 shadow-xs">
        {/* TOP-UP (IN-APP PURCHASES) CATEGORY */}
        {activeCategory === 'topup' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200/80 dark:border-amber-900/50">
              <div>
                <h4 className="text-xs font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                  <span>🪙 Sanctuary Wellness Points (WP) Store</span>
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Instant credit. Support mindful development &amp; unlock food, clothes, and games.
                </p>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-1 self-start sm:self-auto bg-white/80 dark:bg-black/40 p-1 rounded-xl border border-amber-200 dark:border-amber-800">
                <button
                  onClick={() => setCurrency('PHP')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    currency === 'PHP'
                      ? 'bg-amber-500 text-amber-950 shadow-xs'
                      : 'text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  🇵🇭 ₱ PHP
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    currency === 'USD'
                      ? 'bg-amber-500 text-amber-950 shadow-xs'
                      : 'text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  🇺🇸 $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {iapBundles.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-emerald-50/50 dark:from-[#192b20] dark:to-[#122218] border border-amber-200/80 dark:border-emerald-800/60 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{b.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                            {b.name}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                            {b.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/40 dark:border-emerald-800/40">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        +{b.wp + b.bonus} WP
                      </span>
                      {b.bonus > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ({b.bonus} bonus)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSimulateIAP(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                    >
                      Buy {currency === 'PHP' ? b.pricePhp : b.priceUsd}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                🔒 Safe &amp; verified. Real-time instant credit with zero paywalls on essential mental health support.
              </p>
            </div>
          </div>
        )}

        {/* FOOD CATEGORY */}
        {activeCategory === 'food' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foodCatalog.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#172b1f] border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-semibold mt-0.5 block">
                      In Pantry: x{inventory[item.key]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const ok = onBuyItem(item.key, item.cost);
                    if (ok) {
                      confetti({ particleCount: 20, spread: 40 });
                      showToast(`Added ${item.name} to pantry! 🧺`);
                    }
                  }}
                  disabled={points < item.cost}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  {item.cost} WP
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CARE CATEGORY */}
        {activeCategory === 'care' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careCatalog.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#172b1f] border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-semibold mt-0.5 block">
                      In Bag: x{inventory[item.key]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const ok = onBuyItem(item.key, item.cost);
                    if (ok) {
                      confetti({ particleCount: 20, spread: 40 });
                      showToast(`Added ${item.name} to care supplies! 🧼`);
                    }
                  }}
                  disabled={points < item.cost}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  {item.cost} WP
                </button>
              </div>
            ))}
          </div>
        )}

        {/* WEARABLES CATEGORY */}
        {activeCategory === 'wearables' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wearablesCatalog.map((acc) => {
              const isOwned = accessories[acc.key];
              const isEquipped =
                (acc.slot === 'hat' && equipped.hat === acc.val) ||
                (acc.slot === 'glasses' && equipped.glasses) ||
                (acc.slot === 'scarf' && equipped.scarf);

              return (
                <div
                  key={acc.key}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#172b1f] border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{acc.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {acc.name}
                      </h4>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                        {acc.desc}
                      </p>
                    </div>
                  </div>

                  {isOwned ? (
                    <button
                      onClick={() =>
                        onEquipAccessory(
                          acc.slot,
                          isEquipped ? (acc.slot === 'hat' ? null : false) : acc.val
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        isEquipped
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-300'
                      }`}
                    >
                      {isEquipped ? 'Equipped ✓' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const ok = onBuyAccessory(acc.key, acc.cost);
                        if (ok) {
                          confetti({ particleCount: 30, spread: 50 });
                          showToast(`Unlocked ${acc.name}! 👒`);
                        }
                      }}
                      disabled={points < acc.cost}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {acc.cost} WP
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CIRCLE AWARDS (Real-money style simulated tokens §10) */}
        {activeCategory === 'awards' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 mb-2">
              <p className="font-semibold">
                Circle Awards are special peer tokens given to honor heartfelt reflections in Bayanihan Circle. Never buyable with WP.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {circleAwardsCatalog.map((aw) => (
                <div
                  key={aw.id}
                  className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-[#1a2b1f] border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{aw.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                        {aw.name}
                      </h4>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                        {aw.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      confetti({ particleCount: 35, spread: 55 });
                      showToast(`Award gifted to the community! 🏆`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {aw.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-emerald-900/90 text-white text-xs font-semibold backdrop-blur-md shadow-xl border border-emerald-700 text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
