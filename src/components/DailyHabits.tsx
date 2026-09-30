import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Sparkles, Droplets, Sun, Moon, Utensils, Heart, BellOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyHabit } from '../types';

interface DailyHabitsProps {
  habits: DailyHabit[];
  onToggleHabit: (habitId: string) => void;
  companionName: string;
}

export const DailyHabits: React.FC<DailyHabitsProps> = ({
  habits,
  onToggleHabit,
  companionName,
}) => {
  const completedCount = habits.filter((h) => h.completed).length;
  const progressPct = Math.round((completedCount / habits.length) * 100);

  const getCategoryIcon = (category: DailyHabit['category']) => {
    switch (category) {
      case 'screen':
        return <BellOff className="w-4 h-4 text-amber-600" />;
      case 'body':
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'rest':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />;
    }
  };

  const handleHabitClick = (habit: DailyHabit) => {
    if (!habit.completed) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
    onToggleHabit(habit.id);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-[#d7e6dc] dark:border-[#244137] p-4 sm:p-5 shadow-sm">
      {/* Header with Progress Bar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
            Gentle Daily Habits
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {completedCount} of {habits.length} completed today &bull; +5 WP each
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{progressPct}%</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => handleHabitClick(habit)}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              habit.completed
                ? 'bg-emerald-50/80 dark:bg-[#182a22] border-emerald-300/80 dark:border-[#2d4d41]/50 text-emerald-950 dark:text-emerald-100'
                : 'bg-white dark:bg-[#182a22] border-[#e2ece6] dark:border-[#244137] text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  habit.completed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100/70 dark:bg-emerald-900/40'
                }`}
              >
                {habit.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  getCategoryIcon(habit.category)
                )}
              </div>
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    habit.completed
                      ? 'line-through text-emerald-800/70 dark:text-emerald-300/70'
                      : 'text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  {habit.title}
                </span>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 capitalize">
                  {habit.category} care &bull; +{habit.rewardWP} Wellness Points
                </span>
              </div>
            </div>

            <div className="shrink-0">
              {habit.completed ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  Done ✓
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  +{habit.rewardWP} WP
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
