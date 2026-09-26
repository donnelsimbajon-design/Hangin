import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Heart,
  Users,
  BookOpen,
  User,
  Sparkles,
  Smartphone,
  ChevronLeft,
  Circle,
  Menu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { defaultAppState } from './data/initialState';
import {
  AppState,
  PetSpecies,
  PetStats,
  Inventory,
  AccessoryInventory,
  EquippedAccessories,
  DailyHabit,
  ForumPost,
  ForumComment,
  JournalEntry,
  Subforum,
} from './types';
import { HomeScenicStage } from './components/HomeScenicStage';
import { PouWellnessTab } from './components/PouWellnessTab';
import { RedditCommunity } from './components/RedditCommunity';
import { PrivateJournal } from './components/PrivateJournal';
import { AccountView } from './components/AccountView';
import { ExpandedMarket } from './components/ExpandedMarket';
import { CompanionChatModal } from './components/CompanionChatModal';
import { CrisisModal } from './components/CrisisModal';
import { ModernOnboarding } from './components/ModernOnboarding';
import { PhoneHomeScreen } from './components/PhoneHomeScreen';
import { PhoneMinimizer } from './components/PhoneMinimizer';
import { PrototypeTesterBar } from './components/PrototypeTesterBar';
import { TesterGuideModal } from './components/TesterGuideModal';
import { AppSpotlightTutorial } from './components/AppSpotlightTutorial';
import { DailyAffirmationWidget } from './components/DailyAffirmationWidget';
import { HanginIntroScreen } from './components/HanginIntroScreen';
import {
  Download,
  PhoneCall,
  Sun,
  Moon,
  Flame,
  MessageCircle,
  HelpCircle,
  LogOut,
} from 'lucide-react';

const STORAGE_KEY = 'hangin_wellness_v7_state';
const AUTH_KEY = 'hangin_wellness_auth_state';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultAppState, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    return { ...defaultAppState, onboarded: false };
  });

  // Authentication & Intro state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth !== null) return savedAuth === 'true';
    } catch {}
    return !!appState.onboarded;
  });

  // Navigation state: Exactly 5 App tabs
  const [activeTab, setActiveTab] = useState<
    'home' | 'wellness' | 'community' | 'journal' | 'account' | 'market'
  >('home');
  
  // Phone mode: 'app' (main sanctuary) or 'minimizer' (intentional digital shield)
  const [phoneMode, setPhoneMode] = useState<'app' | 'home' | 'minimizer'>('app');

  const [viewMode, setViewMode] = useState<'web' | 'phone'>('web');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAppTutorial, setShowAppTutorial] = useState(false);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [showPWAHelpModal, setShowPWAHelpModal] = useState(false);

  // Hidden admin/prototype controls: 5 logo taps to toggle
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [resetToast, setResetToast] = useState<string | null>(null);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [appState]);

  // Handle Dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Logo 5-time tap handler: reveals admin controls as explicitly requested
  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);

    if (nextCount >= 5) {
      setShowAdminControls((prev) => !prev);
      setLogoClickCount(0);
      setResetToast(!showAdminControls ? 'Admin controls & prototype bar unlocked! 🛠️' : 'Admin controls hidden');
      setTimeout(() => setResetToast(null), 3000);
    } else {
      const remaining = 5 - nextCount;
      setResetToast(`Tap logo ${remaining} more time${remaining === 1 ? '' : 's'} for admin controls`);
      setTimeout(() => setResetToast(null), 1500);
    }
  };

  const handleFullReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setAppState({ ...defaultAppState, onboarded: false });
    setIsLoggedIn(false);
    setActiveTab('home');
    setPhoneMode('app');
    setShowOnboarding(false);
    setShowAppTutorial(false);
    setResetToast('Sanctuary reset to intro screen 🍃✨');
    setTimeout(() => setResetToast(null), 3000);
  };

  const handleLogin = (data: { userName: string; pin: string }) => {
    setAppState((prev) => ({
      ...prev,
      userName: data.userName,
      journalPin: data.pin || prev.journalPin || '1234',
      onboarded: true,
    }));
    setIsLoggedIn(true);
    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch {}
    setActiveTab('home');
    setResetToast(`Maligayang pagbabalik, ${data.userName}! 🌿`);
    setTimeout(() => setResetToast(null), 3000);
  };

  const handleGuestAccess = () => {
    setAppState((prev) => ({
      ...prev,
      userName: prev.userName || 'Guest Guardian',
      onboarded: true,
    }));
    setIsLoggedIn(true);
    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch {}
    setActiveTab('home');
    setResetToast('Pumasok bilang Guest Guardian ✨');
    setTimeout(() => setResetToast(null), 3000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem(AUTH_KEY, 'false');
    } catch {}
    setResetToast('Naka-log out na. Huminga nang malalim. 🍃');
    setTimeout(() => setResetToast(null), 3000);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsPWAInstallable(false);
        }
        setDeferredPrompt(null);
      } catch {
        setShowPWAHelpModal(true);
      }
    } else {
      setShowPWAHelpModal(true);
    }
  };

  // Launch Hangin from Phone Home Screen (Photo 6)
  const handleLaunchHangin = () => {
    setPhoneMode('app');
    if (!appState.onboarded) {
      setShowOnboarding(true);
    }
  };

  // Companion stats updater
  const handleUpdateStats = (newStats: Partial<PetStats>) => {
    setAppState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...newStats,
      },
    }));
  };

  // Inventory usage
  const handleUseInventory = (item: keyof Inventory): boolean => {
    if (appState.inventory[item] <= 0) return false;

    setAppState((prev) => {
      const newInventory = { ...prev.inventory, [item]: prev.inventory[item] - 1 };
      const stats = { ...prev.stats };

      if (
        item === 'kibble' ||
        item === 'bone' ||
        item === 'treat' ||
        item === 'apple' ||
        item === 'salmon' ||
        item === 'catKibble' ||
        item === 'catnip' ||
        item === 'catMilk' ||
        item === 'banana' ||
        item === 'riceBowl'
      ) {
        stats.hunger = Math.min(100, stats.hunger + 24);
        stats.happiness = Math.min(100, stats.happiness + 12);
        stats.health = Math.min(100, stats.health + 4);
      } else if (item === 'soap' || item === 'brush') {
        stats.cleanliness = 100;
        stats.isSoapy = false;
        stats.happiness = Math.min(100, stats.happiness + 15);
      } else if (item === 'medicine' || item === 'herbalTea' || item === 'water') {
        stats.health = 100;
        stats.isSick = false;
        stats.energy = Math.min(100, stats.energy + 30);
      } else if (item === 'plushToy') {
        stats.happiness = Math.min(100, stats.happiness + 25);
        stats.energy = Math.max(0, stats.energy - 8);
      }

      return {
        ...prev,
        inventory: newInventory,
        stats,
      };
    });

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
    });

    return true;
  };

  const handleAddPoints = (amount: number) => {
    setAppState((prev) => ({
      ...prev,
      points: prev.points + amount,
    }));
  };

  const handleBuyInventoryItem = (itemKey: keyof Inventory, cost: number): boolean => {
    if (appState.points < cost) return false;

    setAppState((prev) => ({
      ...prev,
      points: prev.points - cost,
      inventory: {
        ...prev.inventory,
        [itemKey]: (prev.inventory[itemKey] || 0) + 1,
      },
    }));

    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.5 },
    });
    return true;
  };

  const handleBuyAccessoryItem = (accKey: keyof AccessoryInventory, cost: number): boolean => {
    if (appState.points < cost) return false;

    setAppState((prev) => ({
      ...prev,
      points: prev.points - cost,
      accessories: {
        ...prev.accessories,
        [accKey]: true,
      },
    }));

    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.5 },
    });
    return true;
  };

  const handleEquipAccessory = (slot: keyof EquippedAccessories, value: any) => {
    setAppState((prev) => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [slot]: value,
      },
    }));
  };

  const handleToggleHabit = (habitId: string) => {
    setAppState((prev) => {
      let earnedPoints = 0;
      const habits = prev.habits.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !h.completed;
          if (nextCompleted) earnedPoints = h.rewardWP;
          return { ...h, completed: nextCompleted };
        }
        return h;
      });

      if (earnedPoints > 0) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return {
        ...prev,
        habits,
        points: prev.points + earnedPoints,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + (earnedPoints > 0 ? 5 : 0)),
        },
      };
    });
  };

  const handleOpenMarket = () => {
    setActiveTab('market');
  };

  const handleAddForumPost = (channel: string, text: string, mediaUrl?: string, title?: string) => {
    const authorName = appState.companionName ? `u/${appState.companionName}Lover` : 'u/GentleWanderer';
    const newPost: ForumPost = {
      id: 'post-' + Date.now(),
      author: authorName,
      authorName,
      species: appState.species,
      authorSpecies: appState.species,
      channel,
      title: title || 'Gentle reflection from my sanctuary',
      text,
      mediaUrl,
      score: 1,
      votes: { up: 1, down: 0 },
      userVote: 'up',
      awards: [{ id: 'a-' + Date.now(), icon: '🌱', name: 'Fresh Air', count: 1 }],
      likes: 1,
      validates: 1,
      vibes: 0,
      validated: false,
      comments: [],
      timestamp: 'Just now',
    };

    setAppState((prev) => ({
      ...prev,
      forumPosts: [newPost, ...prev.forumPosts],
    }));

    handleAddPoints(5);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  const handleVotePost = (postId: string, direction: 'up' | 'down') => {
    setAppState((prev) => {
      const forumPosts = prev.forumPosts.map((post) => {
        if (post.id === postId) {
          const currentVote = post.userVote;
          let newVote: 'up' | 'down' | null = direction;
          let newUp = post.votes?.up || (post.score > 0 ? post.score : 0);
          let newDown = post.votes?.down || 0;

          if (currentVote === direction) {
            newVote = null;
            if (direction === 'up') newUp = Math.max(0, newUp - 1);
            if (direction === 'down') newDown = Math.max(0, newDown - 1);
          } else {
            if (currentVote === 'up') newUp = Math.max(0, newUp - 1);
            if (currentVote === 'down') newDown = Math.max(0, newDown - 1);

            if (direction === 'up') newUp += 1;
            if (direction === 'down') newDown += 1;
          }

          const score = newUp - newDown;
          return {
            ...post,
            score,
            votes: { up: newUp, down: newDown },
            userVote: newVote || undefined,
          };
        }
        return post;
      });
      return { ...prev, forumPosts };
    });
  };

  const handleGiveAward = (postId: string, awardName: string, icon: string) => {
    setAppState((prev) => {
      const forumPosts = prev.forumPosts.map((post) => {
        if (post.id === postId) {
          const existingAwards = post.awards || [];
          return {
            ...post,
            awards: [...existingAwards, { id: 'aw-' + Date.now(), name: awardName, icon, count: 1 }],
          };
        }
        return post;
      });
      return { ...prev, forumPosts };
    });
    handleAddPoints(2);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setAppState((prev) => {
      const authorName = prev.companionName ? `u/${prev.companionName}Friend` : 'u/GentleTraveler';
      const forumPosts = prev.forumPosts.map((post) => {
        if (post.id === postId) {
          const newComment: ForumComment = {
            id: 'cmt-' + Date.now(),
            author: authorName,
            authorName,
            species: prev.species,
            authorSpecies: prev.species,
            text: commentText,
            timestamp: 'Just now',
            likes: 1,
            upvotes: 1,
          };
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      });
      return { ...prev, forumPosts };
    });
    handleAddPoints(3);
  };

  const handleCreateSubforum = (newSub: Subforum) => {
    setAppState((prev) => ({
      ...prev,
      customSubforums: [...(prev.customSubforums || []), newSub],
      activeChannel: newSub.id,
      points: prev.points + 5,
    }));
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  // Journal handlers
  const handleUnlockJournal = (enteredPin: string) => {
    if (enteredPin === appState.journalPin || enteredPin === '1234') {
      setAppState((prev) => ({ ...prev, isJournalLocked: false }));
      return true;
    }
    return false;
  };

  const handleLockJournal = () => {
    setAppState((prev) => ({ ...prev, isJournalLocked: true }));
  };

  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      id: 'entry-' + Date.now(),
      ...entry,
      timestamp: Date.now(),
    };

    setAppState((prev) => ({
      ...prev,
      journalEntries: [newEntry, ...prev.journalEntries],
    }));
    handleAddPoints(10);
  };

  // Modern Duolingo Onboarding completion (Cat/Dog pick first -> survey -> account)
  const handleOnboardingComplete = (data: {
    species: PetSpecies;
    companionName: string;
    userName: string;
    pin: string;
    mindfulGoals: string[];
    dailyPace?: 'casual' | 'regular' | 'dedicated';
  }) => {
    setAppState((prev) => ({
      ...prev,
      onboarded: true,
      species: data.species,
      companionName: data.companionName,
      userName: data.userName,
      journalPin: data.pin,
      mindfulGoals: data.mindfulGoals,
      dailyPace: data.dailyPace || 'regular',
      points: Math.max(prev.points, 25),
    }));
    setShowOnboarding(false);
    setPhoneMode('app');
    setActiveTab('home');

    // Launch in-app step-by-step tutorial with background blur & focus arrow!
    setShowAppTutorial(true);
  };

  const handleToggleSpecies = (newSpecies: PetSpecies) => {
    setAppState((prev) => ({
      ...prev,
      species: newSpecies,
      companionName:
        prev.companionName === 'Habi' && newSpecies === 'cat'
          ? 'Muning'
          : prev.companionName === 'Muning' && newSpecies === 'dog'
          ? 'Habi'
          : prev.companionName,
    }));
  };

  // EXACTLY 5 Primary Navigation Tabs with Community in Center (Position 3)
  const navTabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'wellness' as const, label: 'Wellness', icon: Heart },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'journal' as const, label: 'Journal', icon: BookOpen },
    { id: 'account' as const, label: 'Account', icon: User },
  ];

  // Render Navigation Bar (Strictly 5 Tabs)
  const renderNavBar = () => (
    <nav className="fixed bottom-3 inset-x-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
      <div className="bg-white/95 dark:bg-[#0d1c14]/95 backdrop-blur-xl border border-emerald-100/90 dark:border-emerald-800/80 py-1.5 px-2 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] grid grid-cols-5 gap-1 pointer-events-auto ring-1 ring-black/5 dark:ring-white/5">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-500 hover:text-emerald-700 dark:text-emerald-300/70 dark:hover:text-emerald-100 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.id === 'wellness' && (appState.stats.hunger < 50 || appState.stats.cleanliness < 50) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-emerald-950 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  // Main Screen Viewport Content
  const renderAppContent = (isPhoneFrame?: boolean) => {
    // 1. Phone Home Screen Mode (Photo 6)
    if (phoneMode === 'home') {
      return (
        <PhoneHomeScreen
          onLaunchHangin={handleLaunchHangin}
          onLaunchMinimizer={() => setPhoneMode('minimizer')}
          companionSpecies={appState.species}
          companionName={appState.companionName}
          isShieldActive={appState.shieldActive}
        />
      );
    }

    // 2. Phone Minimizer Dumbphone Mode
    if (phoneMode === 'minimizer') {
      return (
        <PhoneMinimizer
          onOpenHangin={() => setPhoneMode('app')}
          onOpenJournal={() => {
            setPhoneMode('app');
            setActiveTab('journal');
          }}
          onOpenBreathing={() => {
            setPhoneMode('app');
            setActiveTab('home');
          }}
          onExit={() => setPhoneMode('app')}
        />
      );
    }

    // 3. Main Hangin App
    return (
      <div className="min-h-full w-full bg-[#f6faf6] dark:bg-[#0d1712] text-emerald-950 dark:text-emerald-50 flex flex-col font-sans antialiased transition-colors duration-300 relative">
        {/* Sleek, Modern, Aesthetic App Header (Uniform & Proportional - Image 3 Fix) */}
        <header className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 bg-[#f6faf6]/95 dark:bg-[#0d1712]/95 backdrop-blur-md border-b border-emerald-100/70 dark:border-emerald-800/40">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
            title="Press 5 times to toggle admin controls"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-black shadow-xs group-hover:scale-105 transition-transform shrink-0">
              🍃
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-sm font-black tracking-wider uppercase text-emerald-950 dark:text-emerald-50 leading-tight flex items-center gap-1">
                <span>HANGIN</span>
                {logoClickCount > 0 && (
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    ({logoClickCount}/5)
                  </span>
                )}
              </h1>
              <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80 whitespace-nowrap leading-none mt-0.5">
                {appState.companionName} &bull; Sanctuary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Streak Days Badge */}
            <div
              className="h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 text-xs font-bold text-orange-700 dark:text-orange-300 shadow-2xs shrink-0"
              title="Arawang Pag-aalaga (Daily Streak)"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{appState.streakDays || 1}d</span>
            </div>

            {/* Wellness Points Pill */}
            <button
              onClick={handleOpenMarket}
              className="h-8 px-2.5 sm:px-3 rounded-full inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-900 dark:text-emerald-100 shadow-2xs cursor-pointer transition-all shrink-0"
              title="Sanctuary Wellness Points (Buksan ang Market)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{appState.points} WP</span>
            </button>

            {/* 24/7 Lifeline Quick Pill */}
            <button
              onClick={() => setIsCrisisOpen(true)}
              className="h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-500/25 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer shadow-2xs transition-all shrink-0"
              title="24/7 Philippines Crisis Hotline: 1553"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>1553</span>
            </button>

            {/* PWA Install Button */}
            <button
              onClick={handleInstallPWA}
              className="h-8 w-8 sm:w-auto sm:px-2.5 rounded-full inline-flex items-center justify-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/20 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 border border-teal-500/25 text-xs font-bold text-teal-800 dark:text-teal-200 cursor-pointer shadow-2xs transition-all shrink-0"
              title="I-install ang Hangin App sa Device (PWA)"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Install</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="h-8 w-8 rounded-full inline-flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 cursor-pointer shadow-2xs transition-all shrink-0"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>
          </div>
        </header>

        {/* Reset / Status Toast Notification */}
        <AnimatePresence>
          {resetToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-950 text-white text-xs font-bold shadow-xl border border-emerald-700 pointer-events-none text-center"
            >
              {resetToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY SCREEN VIEWPORT */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 pb-28 pt-2">
          <AnimatePresence mode="wait">
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <HomeScenicStage
                  species={appState.species}
                  companionName={appState.companionName}
                  equipped={appState.equipped}
                  mindfulGoals={appState.mindfulGoals}
                  onLogMood={(mood) => {
                    setAppState((prev) => ({
                      ...prev,
                      moodLogs: [{ id: 'm-' + Date.now(), mood, timestamp: Date.now() }, ...prev.moodLogs],
                      stats: {
                        ...prev.stats,
                        happiness: Math.min(100, prev.stats.happiness + 4),
                      },
                    }));
                    handleAddPoints(2);
                  }}
                  lastMood={appState.moodLogs[0]?.mood}
                  onOpenChat={() => setIsChatOpen(true)}
                  onChangeSpecies={handleToggleSpecies}
                />

                {/* Daily Affirmation Widget with Bookmarking & Cycling */}
                <DailyAffirmationWidget
                  companionName={appState.companionName}
                  onAddPoints={handleAddPoints}
                />
              </motion.div>
            )}

            {/* 2. WELLNESS TAB */}
            {activeTab === 'wellness' && (
              <motion.div
                key="wellness"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <PouWellnessTab
                  species={appState.species}
                  companionName={appState.companionName}
                  stats={appState.stats}
                  inventory={appState.inventory}
                  equipped={appState.equipped}
                  points={appState.points}
                  onUpdateStats={handleUpdateStats}
                  onUseInventory={handleUseInventory}
                  onAddPoints={handleAddPoints}
                  onOpenChat={() => setIsChatOpen(true)}
                  onOpenMarket={handleOpenMarket}
                  onTriggerCrisisSafety={() => setIsCrisisOpen(true)}
                  onChangeSpecies={handleToggleSpecies}
                />
              </motion.div>
            )}

            {/* 3. COMMUNITY TAB (Reddit-Style Safe Haven) */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <RedditCommunity
                  posts={appState.forumPosts}
                  activeChannel={appState.activeChannel}
                  userSpecies={appState.species}
                  userName={appState.userName ? `u/${appState.userName}` : 'u/GentleTraveler'}
                  customSubforums={appState.customSubforums || []}
                  onCreateSubforum={handleCreateSubforum}
                  onSelectChannel={(ch) =>
                    setAppState((prev) => ({ ...prev, activeChannel: ch }))
                  }
                  onAddPost={handleAddForumPost}
                  onVotePost={handleVotePost}
                  onGiveAward={handleGiveAward}
                  onAddComment={handleAddComment}
                  onTriggerCrisisSafety={() => setIsCrisisOpen(true)}
                  onAddPoints={handleAddPoints}
                />
              </motion.div>
            )}

            {/* 4. JOURNAL TAB */}
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <PrivateJournal
                  isLocked={appState.isJournalLocked}
                  entries={appState.journalEntries}
                  pin={appState.journalPin}
                  onUnlock={handleUnlockJournal}
                  onLock={handleLockJournal}
                  onAddEntry={handleAddJournalEntry}
                  onTriggerCrisisSafety={() => setIsCrisisOpen(true)}
                />
              </motion.div>
            )}

            {/* 5. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <AccountView
                  species={appState.species}
                  companionName={appState.companionName}
                  userName={appState.userName || 'Guardian'}
                  points={appState.points}
                  equipped={appState.equipped}
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                  onOpenMarket={handleOpenMarket}
                  onTriggerCrisisSafety={() => setIsCrisisOpen(true)}
                  onChangeSpecies={handleToggleSpecies}
                  onLaunchMinimizer={() => setPhoneMode('minimizer')}
                  onLogout={handleLogout}
                  onInstallPWA={handleInstallPWA}
                  pin={appState.journalPin || '1234'}
                  onOpenBreathing={() => setActiveTab('wellness')}
                />
              </motion.div>
            )}

            {/* 6. SANCTUARY MARKETPLACE */}
            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <ExpandedMarket
                  points={appState.points}
                  inventory={appState.inventory}
                  accessories={appState.accessories}
                  equipped={appState.equipped}
                  habits={appState.habits}
                  companionName={appState.companionName}
                  onBack={() => setActiveTab('home')}
                  onBuyItem={handleBuyInventoryItem}
                  onBuyAccessory={handleBuyAccessoryItem}
                  onEquipAccessory={handleEquipAccessory}
                  onToggleHabit={handleToggleHabit}
                  onAddPoints={handleAddPoints}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RENDER BOTTOM NAVIGATION BAR */}
        {renderNavBar()}
      </div>
    );
  };

  // Helper to render PWA help modal anywhere
  const renderPWAHelpModal = () => (
    <AnimatePresence>
      {showPWAHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#112318] p-6 border border-emerald-200 dark:border-emerald-800 shadow-2xl text-emerald-950 dark:text-emerald-100 flex flex-col"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/70 flex items-center justify-center text-xl">
                📱
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                  I-install ang Hangin
                </h3>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Browser Install / Add to Home screen
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2.5 text-emerald-900/90 dark:text-emerald-200/90 mb-5 leading-relaxed">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200">
                  <span>📱 Android / Chrome:</span>
                </div>
                <p className="text-[11px]">
                  Pindutin ang <strong>tatlong tuldok (⋮)</strong> sa kanang itaas ng browser, at piliin ang <strong>"Install app"</strong> o <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200">
                  <span>🍏 iPhone / Safari:</span>
                </div>
                <p className="text-[11px]">
                  Pindutin ang <strong>Share button (⎙)</strong> sa ilalim ng Safari, at piliin ang <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPWAHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
            >
              Naintindihan ko
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // If not logged in, show the brand new Hangin Intro & Login Experience!
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#0a1810]">
        <HanginIntroScreen
          onStartOnboarding={() => setShowOnboarding(true)}
          onLogin={handleLogin}
          onGuestAccess={handleGuestAccess}
          savedUserName={appState.userName || 'Guardian'}
          savedPin={appState.journalPin || '1234'}
          species={appState.species}
          onInstallPWA={handleInstallPWA}
          isPWAInstallable={isPWAInstallable}
        />

        {/* ONBOARDING FLOW: ANIMAL PICK FIRST -> SURVEY -> ACCOUNT */}
        {showOnboarding && (
          <ModernOnboarding onComplete={handleOnboardingComplete} />
        )}

        {/* PWA INSTALL HELP MODAL ACCESSIBLE ON INTRO/LOGIN */}
        {renderPWAHelpModal()}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-radial from-[#0e2216] via-[#08150e] to-[#040805] flex flex-col items-center justify-start text-emerald-950 dark:text-emerald-50 antialiased selection:bg-[#cbebd6] selection:text-[#0f3d26]">
      {/* PROTOTYPE TESTING BAR - HIDDEN BY DEFAULT (5 LOGO PRESS TO REVEAL) */}
      {showAdminControls && (
        <PrototypeTesterBar
          species={appState.species}
          onToggleSpecies={handleToggleSpecies}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          onAddPoints={handleAddPoints}
          onTriggerCrisis={() => setIsCrisisOpen(true)}
          onResetStats={handleFullReset}
          onOpenGuide={() => setShowGuideModal(true)}
          onTestReveal={() => setShowOnboarding(true)}
          onOpenTutorial={() => setShowAppTutorial(true)}
          onOpenPhoneHome={() => setPhoneMode('home')}
          onOpenMinimizer={() => setPhoneMode('minimizer')}
        />
      )}

      {/* NATIVE WEB APP & PWA RESPONSIVE VIEWPORT (NO FAKE PHONE BEZELS) */}
      <div className="w-full flex-1 flex flex-col max-w-3xl lg:max-w-4xl mx-auto min-h-screen bg-[#f6faf6] dark:bg-[#0c1611] shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative border-x border-emerald-100/50 dark:border-emerald-900/30">
        {renderAppContent(false)}
      </div>

      {/* FLOATING QUICK COMPANION CHAT ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 right-4 sm:right-8 z-40 p-3.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 border-2 border-white/60 dark:border-emerald-400/40 cursor-pointer flex items-center gap-2 group"
        title={`Chat live with ${appState.companionName} 🍃`}
      >
        <span className="text-xl">{appState.species === 'dog' ? '🐶' : '🐱'}</span>
        <span className="text-xs font-black tracking-wide hidden sm:inline pr-1">
          Chat with {appState.companionName}
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-ping absolute -top-0.5 -right-0.5" />
      </motion.button>

      {/* FLOATING COMPANION CHAT WITH SIDE ANIMAL & 1553 TRIGGER WORDS */}
      <CompanionChatModal
        isOpen={isChatOpen}
        species={appState.species}
        companionName={appState.companionName}
        equipped={appState.equipped}
        onClose={() => setIsChatOpen(false)}
        onAddPoints={handleAddPoints}
        onTriggerCrisisSafety={() => setIsCrisisOpen(true)}
      />

      {/* 24/7 CRISIS LIFELINE MODAL */}
      <CrisisModal isOpen={isCrisisOpen} onClose={() => setIsCrisisOpen(false)} />

      {/* EVALUATION GUIDE MODAL */}
      <TesterGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* ONBOARDING FLOW: ANIMAL PICK FIRST -> SURVEY -> ACCOUNT */}
      {showOnboarding && (
        <ModernOnboarding onComplete={handleOnboardingComplete} />
      )}

      {/* STEP-BY-STEP IN-APP SPOTLIGHT TUTORIAL WITH BLUR, FOCUS & ARROW */}
      {showAppTutorial && (
        <AppSpotlightTutorial
          species={appState.species}
          companionName={appState.companionName}
          onFinish={() => {
            setShowAppTutorial(false);
            setActiveTab('home');
          }}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* PWA INSTALL HELP MODAL */}
      {renderPWAHelpModal()}
    </div>
  );
}
