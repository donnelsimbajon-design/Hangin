import React from 'react';
import { ShoppingBag, Sparkles, Check, Shirt, Utensils, Bath } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Inventory, AccessoryInventory, EquippedAccessories } from '../types';

interface WellnessMarketProps {
  points: number;
  inventory: Inventory;
  accessories: AccessoryInventory;
  equipped: EquippedAccessories;
  onBuyItem: (itemKey: keyof Inventory, cost: number) => boolean;
  onBuyAccessory: (accKey: keyof AccessoryInventory, cost: number) => boolean;
  onEquipAccessory: (slot: 'hat' | 'glasses' | 'scarf', value: any) => void;
}

export const WellnessMarket: React.FC<WellnessMarketProps> = ({
  points,
  inventory,
  accessories,
  equipped,
  onBuyItem,
  onBuyAccessory,
  onEquipAccessory,
}) => {
  const suppliesCatalog: {
    key: keyof Inventory;
    name: string;
    icon: string;
    cost: number;
    category: 'food' | 'care';
    desc: string;
  }[] = [
    { key: 'apple', name: 'Fresh Apple', icon: '🍎', cost: 4, category: 'food', desc: '+20 Fullness & sweet crunch' },
    { key: 'banana', name: 'Ripe Banana', icon: '🍌', cost: 5, category: 'food', desc: '+22 Fullness & gentle energy' },
    { key: 'riceBowl', name: 'Warm Rice Bowl', icon: '🍚', cost: 8, category: 'food', desc: '+35 Fullness & comfort' },
    { key: 'water', name: 'Mineral Spring Water', icon: '💧', cost: 2, category: 'care', desc: '+12 Hydration' },
    { key: 'soap', name: 'Scented Foam Soap', icon: '🧼', cost: 5, category: 'care', desc: 'Creates 3D bath bubbles & cleans coat' },
    { key: 'brush', name: 'Gentle Wooden Brush', icon: '🪮', cost: 7, category: 'care', desc: '+15 Coat shine & happiness' },
  ];

  const wearablesCatalog: {
    key: keyof AccessoryInventory;
    slot: 'hat' | 'glasses' | 'scarf';
    val: any;
    name: string;
    icon: string;
    cost: number;
    desc: string;
  }[] = [
    { key: 'hatSalakot', slot: 'hat', val: 'salakot', name: 'Woven Salakot Hat', icon: '👒', cost: 15, desc: 'Classic Filipino sun-shield hat in 3D' },
    { key: 'hatBeanie', slot: 'hat', val: 'beanie', name: 'Cozy Sage Beanie', icon: '🧶', cost: 18, desc: 'Warm knit pom-pom winter beanie in 3D' },
    { key: 'sunglasses', slot: 'glasses', val: true, name: 'Calm Dark Shades', icon: '🕶️', cost: 14, desc: 'Cool tortoiseshell sunglasses in 3D' },
    { key: 'cozyScarf', slot: 'scarf', val: true, name: 'Hand-knit Coral Scarf', icon: '🧣', cost: 20, desc: 'Soft warm neck scarf in 3D' },
  ];

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-[#d7e6dc] dark:border-[#244137] p-4 sm:p-6 shadow-sm">
      {/* Market Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e4eee8] dark:border-[#244137] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
              Sanctuary Market
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Nourishing treats and 3D companion wearables
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/40 text-xs font-bold text-amber-900 dark:text-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{points} WP</span>
        </div>
      </div>

      {/* 3D Wearables Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
          <Shirt className="w-3.5 h-3.5" /> 3D Wearable Styles
        </h4>
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
                className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">{acc.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      {acc.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isOwned ? (
                    <button
                      onClick={() =>
                        onEquipAccessory(
                          acc.slot,
                          isEquipped ? (acc.slot === 'hat' ? null : false) : acc.val
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
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
                        const success = onBuyAccessory(acc.key, acc.cost);
                        if (success) confetti({ particleCount: 25, spread: 45 });
                      }}
                      disabled={points < acc.cost}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-40 cursor-pointer shadow-2xs"
                    >
                      {acc.cost} WP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fresh Nourishment & Care Supplies */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5" /> Care &amp; Nourishment Supplies
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suppliesCatalog.map((item) => {
            const count = inventory[item.key] || 0;
            return (
              <div
                key={item.key}
                className="p-3 rounded-2xl bg-white dark:bg-[#182a22] border border-[#e2ece6] dark:border-[#244137] flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        (Owned: {count})
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const success = onBuyItem(item.key, item.cost);
                    if (success) confetti({ particleCount: 20, spread: 40 });
                  }}
                  disabled={points < item.cost}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40 cursor-pointer shadow-2xs shrink-0"
                >
                  +{item.cost} WP
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
