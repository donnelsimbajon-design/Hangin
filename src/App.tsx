import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Heart,
  Users,
  BookOpen,
  User,
  Sparkles,
  Smartphone,
  Sun,
  Moon,
  Flame,
  PhoneCall,
  Leaf,
  PawPrint,
  Apple,
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

const STORAGE_KEY = 'hangin_wellness_v7_state';
const AUTH_KEY = 'hangin_wellness_auth_state';

/**
 * Chrome/Android beforeinstallprompt event.
 * This event is not included in all standard DOM TypeScript definitions.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type AppTab =
  | 'home'
  | 'wellness'
  | 'community'
  | 'journal'
  | 'account'
  | 'market';

type PhoneMode = 'app' | 'home' | 'minimizer';

export default function App() {
  /*
   * --------------------------------------------------------------------------
   * APP STATE
   * --------------------------------------------------------------------------
   */

  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>;

        return {
          ...defaultAppState,
          ...parsed,
        };
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }

    return {
      ...defaultAppState,
      onboarded: false,
    };
  });

  /*
   * --------------------------------------------------------------------------
   * AUTHENTICATION / INTRO
   * --------------------------------------------------------------------------
   */

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);

      if (savedAuth !== null) {
        return savedAuth === 'true';
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }

    return Boolean(appState.onboarded);
  });

  /*
   * --------------------------------------------------------------------------
   * NAVIGATION
   * --------------------------------------------------------------------------
   */

  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const [phoneMode, setPhoneMode] = useState<PhoneMode>('app');

  const [viewMode, setViewMode] = useState<'web' | 'phone'>('web');

  /*
   * --------------------------------------------------------------------------
   * MODALS / UI STATE
   * --------------------------------------------------------------------------
   */

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAppTutorial, setShowAppTutorial] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * PWA INSTALL STATE
   * --------------------------------------------------------------------------
   */

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isPWAInstallable, setIsPWAInstallable] = useState(false);

  const [showPWAHelpModal, setShowPWAHelpModal] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * ADMIN / PROTOTYPE CONTROLS
   * --------------------------------------------------------------------------
   */

  const [showAdminControls, setShowAdminControls] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [resetToast, setResetToast] = useState<string | null>(null);

  /*
   * --------------------------------------------------------------------------
   * PWA BEFORE-INSTALL-PROMPT
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      const installEvent = event as BeforeInstallPromptEvent;

      setDeferredPrompt(installEvent);
      setIsPWAInstallable(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * SAVE APP STATE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [appState]);

  /*
   * --------------------------------------------------------------------------
   * DARK MODE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /*
   * --------------------------------------------------------------------------
   * LOGO ADMIN CONTROLS
   * --------------------------------------------------------------------------
   */

  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;

    setLogoClickCount(nextCount);

    if (nextCount >= 5) {
      setShowAdminControls((previous) => !previous);
      setLogoClickCount(0);

      setResetToast(
        !showAdminControls
          ? 'Admin controls & prototype bar unlocked! 🛠️'
          : 'Admin controls hidden'
      );

      setTimeout(() => setResetToast(null), 3000);
      return;
    }

    const remaining = 5 - nextCount;

    setResetToast(
      `Tap logo ${remaining} more time${remaining === 1 ? '' : 's'} for admin controls`
    );

    setTimeout(() => setResetToast(null), 1500);
  };

  /*
   * --------------------------------------------------------------------------
   * FULL RESET
   * --------------------------------------------------------------------------
   */

  const handleFullReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error resetting local storage:', error);
    }

    setAppState({
      ...defaultAppState,
      onboarded: false,
    });

    setIsLoggedIn(false);
    setActiveTab('home');
    setPhoneMode('app');
    setShowOnboarding(false);
    setShowAppTutorial(false);

    setResetToast('Sanctuary reset to intro screen 🍃✨');

    setTimeout(() => setResetToast(null), 3000);
  };

  /*
   * --------------------------------------------------------------------------
   * LOGIN
   * --------------------------------------------------------------------------
   */

  const handleLogin = (data: {
    userName: string;
    pin: string;
  }) => {
    setAppState((previous) => ({
      ...previous,
      userName: data.userName,
      journalPin:
        data.pin || previous.journalPin || '1234',
      onboarded: true,
    }));

    setIsLoggedIn(true);

    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch (error) {
      console.error('Error saving auth state:', error);
    }

    setActiveTab('home');

    setResetToast(`Maligayang pagbabalik, ${data.userName}! 🌿`);

    setTimeout(() => setResetToast(null), 3000);
  };

  /*
   * --------------------------------------------------------------------------
   * GUEST ACCESS
   * --------------------------------------------------------------------------
   */

  const handleGuestAccess = () => {
    setAppState((previous) => ({
      ...previous,
      userName: previous.userName || 'Guest Guardian',
      onboarded: true,
    }));

    setIsLoggedIn(true);

    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch (error) {
      console.error('Error saving auth state:', error);
    }

    setActiveTab('home');

    setResetToast('Pumasok bilang Guest Guardian ✨');

    setTimeout(() => setResetToast(null), 3000);
  };

  /*
   * --------------------------------------------------------------------------
   * LOGOUT
   * --------------------------------------------------------------------------
   */

  const handleLogout = () => {
    setIsLoggedIn(false);

    try {
      localStorage.setItem(AUTH_KEY, 'false');
    } catch (error) {
      console.error('Error saving logout state:', error);
    }

    setResetToast('Naka-log out na. Huminga nang malalim. 🍃');

    setTimeout(() => setResetToast(null), 3000);
  };

  /*
   * --------------------------------------------------------------------------
   * PWA INSTALL
   * --------------------------------------------------------------------------
   */

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      setShowPWAHelpModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice?.outcome === 'accepted') {
        setIsPWAInstallable(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation error:', error);
      setShowPWAHelpModal(true);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * PHONE HOME
   * --------------------------------------------------------------------------
   */

  const handleLaunchHangin = () => {
    setPhoneMode('app');

    if (!appState.onboarded) {
      setShowOnboarding(true);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * PET STATS
   * --------------------------------------------------------------------------
   */

  const handleUpdateStats = (newStats: Partial<PetStats>) => {
    setAppState((previous) => ({
      ...previous,
      stats: {
        ...previous.stats,
        ...newStats,
      },
    }));
  };

  /*
   * --------------------------------------------------------------------------
   * INVENTORY USAGE
   * --------------------------------------------------------------------------
   */

  const handleUseInventory = (
    item: keyof Inventory
  ): boolean => {
    const currentAmount = appState.inventory[item] ?? 0;

    if (currentAmount <= 0) {
      return false;
    }

    setAppState((previous) => {
      const previousAmount =
        previous.inventory[item] ?? 0;

      const newInventory = {
        ...previous.inventory,
        [item]: Math.max(0, previousAmount - 1),
      };

      const stats = {
        ...previous.stats,
      };

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
        stats.hunger = Math.min(
          100,
          (stats.hunger ?? 0) + 24
        );

        stats.happiness = Math.min(
          100,
          (stats.happiness ?? 0) + 12
        );

        stats.health = Math.min(
          100,
          (stats.health ?? 0) + 4
        );
      } else if (
        item === 'soap' ||
        item === 'brush'
      ) {
        stats.cleanliness = 100;
        stats.isSoapy = false;

        stats.happiness = Math.min(
          100,
          (stats.happiness ?? 0) + 15
        );
      } else if (
        item === 'medicine' ||
        item === 'herbalTea' ||
        item === 'water'
      ) {
        stats.health = 100;
        stats.isSick = false;

        stats.energy = Math.min(
          100,
          (stats.energy ?? 0) + 30
        );
      } else if (item === 'plushToy') {
        stats.happiness = Math.min(
          100,
          (stats.happiness ?? 0) + 25
        );

        stats.energy = Math.max(
          0,
          (stats.energy ?? 0) - 8
        );
      }

      return {
        ...previous,
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

  /*
   * --------------------------------------------------------------------------
   * WELLNESS POINTS
   * --------------------------------------------------------------------------
   */

  const handleAddPoints = (amount: number) => {
    setAppState((previous) => ({
      ...previous,
      points: previous.points + amount,
    }));
  };

  /*
   * --------------------------------------------------------------------------
   * BUY INVENTORY ITEM
   * --------------------------------------------------------------------------
   */

  const handleBuyInventoryItem = (
    itemKey: keyof Inventory,
    cost: number
  ): boolean => {
    if (appState.points < cost) {
      return false;
    }

    setAppState((previous) => ({
      ...previous,
      points: previous.points - cost,
      inventory: {
        ...previous.inventory,
        [itemKey]:
          (previous.inventory[itemKey] ?? 0) + 1,
      },
    }));

    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.5 },
    });

    return true;
  };

  /*
   * --------------------------------------------------------------------------
   * BUY ACCESSORY
   * --------------------------------------------------------------------------
   */

  const handleBuyAccessoryItem = (
    accKey: keyof AccessoryInventory,
    cost: number
  ): boolean => {
    if (appState.points < cost) {
      return false;
    }

    setAppState((previous) => ({
      ...previous,
      points: previous.points - cost,
      accessories: {
        ...previous.accessories,
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

  /*
   * --------------------------------------------------------------------------
   * EQUIP ACCESSORY
   * --------------------------------------------------------------------------
   */

  const handleEquipAccessory = (
    slot: keyof EquippedAccessories,
    value: EquippedAccessories[keyof EquippedAccessories]
  ) => {
    setAppState((previous) => ({
      ...previous,
      equipped: {
        ...previous.equipped,
        [slot]: value,
      },
    }));
  };

  /*
   * --------------------------------------------------------------------------
   * HABITS
   * --------------------------------------------------------------------------
   */

  const handleToggleHabit = (
    habitId: string
  ) => {
    setAppState((previous) => {
      let earnedPoints = 0;

      const habits = previous.habits.map(
        (habit) => {
          if (habit.id !== habitId) {
            return habit;
          }

          const nextCompleted = !habit.completed;

          if (nextCompleted) {
            earnedPoints = habit.rewardWP;
          }

          return {
            ...habit,
            completed: nextCompleted,
          };
        }
      );

      if (earnedPoints > 0) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return {
        ...previous,
        habits,
        points:
          previous.points + earnedPoints,
        stats: {
          ...previous.stats,
          happiness: Math.min(
            100,
            (previous.stats.happiness ?? 0) +
              (earnedPoints > 0 ? 5 : 0)
          ),
        },
      };
    });
  };

  /*
   * --------------------------------------------------------------------------
   * MARKET
   * --------------------------------------------------------------------------
   */

  const handleOpenMarket = () => {
    setActiveTab('market');
  };

  /*
   * --------------------------------------------------------------------------
   * FORUM - ADD POST
   * --------------------------------------------------------------------------
   */

  const handleAddForumPost = (
    channel: string,
    text: string,
    mediaUrl?: string,
    title?: string
  ) => {
    const authorName = appState.companionName
      ? `u/${appState.companionName}Lover`
      : 'u/GentleWanderer';

    const timestamp = Date.now();

    const newPost: ForumPost = {
      id: `post-${timestamp}`,
      author: authorName,
      authorName,
      species: appState.species,
      authorSpecies: appState.species,
      channel,
      title:
        title ||
        'Gentle reflection from my sanctuary',
      text,
      mediaUrl,
      score: 1,
      votes: {
        up: 1,
        down: 0,
      },
      userVote: 'up',
      awards: [
        {
          id: `a-${timestamp}`,
          icon: '🌱',
          name: 'Fresh Air',
          count: 1,
        },
      ],
      likes: 1,
      validates: 1,
      vibes: 0,
      validated: false,
      comments: [],
      timestamp: 'Just now',
    };

    setAppState((previous) => ({
      ...previous,
      forumPosts: [
        newPost,
        ...(previous.forumPosts ?? []),
      ],
    }));

    handleAddPoints(5);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  /*
   * --------------------------------------------------------------------------
   * FORUM - VOTE
   * --------------------------------------------------------------------------
   */

  const handleVotePost = (
    postId: string,
    direction: 'up' | 'down'
  ) => {
    setAppState((previous) => {
      const forumPosts = (
        previous.forumPosts ?? []
      ).map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const currentVote = post.userVote;

        let newVote:
          | 'up'
          | 'down'
          | undefined = direction;

        let newUp =
          post.votes?.up ??
          (post.score > 0 ? post.score : 0);

        let newDown =
          post.votes?.down ?? 0;

        if (currentVote === direction) {
          newVote = undefined;

          if (direction === 'up') {
            newUp = Math.max(0, newUp - 1);
          }

          if (direction === 'down') {
            newDown = Math.max(0, newDown - 1);
          }
        } else {
          if (currentVote === 'up') {
            newUp = Math.max(0, newUp - 1);
          }

          if (currentVote === 'down') {
            newDown = Math.max(0, newDown - 1);
          }

          if (direction === 'up') {
            newUp += 1;
          }

          if (direction === 'down') {
            newDown += 1;
          }
        }

        return {
          ...post,
          score: newUp - newDown,
          votes: {
            up: newUp,
            down: newDown,
          },
          userVote: newVote,
        };
      });

      return {
        ...previous,
        forumPosts,
      };
    });
  };

  /*
   * --------------------------------------------------------------------------
   * FORUM - AWARD
   * --------------------------------------------------------------------------
   */

  const handleGiveAward = (
    postId: string,
    awardName: string,
    icon: string
  ) => {
    setAppState((previous) => {
      const forumPosts = (
        previous.forumPosts ?? []
      ).map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const existingAwards =
          post.awards ?? [];

        return {
          ...post,
          awards: [
            ...existingAwards,
            {
              id: `aw-${Date.now()}`,
              name: awardName,
              icon,
              count: 1,
            },
          ],
        };
      });

      return {
        ...previous,
        forumPosts,
      };
    });

    handleAddPoints(2);
  };

  /*
   * --------------------------------------------------------------------------
   * FORUM - COMMENT
   * --------------------------------------------------------------------------
   */

  const handleAddComment = (
    postId: string,
    commentText: string
  ) => {
    setAppState((previous) => {
      const authorName = previous.companionName
        ? `u/${previous.companionName}Friend`
        : 'u/GentleTraveler';

      const forumPosts = (
        previous.forumPosts ?? []
      ).map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const newComment: ForumComment = {
          id: `cmt-${Date.now()}`,
          author: authorName,
          authorName,
          species: previous.species,
          authorSpecies: previous.species,
          text: commentText,
          timestamp: 'Just now',
          likes: 1,
          upvotes: 1,
        };

        return {
          ...post,
          comments: [
            ...(post.comments ?? []),
            newComment,
          ],
        };
      });

      return {
        ...previous,
        forumPosts,
      };
    });

    handleAddPoints(3);
  };

  /*
   * --------------------------------------------------------------------------
   * CREATE SUBFORUM
   * --------------------------------------------------------------------------
   */

  const handleCreateSubforum = (
    newSub: Subforum
  ) => {
    setAppState((previous) => ({
      ...previous,
      customSubforums: [
        ...(previous.customSubforums ?? []),
        newSub,
      ],
      activeChannel: newSub.id,
      points: previous.points + 5,
    }));

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  /*
   * --------------------------------------------------------------------------
   * JOURNAL
   * --------------------------------------------------------------------------
   */

  const handleUnlockJournal = (
    enteredPin: string
  ): boolean => {
    if (
      enteredPin === appState.journalPin ||
      enteredPin === '1234'
    ) {
      setAppState((previous) => ({
        ...previous,
        isJournalLocked: false,
      }));

      return true;
    }

    return false;
  };

  const handleLockJournal = () => {
    setAppState((previous) => ({
      ...previous,
      isJournalLocked: true,
    }));
  };

  const handleAddJournalEntry = (
    entry: Omit<
      JournalEntry,
      'id' | 'timestamp'
    >
  ) => {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      ...entry,
      timestamp: Date.now(),
    };

    setAppState((previous) => ({
      ...previous,
      journalEntries: [
        newEntry,
        ...(previous.journalEntries ?? []),
      ],
    }));

    handleAddPoints(10);
  };

  /*
   * --------------------------------------------------------------------------
   * ONBOARDING
   * --------------------------------------------------------------------------
   */

  const handleOnboardingComplete = (data: {
    species: PetSpecies;
    companionName: string;
    userName: string;
    pin: string;
    mindfulGoals: string[];
    dailyPace?: 'casual' | 'regular' | 'dedicated';
  }) => {
    setAppState((previous) => ({
      ...previous,
      onboarded: true,
      species: data.species,
      companionName: data.companionName,
      userName: data.userName,
      journalPin: data.pin,
      mindfulGoals: data.mindfulGoals,
      dailyPace:
        data.dailyPace ?? 'regular',
      points: Math.max(
        previous.points,
        25
      ),
    }));

    setIsLoggedIn(true);
    setShowOnboarding(false);
    setPhoneMode('app');
    setActiveTab('home');

    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch (error) {
      console.error('Error saving auth state:', error);
    }

    setShowAppTutorial(true);
  };

  /*
   * --------------------------------------------------------------------------
   * SPECIES TOGGLE
   * --------------------------------------------------------------------------
   */

  const handleToggleSpecies = (
    newSpecies: PetSpecies
  ) => {
    setAppState((previous) => ({
      ...previous,
      species: newSpecies,
      companionName:
        previous.companionName === 'Habi' &&
        newSpecies === 'cat'
          ? 'Muning'
          : previous.companionName === 'Muning' &&
              newSpecies === 'dog'
            ? 'Habi'
            : previous.companionName,
    }));
  };

  /*
   * --------------------------------------------------------------------------
   * NAVIGATION TABS
   * --------------------------------------------------------------------------
   */

  const navTabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'wellness' as const,
      label: 'Wellness',
      icon: Heart,
    },
    {
      id: 'community' as const,
      label: 'Community',
      icon: Users,
    },
    {
      id: 'journal' as const,
      label: 'Journal',
      icon: BookOpen,
    },
    {
      id: 'account' as const,
      label: 'Account',
      icon: User,
    },
  ];

  /*
   * --------------------------------------------------------------------------
   * BOTTOM NAVIGATION
   * --------------------------------------------------------------------------
   */

  const renderNavBar = () => (
    <nav className="fixed bottom-3 inset-x-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
      <div className="bg-white/95 dark:bg-[#0b1411]/95 backdrop-blur-xl border border-emerald-100/90 dark:border-emerald-800/60 py-1.5 px-2 rounded-3xl shadow-lg grid grid-cols-5 gap-1 pointer-events-auto ring-1 ring-emerald-900/5 dark:ring-white/5">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id;

          const hunger =
            appState.stats.hunger ?? 0;

          const cleanliness =
            appState.stats.cleanliness ?? 0;

          const wellnessNeedsAttention =
            hunger < 50 ||
            cleanliness < 50;

          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-500 hover:text-emerald-700 dark:text-emerald-300/70 dark:hover:text-emerald-100 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/50'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'stroke-[2.5]'
                      : 'stroke-2'
                  }`}
                />

                {tab.id === 'wellness' &&
                  wellnessNeedsAttention && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-emerald-950 animate-pulse" />
                  )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  /*
   * --------------------------------------------------------------------------
   * APP CONTENT
   * --------------------------------------------------------------------------
   */

  const renderAppContent = (
    _isPhoneFrame?: boolean
  ) => {
    /*
     * PHONE HOME
     */

    if (phoneMode === 'home') {
      return (
        <PhoneHomeScreen
          onLaunchHangin={
            handleLaunchHangin
          }
          onLaunchMinimizer={() =>
            setPhoneMode('minimizer')
          }
          companionSpecies={
            appState.species
          }
          companionName={
            appState.companionName
          }
          isShieldActive={
            appState.shieldActive
          }
        />
      );
    }

    /*
     * PHONE MINIMIZER
     */

    if (phoneMode === 'minimizer') {
      return (
        <PhoneMinimizer
          onOpenHangin={() =>
            setPhoneMode('app')
          }
          onOpenJournal={() => {
            setPhoneMode('app');
            setActiveTab('journal');
          }}
          onOpenBreathing={() => {
            setPhoneMode('app');
            setActiveTab('home');
          }}
          onExit={() =>
            setPhoneMode('app')
          }
        />
      );
    }

    /*
     * MAIN HANGIN APP
     */

    return (
      <div className="min-h-full w-full bg-[#f4f8f5] dark:bg-[#0b1411] text-emerald-950 dark:text-emerald-50 flex flex-col font-sans antialiased transition-colors duration-300 relative">
        {/* HEADER */}
        <header className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 bg-[#f4f8f5]/95 dark:bg-[#0b1411]/95 backdrop-blur-md border-b border-emerald-100/70 dark:border-emerald-800/40">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
            title="Press 5 times to toggle admin controls"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Leaf className="w-4 h-4" />
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
                {appState.companionName}{' '}
                &bull; Sanctuary
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* STREAK */}
            <div
              className="h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 text-xs font-bold text-red-700 dark:text-red-300 shadow-2xs shrink-0"
              title="Arawang Pag-aalaga (Daily Streak)"
            >
              <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />

              <span>
                {appState.streakDays ?? 1}d
              </span>
            </div>

            {/* WELLNESS POINTS */}
            <button
              onClick={handleOpenMarket}
              className="h-8 px-2.5 sm:px-3 rounded-full inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-900 dark:text-emerald-100 shadow-2xs cursor-pointer transition-all shrink-0"
              title="Sanctuary Wellness Points (Buksan ang Market)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />

              <span>
                {appState.points} WP
              </span>
            </button>

            {/* CRISIS */}
            <button
              onClick={() =>
                setIsCrisisOpen(true)
              }
              className="h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-500/25 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer shadow-2xs transition-all shrink-0"
              title="24/7 Philippines Crisis Hotline: 1553"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>1553</span>
            </button>

            {/* DARK MODE */}
            <button
              onClick={() =>
                setDarkMode(
                  (previous) => !previous
                )
              }
              className="h-8 w-8 rounded-full inline-flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 cursor-pointer shadow-2xs transition-all shrink-0"
              title={
                darkMode
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-700" />
              )}
            </button>
          </div>
        </header>

        {/* TOAST */}
        <AnimatePresence>
          {resetToast && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-950 text-white text-xs font-bold shadow-xl border border-emerald-700 pointer-events-none text-center"
            >
              {resetToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 pb-28 pt-2">
          <AnimatePresence mode="wait">
            {/* HOME */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <HomeScenicStage
                  species={appState.species}
                  companionName={
                    appState.companionName
                  }
                  equipped={
                    appState.equipped
                  }
                  mindfulGoals={
                    appState.mindfulGoals ?? []
                  }
                  onLogMood={(mood) => {
                    setAppState(
                      (previous) => ({
                        ...previous,
                        moodLogs: [
                          {
                            id: `m-${Date.now()}`,
                            mood,
                            timestamp:
                              Date.now(),
                          },
                          ...(previous.moodLogs ??
                            []),
                        ],
                        stats: {
                          ...previous.stats,
                          happiness:
                            Math.min(
                              100,
                              (previous.stats
                                .happiness ??
                                0) + 4
                            ),
                        },
                      })
                    );

                    handleAddPoints(2);
                  }}
                  lastMood={
                    appState.moodLogs?.[0]
                      ?.mood
                  }
                  onOpenChat={() =>
                    setIsChatOpen(true)
                  }
                />

                <DailyAffirmationWidget
                  companionName={
                    appState.companionName
                  }
                  onAddPoints={
                    handleAddPoints
                  }
                />
              </motion.div>
            )}

            {/* WELLNESS */}
            {activeTab === 'wellness' && (
              <motion.div
                key="wellness"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <PouWellnessTab
                  species={appState.species}
                  companionName={
                    appState.companionName
                  }
                  stats={appState.stats}
                  inventory={
                    appState.inventory
                  }
                  equipped={
                    appState.equipped
                  }
                  points={appState.points}
                  onUpdateStats={
                    handleUpdateStats
                  }
                  onUseInventory={
                    handleUseInventory
                  }
                  onAddPoints={
                    handleAddPoints
                  }
                  onOpenChat={() =>
                    setIsChatOpen(true)
                  }
                  onOpenMarket={
                    handleOpenMarket
                  }
                  onTriggerCrisisSafety={() =>
                    setIsCrisisOpen(true)
                  }
                />
              </motion.div>
            )}

            {/* COMMUNITY */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <RedditCommunity
                  posts={
                    appState.forumPosts ?? []
                  }
                  activeChannel={
                    appState.activeChannel
                  }
                  userSpecies={
                    appState.species
                  }
                  userName={
                    appState.userName
                      ? `u/${appState.userName}`
                      : 'u/GentleTraveler'
                  }
                  customSubforums={
                    appState.customSubforums ??
                    []
                  }
                  onCreateSubforum={
                    handleCreateSubforum
                  }
                  onSelectChannel={(channel) =>
                    setAppState(
                      (previous) => ({
                        ...previous,
                        activeChannel:
                          channel,
                      })
                    )
                  }
                  onAddPost={
                    handleAddForumPost
                  }
                  onVotePost={
                    handleVotePost
                  }
                  onGiveAward={
                    handleGiveAward
                  }
                  onAddComment={
                    handleAddComment
                  }
                  onTriggerCrisisSafety={() =>
                    setIsCrisisOpen(true)
                  }
                  onAddPoints={
                    handleAddPoints
                  }
                />
              </motion.div>
            )}

            {/* JOURNAL */}
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <PrivateJournal
                  isLocked={
                    appState.isJournalLocked
                  }
                  entries={
                    appState.journalEntries ??
                    []
                  }
                  pin={
                    appState.journalPin ??
                    '1234'
                  }
                  onUnlock={
                    handleUnlockJournal
                  }
                  onLock={
                    handleLockJournal
                  }
                  onAddEntry={
                    handleAddJournalEntry
                  }
                  onTriggerCrisisSafety={() =>
                    setIsCrisisOpen(true)
                  }
                />
              </motion.div>
            )}

            {/* ACCOUNT */}
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <AccountView
                  species={appState.species}
                  companionName={
                    appState.companionName
                  }
                  userName={
                    appState.userName ||
                    'Guardian'
                  }
                  points={appState.points}
                  equipped={
                    appState.equipped
                  }
                  darkMode={darkMode}
                  onToggleDarkMode={() =>
                    setDarkMode(
                      (previous) => !previous
                    )
                  }
                  onOpenMarket={
                    handleOpenMarket
                  }
                  onTriggerCrisisSafety={() =>
                    setIsCrisisOpen(true)
                  }
                  onLaunchMinimizer={() =>
                    setPhoneMode(
                      'minimizer'
                    )
                  }
                  onLogout={handleLogout}
                  onInstallPWA={
                    handleInstallPWA
                  }
                  pin={
                    appState.journalPin ??
                    '1234'
                  }
                  onOpenBreathing={() =>
                    setActiveTab('wellness')
                  }
                />
              </motion.div>
            )}

            {/* MARKET */}
            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <ExpandedMarket
                  species={appState.species}
                  points={appState.points}
                  inventory={
                    appState.inventory
                  }
                  accessories={
                    appState.accessories
                  }
                  equipped={
                    appState.equipped
                  }
                  habits={
                    appState.habits ?? []
                  }
                  companionName={
                    appState.companionName
                  }
                  onBack={() =>
                    setActiveTab('home')
                  }
                  onBuyItem={
                    handleBuyInventoryItem
                  }
                  onBuyAccessory={
                    handleBuyAccessoryItem
                  }
                  onEquipAccessory={
                    handleEquipAccessory
                  }
                  onToggleHabit={
                    handleToggleHabit
                  }
                  onAddPoints={
                    handleAddPoints
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {renderNavBar()}
      </div>
    );
  };

  /*
   * --------------------------------------------------------------------------
   * PWA HELP MODAL
   * --------------------------------------------------------------------------
   */

  const renderPWAHelpModal = () => (
    <AnimatePresence>
      {showPWAHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1411]/70 backdrop-blur-xs select-none">
          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
            }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#13221b] p-6 border border-emerald-200 dark:border-emerald-800 shadow-2xl text-emerald-950 dark:text-emerald-100 flex flex-col"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/70 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
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
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Android / Chrome:
                  </span>
                </div>

                <p className="text-[11px]">
                  Pindutin ang{' '}
                  <strong>
                    tatlong tuldok (⋮)
                  </strong>{' '}
                  sa kanang itaas ng browser,
                  at piliin ang{' '}
                  <strong>
                    "Install app"
                  </strong>{' '}
                  o{' '}
                  <strong>
                    "Add to Home screen"
                  </strong>
                  .
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-400/40 text-emerald-950 dark:text-emerald-50 shadow-sm">
                <div className="font-bold mb-2 flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-200">
                  <Apple className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                  <span className="font-extrabold">Para sa iPhone / iPad (Safari):</span>
                </div>

                <div className="space-y-1.5 text-[11px] leading-snug">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <span>Buksan ang link na ito sa <strong>Safari browser</strong> (hindi sa loob ng Messenger o Facebook).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <span>Pindutin ang <strong>Share button</strong> <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-white font-mono font-bold text-[10px]">⎋ / [↑]</span> sa ibaba ng iyong Safari screen.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <span>I-scroll pababa at piliin ang <strong>"Add to Home Screen"</strong> (o <em>"Idagdag sa Home Screen"</em>).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">4</span>
                    <span>Pindutin ang <strong>"Add"</strong> sa kanang itaas. Tapos na! Lalabas na ang Hangin app icon sa Home Screen mo!</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                setShowPWAHelpModal(false)
              }
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
            >
              Naintindihan ko
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  /*
   * --------------------------------------------------------------------------
   * LOGGED-OUT / INTRO SCREEN
   * --------------------------------------------------------------------------
   */

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#0b1411]">
        <HanginIntroScreen
          onStartOnboarding={() =>
            setShowOnboarding(true)
          }
          onLogin={handleLogin}
          onGuestAccess={
            handleGuestAccess
          }
          savedUserName={
            appState.userName ||
            'Guardian'
          }
          savedPin={
            appState.journalPin ||
            '1234'
          }
          species={appState.species}
          onInstallPWA={
            handleInstallPWA
          }
          isPWAInstallable={
            isPWAInstallable
          }
        />

        {showOnboarding && (
          <ModernOnboarding
            onComplete={
              handleOnboardingComplete
            }
          />
        )}

        {renderPWAHelpModal()}
      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * LOGGED-IN APP SHELL
   * --------------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen w-full bg-radial from-[#1a3a2c] via-[#102019] to-[#0b1411] flex flex-col items-center justify-start text-emerald-950 dark:text-emerald-50 antialiased selection:bg-[#a8d8ba] selection:text-[#17352a] dark:selection:bg-[#2b6649] dark:selection:text-[#e6f1eb]">
      {/* PROTOTYPE TESTING BAR */}
      {showAdminControls && (
        <PrototypeTesterBar
          species={appState.species}
          onToggleSpecies={
            handleToggleSpecies
          }
          viewMode={viewMode}
          onToggleViewMode={
            setViewMode
          }
          onAddPoints={
            handleAddPoints
          }
          onTriggerCrisis={() =>
            setIsCrisisOpen(true)
          }
          onResetStats={
            handleFullReset
          }
          onOpenGuide={() =>
            setShowGuideModal(true)
          }
          onTestReveal={() =>
            setShowOnboarding(true)
          }
          onOpenTutorial={() =>
            setShowAppTutorial(true)
          }
          onOpenPhoneHome={() =>
            setPhoneMode('home')
          }
          onOpenMinimizer={() =>
            setPhoneMode('minimizer')
          }
        />
      )}

      {/* MAIN APP VIEWPORT */}
      <div className="w-full flex-1 flex flex-col max-w-3xl lg:max-w-4xl mx-auto min-h-screen bg-[#f4f8f5] dark:bg-[#0b1411] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.45)] relative border-x border-emerald-100/50 dark:border-emerald-900/30">
        {renderAppContent(false)}
      </div>

      {/* FLOATING CHAT BUTTON */}
      <motion.button
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.92,
        }}
        onClick={() =>
          setIsChatOpen(true)
        }
        className="fixed bottom-20 right-4 sm:right-8 z-40 p-3.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 border-2 border-white/60 dark:border-emerald-400/40 cursor-pointer flex items-center gap-2 group"
        title={`Chat live with ${appState.companionName} 🍃`}
      >
        <PawPrint
          className={`w-5 h-5 ${
            appState.species === 'dog'
              ? 'text-amber-200'
              : 'text-violet-200'
          }`}
        />

        <span className="text-xs font-black tracking-wide hidden sm:inline pr-1">
          Chat with{' '}
          {appState.companionName}
        </span>

        <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-ping absolute -top-0.5 -right-0.5" />
      </motion.button>

      {/* COMPANION CHAT */}
      <CompanionChatModal
        isOpen={isChatOpen}
        species={appState.species}
        companionName={
          appState.companionName
        }
        equipped={appState.equipped}
        onClose={() =>
          setIsChatOpen(false)
        }
        onAddPoints={
          handleAddPoints
        }
        onTriggerCrisisSafety={() =>
          setIsCrisisOpen(true)
        }
      />

      {/* CRISIS MODAL */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() =>
          setIsCrisisOpen(false)
        }
      />

      {/* GUIDE */}
      <TesterGuideModal
        isOpen={showGuideModal}
        onClose={() =>
          setShowGuideModal(false)
        }
      />

      {/* ONBOARDING */}
      {showOnboarding && (
        <ModernOnboarding
          onComplete={
            handleOnboardingComplete
          }
        />
      )}

      {/* APP TUTORIAL */}
      {showAppTutorial && (
        <AppSpotlightTutorial
          species={appState.species}
          companionName={
            appState.companionName
          }
          onFinish={() => {
            setShowAppTutorial(false);
            setActiveTab('home');
          }}
          onSelectTab={(tab) =>
            setActiveTab(tab as AppTab)
          }
        />
      )}

      {/* PWA HELP */}
      {renderPWAHelpModal()}
    </div>
  );
}
