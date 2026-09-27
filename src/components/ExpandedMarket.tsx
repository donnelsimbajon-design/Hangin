import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Check,
  CheckCircle2,
  Gift,
  Award,
  Shirt,
  Utensils,
  Bath,
  Coins,
  Leaf,
  Flower,
  Flower2,
  Crown,
  Gem,
  Star,
  HeartHandshake,
  Snowflake,
  Wind,
  Sun,
  Glasses,
  Trophy,
  Beef,
  Bone,
  Cookie,
  Apple,
  Fish,
  Milk,
  Droplet,
  Paintbrush2,
  Dog,
  Cat,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Inventory, AccessoryInventory, EquippedAccessories, DailyHabit, PetSpecies } from '../types';

interface ExpandedMarketProps {
  species?: PetSpecies;
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
  species = 'dog',
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
      Icon: Coins,
      badge: 'Starter',
      desc: 'Quick refill for treats and pantry care items',
      iconBg: 'bg-white dark:bg-[#182a22] border border-yellow-100 dark:border-yellow-900/40',
      iconColor: 'text-yellow-600 dark:text-yellow-300',
    },
    {
      id: 'meadow',
      name: 'Sanctuary Meadow',
      wp: 150,
      bonus: 20,
      pricePhp: '₱99',
      priceUsd: '$1.99',
      Icon: Leaf,
      badge: 'Most Popular',
      desc: '+20 Bonus WP. Great for cozy beanies & sunglasses',
      iconBg: 'bg-white dark:bg-[#182a22] border border-green-100 dark:border-green-900/40',
      iconColor: 'text-green-600 dark:text-green-300',
    },
    {
      id: 'canopy',
      name: 'Ancient Canopy Vault',
      wp: 400,
      bonus: 80,
      pricePhp: '₱199',
      priceUsd: '$3.99',
      Icon: Flower2,
      badge: 'Best Value',
      desc: '+80 Bonus WP. Generous wardrobe & care stash',
      iconBg: 'bg-white dark:bg-[#182a22] border border-pink-100 dark:border-pink-900/40',
      iconColor: 'text-pink-500 dark:text-pink-300',
    },
    {
      id: 'guardian',
      name: 'Guardian Sanctuary Chest',
      wp: 1000,
      bonus: 300,
      pricePhp: '₱399',
      priceUsd: '$7.99',
      Icon: Crown,
      badge: 'Ultimate',
      desc: '+300 Bonus WP. Patron blessing & endless nourishment',
      iconBg: 'bg-white dark:bg-[#182a22] border border-amber-200 dark:border-amber-800/50',
      iconColor: 'text-amber-600 dark:text-amber-300',
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
    showToast(`Payment confirmed — +${totalWp} WP credited`);
    setPurchasingBundle(null);
  };

  // 7-day newcomer bonus calendar
  const newcomerDays = [
    { day: 1, reward: '+10 WP', Icon: Sparkles, item: 'points', claimed: true },
    { day: 2, reward: '2x Apples', Icon: Apple, item: 'apple', claimed: false },
    { day: 3, reward: 'Sage Beanie', Icon: Snowflake, item: 'hatBeanie', claimed: false },
    { day: 4, reward: '+20 WP', Icon: Coins, item: 'points', claimed: false },
    { day: 5, reward: '3x Lavender Soap', Icon: Droplet, item: 'soap', claimed: false },
    { day: 6, reward: 'Cozy Scarf', Icon: Wind, item: 'cozyScarf', claimed: false },
    { day: 7, reward: 'Blessing Award', Icon: Trophy, item: 'award', claimed: false },
  ];

  const handleClaimNewcomerDay = (dayNum: number) => {
    if (dayNum !== claimedDay + 1 && dayNum !== 1) {
      showToast('Log in tomorrow to claim the next day reward');
      return;
    }
    setClaimedDay(dayNum);
    confetti({ particleCount: 40, spread: 60 });
    if (dayNum === 2) onBuyItem('apple', 0);
    if (dayNum === 4) onAddPoints(20);
    if (dayNum === 5) onBuyItem('soap', 0);
    showToast(`Claimed Day ${dayNum} reward`);
  };

  const foodCatalog = [
    // Dog Delights
    { key: 'kibble' as const, name: 'Savory Beef Kibble', Icon: Beef, species: 'dog' as const, cost: 6, desc: 'Balanced hearty meal for dogs', iconBg: 'bg-white dark:bg-[#182a22] border border-amber-100 dark:border-amber-900/40', iconColor: 'text-amber-700 dark:text-amber-300' },
    { key: 'bone' as const, name: 'Puppy Chew Bone', Icon: Bone, species: 'dog' as const, cost: 7, desc: 'Relieves canine teething & stress', iconBg: 'bg-white dark:bg-[#182a22] border border-stone-200 dark:border-stone-700/50', iconColor: 'text-stone-500 dark:text-stone-300' },
    { key: 'treat' as const, name: 'Bickie Biscuit Treat', Icon: Cookie, species: 'dog' as const, cost: 4, desc: 'Crunchy oven-baked puppy reward', iconBg: 'bg-white dark:bg-[#182a22] border border-amber-100 dark:border-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-300' },
    { key: 'apple' as const, name: 'Crisp Apple Slice', Icon: Apple, species: 'dog' as const, cost: 3, desc: 'Vet-safe seedless crisp crunch', iconBg: 'bg-white dark:bg-[#182a22] border border-red-100 dark:border-red-900/40', iconColor: 'text-red-600 dark:text-red-300' },
    // Cat Delights
    { key: 'salmon' as const, name: 'Steamed Salmon Fillet', Icon: Fish, species: 'cat' as const, cost: 8, desc: 'Rich Omega-3 feline gourmet meal', iconBg: 'bg-white dark:bg-[#182a22] border border-orange-100 dark:border-orange-900/40', iconColor: 'text-orange-500 dark:text-orange-300' },
    { key: 'catKibble' as const, name: 'Crunchy Tuna Kibble', Icon: Fish, species: 'cat' as const, cost: 6, desc: 'High-protein daily cat food', iconBg: 'bg-white dark:bg-[#182a22] border border-blue-100 dark:border-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-300' },
    { key: 'catnip' as const, name: 'Catnip Herb Delight', Icon: Leaf, species: 'cat' as const, cost: 5, desc: 'Aromatic soothing feline herb', iconBg: 'bg-white dark:bg-[#182a22] border border-green-100 dark:border-green-900/40', iconColor: 'text-green-600 dark:text-green-300' },
    { key: 'catMilk' as const, name: 'Lactose-Free Cat Milk', Icon: Milk, species: 'cat' as const, cost: 4, desc: 'Gentle & digestible for cats', iconBg: 'bg-white dark:bg-[#182a22] border border-sky-100 dark:border-sky-900/40', iconColor: 'text-sky-500 dark:text-sky-300' },
    // Hydration
    { key: 'water' as const, name: 'Fresh Spring Water', Icon: Droplet, species: 'all' as const, cost: 2, desc: 'Pure hydration for all pets', iconBg: 'bg-white dark:bg-[#182a22] border border-blue-100 dark:border-blue-900/40', iconColor: 'text-blue-500 dark:text-blue-300' },
  ];

  const careCatalog = [
    { key: 'soap' as const, name: 'Lavender Soap Bar', Icon: Sparkles, cost: 5, desc: 'Fluffy suds for bath time', iconBg: 'bg-white dark:bg-[#182a22] border border-purple-100 dark:border-purple-900/40', iconColor: 'text-purple-500 dark:text-purple-300' },
    { key: 'brush' as const, name: 'Wooden Coat Brush', Icon: Paintbrush2, cost: 7, desc: '+15 Coat shine & happiness', iconBg: 'bg-white dark:bg-[#182a22] border border-amber-100 dark:border-amber-900/40', iconColor: 'text-amber-700 dark:text-amber-300' },
  ];

  const wearablesCatalog = [
    { key: 'hatSalakot' as const, slot: 'hat' as const, val: 'salakot', name: 'Woven Salakot Hat', Icon: Sun, cost: 15, desc: 'Classic Filipino straw sun hat', iconBg: 'bg-white dark:bg-[#182a22] border border-yellow-100 dark:border-yellow-900/40', iconColor: 'text-yellow-700 dark:text-yellow-300' },
    { key: 'hatBeanie' as const, slot: 'hat' as const, val: 'beanie', name: 'Cozy Knit Beanie', Icon: Snowflake, cost: 18, desc: 'Warm sage pom-pom winter beanie', iconBg: 'bg-white dark:bg-[#182a22] border border-teal-100 dark:border-teal-900/40', iconColor: 'text-teal-600 dark:text-teal-300' },
    { key: 'sunglasses' as const, slot: 'glasses' as const, val: true, name: 'Cool Dark Shades', Icon: Glasses, cost: 14, desc: 'Classic sunglasses', iconBg: 'bg-white dark:bg-[#182a22] border border-slate-200 dark:border-slate-700/50', iconColor: 'text-slate-700 dark:text-slate-300' },
    { key: 'cozyScarf' as const, slot: 'scarf' as const, val: true, name: 'Hand-knit Scarf', Icon: Wind, cost: 20, desc: 'Soft neck scarf', iconBg: 'bg-white dark:bg-[#182a22] border border-orange-100 dark:border-orange-900/40', iconColor: 'text-orange-500 dark:text-orange-300' },
  ];

  const circleAwardsCatalog = [
    { id: 'tier-1', name: 'Leaf Thanks', price: '₱50', Icon: Leaf, desc: 'A gentle pat on the back for a thoughtful post' },
    { id: 'tier-2', name: 'Warm Hug Award', price: '₱100', Icon: HeartHandshake, desc: 'Sends cozy warmth and highlighted border' },
    { id: 'tier-3', name: 'Guiding Star', price: '₱250', Icon: Star, desc: 'Recognizes exceptional compassion & honesty' },
    { id: 'tier-4', name: 'Golden Lotus', price: '₱500', Icon: Flower, desc: 'Honors profound vulnerability and peer leadership' },
    { id: 'tier-5', name: "Companion's Blessing", price: '₱1,000', Icon: Gem, desc: 'The highest community token of mutual healing' },
  ];

  const speciesBadge = (species: 'dog' | 'cat' | 'all') => {
    if (species === 'dog') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
          <Dog className="w-2.5 h-2.5" /> Dog
        </span>
      );
    }
    if (species === 'cat') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
          <Cat className="w-2.5 h-2.5" /> Cat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
        All pets
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-2xl mx-auto">
      {/* =========================================================
          MARKET TOP BAR & BACK NAVIGATION
          ========================================================= */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/60 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
              Sanctuary Market
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Nourishment, toys, accessories, and wellness points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('topup')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span>+ Top-up</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-[#2d4d41]/40 text-xs font-bold text-emerald-900 dark:text-emerald-100 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            <span>{points} WP</span>
          </div>
        </div>
      </div>

      {/* The "Gentle Daily Habits" panel is no longer surfaced inside Sanctuary
          Market. This is presentation only: `habits` / `onToggleHabit` are still
          part of this component's props and are still supplied by app state, so
          habit tracking, completion, and its WP rewards are entirely unaffected. */}

      {/* =========================================================
          7-DAY NEWCOMER BONUS CALENDAR STRIP (§10 Spec Requirement)
          ========================================================= */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-50 to-white dark:from-[#182a22] dark:to-[#182a22] border border-emerald-200/80 dark:border-emerald-800/50 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
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
            const Icon = d.Icon;

            return (
              <button
                key={d.day}
                onClick={() => handleClaimNewcomerDay(d.day)}
                className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                  isClaimed
                    ? 'bg-emerald-100/70 dark:bg-emerald-900/60 border-emerald-300 dark:border-[#2d4d41]'
                    : canClaim
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 animate-pulse'
                    : 'bg-white/60 dark:bg-[#182a22] border-emerald-100 dark:border-emerald-800/40 opacity-70'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-200">
                  Day {d.day}
                </span>
                <span className="my-1 w-7 h-7 rounded-lg bg-white dark:bg-[#0b1411]/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-semibold text-emerald-950 dark:text-emerald-100 leading-tight">
                  {d.reward}
                </span>
                {isClaimed && (
                  <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-300 mt-0.5" />
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
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Top-up (IAP)</span>
        </button>

        <button
          onClick={() => setActiveCategory('food')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'food'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
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
              : 'bg-white dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
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
              : 'bg-white dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Clothing &amp; Hats</span>
        </button>

        <button
          onClick={() => setActiveCategory('awards')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeCategory === 'awards'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Circle Awards</span>
        </button>
      </div>

      {/* =========================================================
          CATALOG ITEMS GRID
          ========================================================= */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/60 p-4 sm:p-5 shadow-xs">
        {/* TOP-UP (IN-APP PURCHASES) CATEGORY */}
        {activeCategory === 'topup' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
              <div>
                <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                  <span>Sanctuary Wellness Points (WP) Store</span>
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Instant credit. Support mindful development &amp; unlock food, clothes, and games.
                </p>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-1 self-start sm:self-auto bg-white dark:bg-[#0b1411]/40 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <button
                  onClick={() => setCurrency('PHP')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    currency === 'PHP'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  ₱ PHP
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    currency === 'USD'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {iapBundles.map((b) => {
                const Icon = b.Icon;
                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden border bg-white dark:bg-[#182a22] border-[#e4eee8] dark:border-[#244137]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.iconBg} ${b.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                              {b.name}
                            </h4>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#e7efe9] dark:bg-white/10 text-emerald-800 dark:text-emerald-200">
                              {b.badge}
                            </span>
                          </div>
                          <p className="text-[10px] mt-0.5 text-emerald-700 dark:text-emerald-300">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#e4eee8] dark:border-[#244137]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-emerald-800 dark:text-emerald-300">
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
                        className="px-3.5 py-1.5 rounded-xl font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-transform bg-emerald-800 text-white hover:bg-emerald-900"
                      >
                        Buy {currency === 'PHP' ? b.pricePhp : b.priceUsd}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 justify-center text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 shrink-0" />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Safe &amp; verified. Real-time instant credit with zero paywalls on essential mental health support.
              </p>
            </div>
          </div>
        )}

        {/* FOOD CATEGORY */}
        {activeCategory === 'food' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foodCatalog
              .filter((item) => item.species === species || item.species === 'all')
              .map((item) => {
                const Icon = item.Icon;
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                          {item.name}
                        </h4>
                        {speciesBadge(item.species)}
                      </div>
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
                        showToast(`Added ${item.name} to pantry`);
                      }
                    }}
                    disabled={points < item.cost}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    {item.cost} WP
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CARE CATEGORY */}
        {activeCategory === 'care' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careCatalog.map((item) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
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
                        showToast(`Added ${item.name} to care supplies`);
                      }
                    }}
                    disabled={points < item.cost}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    {item.cost} WP
                  </button>
                </div>
              );
            })}
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
              const Icon = acc.Icon;

              return (
                <div
                  key={acc.key}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isEquipped
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-[#2d4d41]'
                      : 'bg-emerald-50/50 dark:bg-[#182a22] border-emerald-100 dark:border-emerald-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${acc.iconBg} ${acc.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 ${
                        isEquipped
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-300'
                      }`}
                    >
                      {isEquipped && <Check className="w-3.5 h-3.5" />}
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const ok = onBuyAccessory(acc.key, acc.cost);
                        if (ok) {
                          confetti({ particleCount: 30, spread: 50 });
                          showToast(`Unlocked ${acc.name}`);
                        }
                      }}
                      disabled={points < acc.cost}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
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
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 mb-2">
              <p className="font-semibold">
                Circle Awards are special peer tokens given to honor heartfelt reflections in Bayanihan Circle. Never buyable with WP.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {circleAwardsCatalog.map((aw) => {
                const Icon = aw.Icon;
                return (
                  <div
                    key={aw.id}
                    className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-[#182a22] border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                          {aw.name}
                        </h4>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                          {aw.desc}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        confetti({ particleCount: 35, spread: 55 });
                        showToast('Award gifted to the community');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
                    >
                      {aw.price}
                    </button>
                  </div>
                );
              })}
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
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-emerald-900/90 text-white text-xs font-semibold backdrop-blur-md shadow-xl border border-emerald-700 text-center flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};