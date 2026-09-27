import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  BatteryFull,
  Calculator,
  Calendar,
  Camera,
  Clock,
  ContactRound,
  EyeOff,
  FileText,
  GlobeLock,
  Image as ImageIcon,
  Info,
  KeyRound,
  LayoutGrid,
  Leaf,
  Lock,
  MessageSquare,
  NotebookPen,
  Search,
  Settings,
  ShieldCheck,
  ShieldOff,
  Signal,
  Star,
  Wind,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PhoneMinimizerProps {
  onOpenHangin: () => void;
  onOpenJournal: () => void;
  onOpenBreathing: () => void;
  onExit: () => void;
  blockedAttemptsCount?: number;
}

type AppView = 'starred' | 'all';

interface MinimizerApp {
  name: string;
  icon: LucideIcon;
  action?: () => void;
  /** Shown in the Favorites tab. */
  favorite?: boolean;
  /** Hangin / Journal / Breathe — the wellness core of the minimizer. */
  wellness?: boolean;
  /** Right-aligned status pill. */
  badge?: string;
  badgeIcon?: LucideIcon;
  /** Filtered / dimmed entry (e.g. adult content is blocked). */
  restricted?: boolean;
}

/** Shared class for every touch-friendly list row. */
const ROW_BASE =
  'w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 min-h-[60px] text-left transition-colors duration-150';
const ROW_ACTIVE = 'cursor-pointer hover:bg-white/[0.05] active:bg-white/[0.08]';
const ROW_DISABLED = 'cursor-default';

export const PhoneMinimizer: React.FC<PhoneMinimizerProps> = ({
  onOpenHangin,
  onOpenJournal,
  onOpenBreathing,
  onExit,
  blockedAttemptsCount = 14,
}) => {
  const [view, setView] = useState<AppView>('starred');
  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Escape steps out of search first, then leaves the minimizer entirely.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showSearch) {
        setShowSearch(false);
        setSearchQuery('');
        return;
      }
      onExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit, showSearch]);

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  // Single source of truth for both tabs. Favorites is a curated subset of it,
  // so no app can drift between the two lists.
  const apps: MinimizerApp[] = [
    {
      name: 'Hangin',
      icon: Leaf,
      action: onOpenHangin,
      favorite: true,
      wellness: true,
      badge: 'Sanctuary',
    },
    {
      name: 'Journal',
      icon: NotebookPen,
      action: onOpenJournal,
      favorite: true,
      wellness: true,
      badge: 'PIN Locked',
      badgeIcon: Lock,
    },
    {
      name: 'Breathe',
      icon: Wind,
      action: onOpenBreathing,
      favorite: true,
      wellness: true,
      badge: '1-Min Reset',
    },
    { name: 'Notion', icon: FileText, action: onOpenJournal, favorite: true },
    { name: 'Photos', icon: ImageIcon, favorite: true },
    { name: 'Camera', icon: Camera, favorite: true },
    {
      name: 'Internet (Safe Mode)',
      icon: GlobeLock,
      favorite: true,
      badge: 'Adult Blocked',
      badgeIcon: EyeOff,
      restricted: true,
    },
    { name: '1Password', icon: KeyRound },
    { name: 'Beeper', icon: MessageSquare },
    { name: 'Calculator', icon: Calculator },
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'Contacts', icon: ContactRound },
    { name: 'Settings', icon: Settings },
  ];

  // Favorites keeps its curated order; All Apps reads as a sorted launcher.
  const favoriteApps = apps.filter((app) => app.favorite);
  const allApps = [...apps].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const sourceList = view === 'starred' ? favoriteApps : allApps;
  const query = searchQuery.trim().toLowerCase();
  const visibleApps = query
    ? sourceList.filter((app) => app.name.toLowerCase().includes(query))
    : sourceList;

  const wellnessActions: { label: string; icon: LucideIcon; action: () => void }[] = [
    { label: 'Hangin', icon: Leaf, action: onOpenHangin },
    { label: 'Journal', icon: NotebookPen, action: onOpenJournal },
    { label: 'Breathe', icon: Wind, action: onOpenBreathing },
  ];

  const statusCells = [
    { label: 'Time', value: timeStr || '--:--', icon: Clock, accent: false },
    {
      label: 'Blocked Today',
      value: String(blockedAttemptsCount),
      icon: ShieldOff,
      accent: true,
    },
    { label: 'Status', value: 'Active', icon: Zap, accent: false },
  ];

  const tabs: { id: AppView; label: string; icon: LucideIcon; count: number }[] = [
    { id: 'starred', label: 'Favorites', icon: Star, count: favoriteApps.length },
    { id: 'all', label: 'All Apps', icon: LayoutGrid, count: allApps.length },
  ];

  return (
    // Backdrop — clicking outside the modal leaves Minimizer Mode.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/92 p-3 backdrop-blur-md sm:p-6 font-sans antialiased select-none"
      onClick={onExit}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-minimizer-title"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[min(88dvh,820px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-zinc-950 text-white shadow-[0_40px_120px_-40px_rgba(16,185,129,0.45)]"
      >
        {/* Subtle emerald aura + hairline accent */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[130%] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        {/* ================= HEADER ================= */}
        <header className="relative shrink-0 px-4 pt-3.5">
          {/* Phone status bar */}
          <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-white/40">
            <span className="font-semibold text-white/85">{timeStr || '--:--'}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <span>92%</span>
              <BatteryFull className="h-3 w-3" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>

            <div className="min-w-0 flex-1">
              <h2
                id="phone-minimizer-title"
                className="truncate text-[15px] font-semibold tracking-tight text-white"
              >
                Phone Minimizer
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Shield Active
              </p>
            </div>

            <button
              type="button"
              onClick={onExit}
              aria-label="Exit Phone Minimizer"
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/[0.07] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ================= COMPACT STATUS ================= */}
        <div className="relative mx-4 grid shrink-0 grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {statusCells.map((cell) => {
            const Icon = cell.icon;
            return (
              <div key={cell.label} className="flex flex-col items-center gap-1 px-1 py-2.5">
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      cell.accent ? 'text-emerald-400' : 'text-white/40'
                    }`}
                  />
                  <span
                    className={`text-[13px] font-semibold tabular-nums ${
                      cell.accent ? 'text-emerald-300' : 'text-white/90'
                    }`}
                  >
                    {cell.value}
                  </span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
                  {cell.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ================= NAVIGATION + SEARCH ================= */}
        <div className="relative shrink-0 px-4 pt-3.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = view === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setView(tab.id)}
                    aria-pressed={isActive}
                    className={`relative flex min-h-[36px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'text-emerald-200'
                        : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="phone-minimizer-tab"
                        className="absolute inset-0 rounded-lg border border-emerald-500/30 bg-emerald-500/15"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative whitespace-nowrap">{tab.label}</span>
                    <span className="relative text-[10px] font-medium tabular-nums text-white/35">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSearch((prev) => !prev);
                if (showSearch) setSearchQuery('');
              }}
              aria-expanded={showSearch}
              aria-label="Search apps"
              className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors ${
                showSearch
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-white/[0.07] bg-white/[0.03] text-white/55 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showSearch && (
              <motion.div
                key="minimizer-search"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-3 py-2.5 transition-shadow focus-within:ring-2 focus-within:ring-emerald-500/25">
                    <Search className="h-4 w-4 shrink-0 text-emerald-300/80" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowSearch(false);
                          setSearchQuery('');
                        }
                      }}
                      placeholder="Search apps..."
                      aria-label="Search apps"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/30 sm:block">
                        Esc
                      </kbd>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= APP LIST ================= */}
        <div className="relative mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.14)_transparent]">
          {query && (
            <p className="pb-2 text-[11px] font-medium text-white/40">
              {visibleApps.length} {visibleApps.length === 1 ? 'result' : 'results'} for{' '}
              <span className="text-emerald-300/90">“{searchQuery.trim()}”</span>
            </p>
          )}

          {visibleApps.length > 0 ? (
            <ul className="divide-y divide-white/[0.05] pb-1">
              {visibleApps.map((app) => {
                const Icon = app.icon;
                const BadgeIcon = app.badgeIcon;
                const isInteractive = Boolean(app.action);

                const row = (
                  <>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
                        app.wellness
                          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                          : app.restricted
                            ? 'border-white/[0.07] bg-white/[0.03] text-white/40'
                            : 'border-white/[0.09] bg-white/[0.05] text-white/65'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`flex items-center gap-2 text-[15px] font-medium ${
                          app.wellness ? 'text-emerald-100' : 'text-white/85'
                        }`}
                      >
                        <span className="truncate">{app.name}</span>
                        {app.wellness && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        )}
                      </span>
                      {app.badge && (
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/35">
                          {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                          {app.badge}
                        </span>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={app.name}>
                    {isInteractive ? (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.985 }}
                        onClick={app.action}
                        className={`${ROW_BASE} ${ROW_ACTIVE}`}
                      >
                        {row}
                      </motion.button>
                    ) : (
                      <div
                        aria-disabled="true"
                        className={`${ROW_BASE} ${ROW_DISABLED} opacity-55`}
                      >
                        {row}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-white/35">
                <Search className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-white/60">No apps found</p>
              <p className="text-xs text-white/35">
                Nothing matches “{searchQuery.trim()}” in this view.
              </p>
            </div>
          )}
        </div>

        {/* ================= QUICK WELLNESS ACTIONS ================= */}
        <div className="relative shrink-0 border-t border-white/[0.06] px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Quick Wellness
          </p>
          <div className="grid grid-cols-3 gap-2">
            {wellnessActions.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={item.action}
                  className="flex min-h-[62px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-1 text-emerald-100 transition-colors hover:border-emerald-400/45 hover:bg-emerald-500/15"
                >
                  <Icon className="h-[18px] w-[18px] text-emerald-300" />
                  <span className="text-[11px] font-semibold tracking-tight">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ================= SHIELD INFORMATION ================= */}
        <div className="relative flex shrink-0 items-start gap-2.5 border-t border-white/[0.06] px-4 py-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
          <p className="text-[11px] leading-relaxed text-white/45">
            <span className="font-semibold text-emerald-300">Shield Active</span>
            <span className="text-white/30"> · </span>
            {blockedAttemptsCount} blocked today. Adult and distracting content is filtered
            automatically while the minimizer is running.
          </p>
        </div>

        {/* ================= EXIT (secondary) ================= */}
        <div className="relative shrink-0 border-t border-white/[0.06] px-4 py-2.5">
          <button
            type="button"
            onClick={onExit}
            className="flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/85"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit Minimizer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
