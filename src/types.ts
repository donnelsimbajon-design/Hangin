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
  | 'anxious'
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

/**
 * Headwear offered in the Market's "Clothing & Hats" tab. `salakot` and
 * `beanie` are the two original hats — they are kept (and simply repriced)
 * so sanctuaries that already own them keep their purchase.
 */
export type HatId =
  | 'salakot'
  | 'beanie'
  | 'cap'
  | 'bucketHat'
  | 'flowerCrown'
  | 'adventureHat';

/** Outfits offered in the Market's "Clothing & Hats" tab. */
export type ClothingId =
  | 'hoodie'
  | 'sweater'
  | 'raincoat'
  | 'pajamas'
  | 'explorerJacket'
  | 'summerShirt';

export interface AccessoryInventory {
  hatSalakot: boolean;
  hatBeanie: boolean;
  sunglasses: boolean;
  cozyScarf: boolean;
  collarBell: boolean;

  // ---- Clothing & Hats wardrobe ----
  // Optional on purpose: `AppState` is persisted per browser, and sanctuaries
  // saved before this wardrobe existed have no keys for it. A missing key
  // simply reads as "not owned", so no state migration is needed.
  hatCap?: boolean;
  hatBucketHat?: boolean;
  hatFlowerCrown?: boolean;
  hatAdventureHat?: boolean;

  clothingHoodie?: boolean;
  clothingSweater?: boolean;
  clothingRaincoat?: boolean;
  clothingPajamas?: boolean;
  clothingExplorerJacket?: boolean;
  clothingSummerShirt?: boolean;
}

export interface EquippedAccessories {
  /** Only one hat at a time — equipping another replaces this. */
  hat: HatId | null;
  /** Only one outfit at a time — equipping another replaces this. */
  clothing: ClothingId | null;
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
  /**
   * The author's companion as they were wearing it when they wrote this. Same
   * `EquippedAccessories` the sanctuary stores for the living companion, so a
   * commenter is drawn from the existing companion appearance and the community
   * needs no avatar model of its own. Optional: seeds and older saved state may
   * predate it, and a missing value simply renders the bare companion.
   */
  equipped?: EquippedAccessories;
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
  /**
   * The author's companion as they were wearing it when they posted. The same
   * `EquippedAccessories` the sanctuary stores for the living companion, so a
   * post header can show the author's own companion without a parallel avatar
   * model. Optional: seeds and older saved state may predate it, and a missing
   * value simply renders the bare companion.
   */
  equipped?: EquippedAccessories;
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
  newcomerClaimedDay?: number;
}
