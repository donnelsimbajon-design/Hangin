export type PetSpecies = 'dog' | 'cat';

export type PetAnimationMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'calm'
  | 'peaceful'
  | 'sad'
  | 'tired'
  | 'overwhelmed'
  | 'eating'
  | 'bathing'
  | 'sleeping'
  | 'playing'
  | 'curious'
  | 'listening';

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';

export interface PetStats {
  health: number;       // 0-100
  happiness: number;    // 0-100
  hunger: number;       // 0-100 (100 = full)
  cleanliness: number;  // 0-100
  energy: number;       // 0-100
  isSick: boolean;
  isSleeping: boolean;
  isSoapy: boolean;
}

export interface AccessoryInventory {
  hatSalakot: boolean;
  hatBeanie: boolean;
  sunglasses: boolean;
  cozyScarf: boolean;
  collarBell: boolean;
}

export interface EquippedAccessories {
  hat: 'salakot' | 'beanie' | null;
  glasses: boolean;
  scarf: boolean;
  collar: boolean;
}

export interface Inventory {
  // Shared Essentials
  water: number;
  herbalTea: number;
  soap: number;
  brush: number;
  medicine: number;
  plushToy: number;

  // Dog-Appropriate Foods
  kibble: number;      // 🥩 Savory Beef & Veggie Kibble
  bone: number;        // 🦴 Puppy Chew Bone
  treat: number;       // 🍪 Bickie Biscuit Treat
  apple: number;       // 🍎 Dog-Safe Apple Slices

  // Cat-Appropriate Foods
  salmon: number;      // 🐟 Fresh Steamed Salmon
  catKibble: number;   // 🍣 Crunchy Tuna Cat Kibble
  catnip: number;      // 🌿 Catnip Herb Delight
  catMilk: number;     // 🥛 Lactose-Free Cat Milk

  // Legacy compatibility keys
  banana?: number;
  coconut?: number;
  riceBowl?: number;
}

export interface DailyHabit {
  id: string;
  title: string;
  icon: string;
  category: 'mind' | 'body' | 'screen' | 'rest';
  completed: boolean;
  rewardWP: number;
}

export interface MoodLog {
  id: string;
  mood: 'peaceful' | 'calm' | 'anxious' | 'tired' | 'overwhelmed' | 'sad' | 'happy';
  note?: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  mediaUrl?: string;
}

export interface ForumComment {
  id: string;
  author: string;
  authorName?: string;
  species?: PetSpecies;
  authorSpecies?: PetSpecies;
  text: string;
  timestamp: string | number;
  likes?: number;
  upvotes?: number;
  userVote?: 'up' | 'down' | null;
}

export interface ForumAward {
  id: string;
  icon: string;
  name: string;
  count?: number;
}

export interface ForumPost {
  id: string;
  author: string;
  authorName?: string;
  species: PetSpecies;
  authorSpecies?: PetSpecies;
  avatarFrame?: string;
  channel: string;
  title?: string;
  text: string;
  content?: string;
  likes?: number; // legacy alias
  score: number;  // Reddit net upvotes
  votes?: { up: number; down: number };
  userVote?: 'up' | 'down' | null;
  awards?: ForumAward[];
  validates?: number;
  vibes?: number;
  validated?: boolean;
  hasValidated?: boolean;
  hasSentVibes?: boolean;
  mediaUrl?: string;
  comments: ForumComment[];
  timestamp: string | number;
}

export interface Subforum {
  id: string;
  name: string;
  icon: string;
  desc: string;
  owner?: string;
  isCustom?: boolean;
}

export interface AppState {
  onboarded: boolean;
  companionName: string;
  userName?: string;
  species: PetSpecies;
  points: number; // Wellness Points (WP)
  stats: PetStats;
  mindfulGoals?: string[];
  dailyPace?: 'casual' | 'regular' | 'dedicated';
  equipped: EquippedAccessories;
  accessories: AccessoryInventory;
  inventory: Inventory;
  habits: DailyHabit[];
  moodLogs: MoodLog[];
  journalEntries: JournalEntry[];
  journalPin: string;
  isJournalLocked: boolean;
  forumPosts: ForumPost[];
  activeChannel: string;
  customSubforums?: Subforum[];
  streakDays: number;
  lastActiveDate: string;
  shieldActive: boolean;
  focusSessionMinutes: number;
}
