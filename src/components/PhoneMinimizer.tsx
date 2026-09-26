import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowLeft, Shield, Wind, Sparkles, X, Sliders } from 'lucide-react';

interface PhoneMinimizerProps {
  onOpenHangin: () => void;
  onOpenJournal: () => void;
  onOpenBreathing: () => void;
  onExit: () => void;
  blockedAttemptsCount?: number;
}

export const PhoneMinimizer: React.FC<PhoneMinimizerProps> = ({
  onOpenHangin,
  onOpenJournal,
  onOpenBreathing,
  onExit,
  blockedAttemptsCount = 14,
}) => {
  const [view, setView] = useState<'starred' | 'all'>('starred');
  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const starredApps = [
    { name: 'Hangin', action: onOpenHangin, badge: '🌿 Sanctuary' },
    { name: 'Journal', action: onOpenJournal, badge: '🔒 PIN Locked' },
    { name: 'Breathe', action: onOpenBreathing, badge: '💨 1-Min' },
    { name: 'Notion', action: onOpenJournal },
    { name: 'Photos', action: () => {} },
    { name: 'Camera', action: () => {} },
    { name: 'Internet (Safe Mode)', action: () => {}, badge: '🛡️ Porn Blocked' },
  ];

  const allApps = [
    { name: '1Password' },
    { name: 'Beeper' },
    { name: 'Breathe', action: onOpenBreathing },
    { name: 'Calculator' },
    { name: 'Calendar' },
    { name: 'Camera' },
    { name: 'Clock' },
    { name: 'Contacts' },
    { name: 'Hangin', action: onOpenHangin, highlight: true },
    { name: 'Internet (Adult Blocked)' },
    { name: 'Journal (Hangin)', action: onOpenJournal, highlight: true },
    { name: 'Notion' },
    { name: 'Photos' },
    { name: 'Settings' },
  ];

  const filteredAllApps = allApps.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full min-h-[580px] bg-black text-white flex flex-col justify-between font-sans select-none p-6 sm:p-8 relative overflow-hidden">
      {/* Top Status Bar (Based on Image #4: 11:52, wifi, battery) */}
      <div className="w-full flex items-center justify-between text-xs text-white/90 font-mono tracking-wider pt-1">
        <span className="text-sm font-semibold">{timeStr || '11:52'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Shield Active</span>
          </span>
          <span className="text-xs">92%</span>
          <div className="w-4 h-2 rounded-xs border border-white/80 p-0.5 flex items-center">
            <div className="w-full h-full bg-white rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Switcher: Apps / Settings (Image #4 right phone style) */}
      <div className="w-full flex items-center justify-between text-xs text-white/60 pt-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('starred')}
            className={`cursor-pointer transition-colors ${
              view === 'starred' ? 'text-white font-bold' : 'hover:text-white/80'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setView('all')}
            className={`cursor-pointer transition-colors ${
              view === 'all' ? 'text-white font-bold' : 'hover:text-white/80'
            }`}
          >
            All Apps ({allApps.length})
          </button>
        </div>

        <button
          onClick={onExit}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Minimizer</span>
        </button>
      </div>

      {/* Content Area: Pristine Minimalist Typography (Image #4) */}
      <div className="flex-1 flex flex-col justify-center py-6 overflow-y-auto">
        {view === 'starred' ? (
          /* LARGE CLEAN TYPOGRAPHY LIST (IMAGE #4 LEFT PHONE) */
          <div className="space-y-4 my-auto">
            {starredApps.map((app) => (
              <motion.div
                key={app.name}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={app.action}
                className="group flex items-center justify-between cursor-pointer py-1"
              >
                <span className="text-2xl sm:text-3xl font-light tracking-wide text-white group-hover:text-emerald-300 transition-colors">
                  {app.name}
                </span>
                {app.badge && (
                  <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    {app.badge}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* ALPHABETICAL LIST (IMAGE #4 RIGHT PHONE) */
          <div className="space-y-2.5 my-auto max-h-[440px] overflow-y-auto pr-1">
            {filteredAllApps.map((app) => (
              <div
                key={app.name}
                onClick={app.action}
                className={`py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                  app.highlight
                    ? 'text-emerald-300 font-bold'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <span className="text-base tracking-wide">{app.name}</span>
                {app.highlight && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: Search & Digital Shield Stats */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>{blockedAttemptsCount} adult & distractor blocks today</span>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Search phone"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search Overlay */}
      {showSearch && (
        <div className="absolute inset-x-4 bottom-16 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl z-20 flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type app name..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none"
          />
          <button onClick={() => setShowSearch(false)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
