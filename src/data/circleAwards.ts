import { Leaf, HeartHandshake, Star, Flower, Gem } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Shared Circle Award visuals.
 *
 * The award icon + its container colour classes live here once and are consumed
 * by both the Circle Awards section in ExpandedMarket and the per-post award
 * picker in RedditCommunity, so the two can never drift apart. Each consumer
 * keeps its own naming, pricing and persistence — this is visuals only.
 */
export interface CircleAwardVisual {
  /** Tier 1-5, matching the order the Circle Awards are listed in. */
  tier: number;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const CIRCLE_AWARD_VISUALS: CircleAwardVisual[] = [
  {
    tier: 1,
    Icon: Leaf,
    iconBg: 'bg-white dark:bg-[#2a3a30] border border-green-100 dark:border-green-900/40',
    iconColor: 'text-green-600 dark:text-green-300',
  },
  {
    tier: 2,
    Icon: HeartHandshake,
    iconBg: 'bg-white dark:bg-[#2a3a30] border border-rose-100 dark:border-rose-900/40',
    iconColor: 'text-rose-500 dark:text-rose-300',
  },
  {
    tier: 3,
    Icon: Star,
    iconBg: 'bg-white dark:bg-[#2a3a30] border border-amber-200 dark:border-amber-800/50',
    iconColor: 'text-amber-500 dark:text-amber-300',
  },
  {
    tier: 4,
    Icon: Flower,
    iconBg: 'bg-white dark:bg-[#2a3a30] border border-pink-100 dark:border-pink-900/40',
    iconColor: 'text-pink-500 dark:text-pink-300',
  },
  {
    tier: 5,
    Icon: Gem,
    iconBg: 'bg-white dark:bg-[#2a3a30] border border-violet-100 dark:border-violet-900/40',
    iconColor: 'text-violet-500 dark:text-violet-300',
  },
];
