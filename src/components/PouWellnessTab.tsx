import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  Bath,
  Moon,
  Sun,
  Trees,
  ShoppingBag,
  Sparkles,
  Heart,
  Pill,
  ShowerHead,
  Droplets,
  Wind,
  Smile,
  RefreshCw,
  Repeat,
  MessageSquare,
  Zap,
  Gamepad2,
  Send,
  X,
  Package,
  PackageOpen,
  Refrigerator,
  Brush,
  CloudRain,
  BriefcaseMedical,
  HeartPulse,
  Fan,
  Apple,
  Bandage,
  Beef,
  Bed,
  Bone,
  Cat,
  Cookie,
  Dog,
  Droplet,
  Fish,
  FlaskConical,
  Leaf,
  Milk,
  PawPrint,
  Search,
  Shield,
  ShoppingCart,
  Soup,
  Sparkle,
  Sprout,
  Thermometer,
  Volleyball,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CuteCompanion } from './CuteCompanion';
import { WellnessMiniGames } from './WellnessMiniGames';
import { PetSpecies, PetStats, EquippedAccessories, Inventory, PetAnimationMood } from '../types';

interface PouWellnessTabProps {
  species: PetSpecies;
  companionName: string;
  stats: PetStats;
  equipped: EquippedAccessories;
  inventory: Inventory;
  points: number;
  onUpdateStats: (newStats: Partial<PetStats>) => void;
  onUseInventory: (item: keyof Inventory) => boolean;
  onAddPoints: (amount: number) => void;
  onOpenChat?: () => void;
  onOpenMarket: () => void;
  onTriggerCrisisSafety?: () => void;
  onChangeSpecies?: (newSpecies: PetSpecies) => void;
}

type CareRoom = 'kitchen' | 'bathroom' | 'bedroom' | 'outside' | 'clinic';

type ScenePlaceId = CareRoom | 'games';

interface ScenePlace {
  id: ScenePlaceId;
  label: string;
  icon: React.ElementType;
}

/** Room ids map straight onto CareRoom, so tapping an icon performs exactly the
    same navigation the old room dock did. "games" is scene-only: it opens the
    mini-games modal and is deliberately not a CareRoom / not in the dock. */
const SCENE_PLACES: ScenePlace[] = [
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
  { id: 'bedroom', label: 'Bedroom', icon: Moon },
  { id: 'outside', label: 'Outside', icon: Trees },
  { id: 'clinic', label: 'Clinic', icon: Pill },
  { id: 'games', label: 'Games', icon: Gamepad2 },
];

interface ScenePlaceRailProps {
  activeRoom: CareRoom;
  isGamesOpen: boolean;
  revealedPlace: ScenePlaceId | null;
  onReveal: (id: ScenePlaceId | null) => void;
  onSelectRoom: (room: CareRoom) => void;
  onOpenGames: () => void;
}

/** The right-side place rail rendered inside each scenery. Icon-only at rest;
    tapping an icon reveals that one label, and tapping another swaps to it.
    Every button is a FIXED square and the label is absolutely positioned, so
    revealing a label can never resize, shift or reflow that button, any
    sibling icon, or the rail container itself. */
const ScenePlaceRail: React.FC<ScenePlaceRailProps> = ({
  activeRoom,
  isGamesOpen,
  revealedPlace,
  onReveal,
  onSelectRoom,
  onOpenGames,
}) => (
  <div className="absolute top-10 right-1.5 sm:top-12 sm:right-3 z-30 flex flex-col items-center gap-1.5">
    {SCENE_PLACES.map((place) => {
      const PlaceIcon = place.icon;
      const isLabelOpen = revealedPlace === place.id;
      const isActive = place.id === 'games' ? isGamesOpen : activeRoom === place.id;
      return (
        <button
          key={place.id}
          onClick={() => {
            if (place.id === 'games') {
              onOpenGames();
            } else {
              onSelectRoom(place.id);
            }
            // Only ever one label visible: tapping the open icon closes it.
            onReveal(isLabelOpen ? null : place.id);
          }}
          aria-label={place.label}
          aria-pressed={isActive}
          title={place.label}
          className={`relative shrink-0 h-8 w-8 flex items-center justify-center rounded-full border shadow-sm transition-all active:scale-95 cursor-pointer ${
            isActive
              ? 'bg-emerald-500 border-emerald-600 shadow-md'
              : 'bg-white/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-[#2d4d41]/75 hover:shadow-md'
          }`}
        >
          {/* Label lives OUT of flow (absolute, to the left of the button) so it
              cannot affect any layout. The outer span owns the vertical centring
              and the inner span owns the slide/fade, so the two transforms on the
              same axis never fight each other. */}
          <span className="absolute right-[calc(100%+0.375rem)] top-1/2 -translate-y-1/2 pointer-events-none">
            <span
              className={`block max-w-[6rem] truncate whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-black shadow-sm transition-all duration-200 ease-out ${
                isLabelOpen ? 'translate-x-0 opacity-100' : '-translate-x-1.5 opacity-0'
              } ${
                isActive
                  ? 'bg-emerald-500 border-emerald-600 text-white'
                  : 'bg-white/95 dark:bg-emerald-950/95 border-emerald-200 dark:border-[#2d4d41]/75 text-emerald-900 dark:text-emerald-100'
              }`}
            >
              {place.label}
            </span>
          </span>
          <PlaceIcon
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-300'
            }`}
          />
        </button>
      );
    })}
  </div>
);

/** Every glyph in this tab is a Lucide component rather than an emoji, so the
    whole file shares one visual language and every mark can be recoloured or
    resized by `className`. */
type IconComponent = React.ElementType<{ className?: string }>;

interface KitchenItem {
  id: string;
  name: string;
  icon: IconComponent;
  /** Tailwind text-color classes (light + dark) matching this item's real-world
      colour — e.g. the reddish tone of raw beef, the pink of salmon, the blue of
      water — so the glyph itself reads as that food rather than a generic tint. */
  color: string;
  type: 'food' | 'drink';
  inventoryKey: keyof Inventory;
  xp: number;
}

/** The kitchen's food + drink selection, defined ONCE and shared by the in-scene
    pantry shelf and the draggable tray below it, so the two can never drift
    apart. Drinks reuse the existing water / herbalTea inventory. */
const kitchenItemsFor = (species: PetSpecies): KitchenItem[] => [
  ...(species === 'dog'
    ? [
        { id: 'kibble', name: 'Beef Kibble', icon: Beef, color: 'text-red-700 dark:text-red-400', type: 'food' as const, inventoryKey: 'kibble' as keyof Inventory, xp: 5 },
        { id: 'bone', name: 'Puppy Bone', icon: Bone, color: 'text-stone-400 dark:text-stone-300', type: 'food' as const, inventoryKey: 'bone' as keyof Inventory, xp: 8 },
        { id: 'treat', name: 'Bickie Treat', icon: Cookie, color: 'text-amber-700 dark:text-amber-500', type: 'food' as const, inventoryKey: 'treat' as keyof Inventory, xp: 3 },
        { id: 'apple', name: 'Apple Slice', icon: Apple, color: 'text-red-500 dark:text-red-400', type: 'food' as const, inventoryKey: 'apple' as keyof Inventory, xp: 4 },
      ]
    : [
        { id: 'salmon', name: 'Steamed Salmon', icon: Fish, color: 'text-orange-400 dark:text-orange-300', type: 'food' as const, inventoryKey: 'salmon' as keyof Inventory, xp: 8 },
        { id: 'catKibble', name: 'Tuna Kibble', icon: Fish, color: 'text-rose-400 dark:text-rose-300', type: 'food' as const, inventoryKey: 'catKibble' as keyof Inventory, xp: 5 },
        { id: 'catnip', name: 'Catnip Herb', icon: Sprout, color: 'text-green-600 dark:text-green-400', type: 'food' as const, inventoryKey: 'catnip' as keyof Inventory, xp: 4 },
        { id: 'catMilk', name: 'Cat Milk', icon: Milk, color: 'text-slate-300 dark:text-slate-200', type: 'food' as const, inventoryKey: 'catMilk' as keyof Inventory, xp: 3 },
      ]),
  { id: 'water', name: 'Fresh Water', icon: Droplet, color: 'text-sky-500 dark:text-sky-400', type: 'drink' as const, inventoryKey: 'water' as keyof Inventory, xp: 2 },
  { id: 'herbalTea', name: 'Herbal Tea', icon: Leaf, color: 'text-amber-600 dark:text-amber-400', type: 'drink' as const, inventoryKey: 'herbalTea' as keyof Inventory, xp: 3 },
];

/** The SCENE_PLACES entry behind a room, resolved from the SAME list the place
    rail renders from. Reading the label and the glyph from one source is what
    keeps a place's heading from drifting away from the name on its own rail
    button. Every `activeRoom` is a CareRoom and only "games" is scene-only, so
    this resolves for every selectable place; the undefined case is a guard. */
const placeFor = (room: CareRoom): ScenePlace | undefined =>
  SCENE_PLACES.find((place) => place.id === room);

interface MeadowFlowerProps {
  grown: boolean;
  swaying: boolean;
  stormy: boolean;
}

/** A rooted SVG flower standing in the meadow: stem, two leaves, petals and a
    centre disc, so it grows out of the ground instead of floating over it as an
    emoji sticker. `grown` springs it up from a low bud once rain has held, and
    `swaying` rocks the stem in the wind on a sunny day. Neither animation
    repeats when its effect is inactive — both fall back to a settled state. */
const MeadowFlower: React.FC<MeadowFlowerProps> = ({ grown, swaying, stormy }) => {
  const stem = stormy ? '#14532d' : '#16a34a';
  const leaf = stormy ? '#166534' : '#22c55e';
  const petal = stormy ? '#475569' : '#f472b6';
  const petalAlt = stormy ? '#334155' : '#fbcfe8';
  const heart = stormy ? '#64748b' : '#fbbf24';

  return (
    <div className="absolute bottom-2 left-1 z-15 pointer-events-none">
      {/* Wind sway lives on the OUTER group so the growth scale below is not
          compounded by it, and it only repeats while `swaying` is true. */}
      <motion.div
        className="origin-bottom"
        animate={swaying ? { rotate: [-3, 3.5, -3] } : { rotate: 0 }}
        transition={
          swaying
            ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.45, ease: 'easeOut' }
        }
      >
        <motion.div
          className="origin-bottom"
          initial={false}
          animate={{ scale: grown ? 1 : 0.28, y: grown ? 0 : 22 }}
          transition={{ type: 'spring', stiffness: 110, damping: 13 }}
        >
          <svg viewBox="0 0 64 100" className="h-24 sm:h-28 w-auto">
            {/* Stem, rooted at the bottom of the viewBox */}
            <path
              d="M32 98 C 29 74 35 52 32 28"
              stroke={stem}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Two leaves off the stem */}
            <path d="M32 70 C 21 68 14 60 12 51 C 25 53 31 62 32 70 Z" fill={leaf} />
            <path
              d="M32 58 C 43 56 50 48 52 40 C 39 42 33 50 32 58 Z"
              fill={leaf}
              opacity="0.85"
            />
            {/* Petals radiating from the head */}
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx="32"
                cy="14"
                rx="6"
                ry="10.5"
                fill={angle % 144 === 0 ? petalAlt : petal}
                transform={`rotate(${angle} 32 24)`}
              />
            ))}
            {/* Centre disc */}
            <circle cx="32" cy="24" r="5.5" fill={heart} />
            <circle cx="30" cy="22" r="1.6" fill={stormy ? '#94a3b8' : '#fde68a'} />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

interface BlowerProps {
  isRunning: boolean;
}

/** Lucide has no soap glyph, so this composes one from the Lucide `Droplet`
    outline sitting on a rounded bar — same visual meaning, still no emoji. */
const SoapBarIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.6c2.3 2.5 3.5 4.2 3.5 5.5a3.5 3.5 0 0 1-7 0c0-1.3 1.2-3 3.5-5.5Z" />
    <rect x="3" y="11.6" width="18" height="9.2" rx="3.2" />
  </svg>
);

/** Wall-hung pet blower / hair dryer.
    The barrel, nozzle and handle are drawn as an SVG so it reads as a real
    handheld dryer rather than an icon pasted onto the tiles. The `Fan` rotor
    inside the barrel only spins while it is running, and the air streaks off
    the nozzle are only mounted while it is running — so switching it off
    leaves nothing moving. The nozzle also lights up to show the active state. */
const PetBlower: React.FC<BlowerProps> = ({ isRunning }) => (
  <div className="absolute left-3 top-40 z-10">
    {/* Wall hook the dryer hangs from */}
    <div className="absolute -top-1.5 left-3 w-2.5 h-1.5 rounded-sm bg-slate-400 shadow-xs" />

    <motion.div
      className="relative origin-top-left"
      /* the dryer itself jitters slightly while the motor is on */
      animate={isRunning ? { rotate: [0, -2.5, 0, 2.5, 0] } : { rotate: 0 }}
      transition={
        isRunning
          ? { duration: 0.16, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.25, ease: 'easeOut' }
      }
    >
      {/* Air streaks blowing toward the pet — active state only */}
      {isRunning &&
        [...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: [0, 0.85, 0], x: [0, 54] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
            className="absolute top-[14px] h-0.5 w-5 rounded-full bg-sky-300/90"
            style={{ left: 48 }}
          />
        ))}

      <svg viewBox="0 0 60 46" className="h-12 w-auto">
        {/* Handle */}
        <path
          d="M13 30 L11 45 L22 45 L21 30 Z"
          className="fill-slate-300 dark:fill-slate-600 stroke-slate-500 dark:stroke-slate-400"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Barrel */}
        <rect
          x="3"
          y="7"
          width="34"
          height="23"
          rx="9"
          className="fill-slate-100 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.4"
        />
        {/* Barrel vent slots */}
        <path
          d="M8 13 L8 24 M13 12.5 L13 24.5"
          className="stroke-slate-300 dark:stroke-slate-500"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Nozzle — glows while running */}
        <rect
          x="35"
          y="12"
          width="16"
          height="13"
          rx="4"
          className={
            isRunning
              ? 'fill-sky-300 dark:fill-sky-500 stroke-sky-500'
              : 'fill-slate-200 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500'
          }
          strokeWidth="1.4"
        />
      </svg>

      {/* Rotor inside the barrel */}
      <div className="absolute left-[8px] top-[13px]">
        <motion.div
          animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
          transition={
            isRunning
              ? { duration: 0.4, repeat: Infinity, ease: 'linear' }
              : { duration: 0.3, ease: 'easeOut' }
          }
        >
          <Fan
            className={`w-4 h-4 ${
              isRunning
                ? 'text-sky-600 dark:text-sky-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        </motion.div>
      </div>
    </motion.div>
  </div>
);

/** Lucide glyph for each bathroom item. Soap is the composed SoapBarIcon
    (Lucide has no soap glyph), the shower reuses the `ShowerHead` already drawn
    in the scene, and the blower is `Wind` — the same icon the dryer's reaction
    bubble uses. No emoji is rendered for any of them. */
const BATHROOM_ITEM_ICONS: Record<string, React.ElementType> = {
  soap: SoapBarIcon,
  shower: ShowerHead,
  blower: Wind,
};

interface DraggableTool {
  id: string;
  name: string;
  /** Lucide glyph for the item. Left unset for items that resolve their mark from
      a lookup instead (the bathroom set). */
  icon?: IconComponent;
  /** Tailwind text-color classes matching this item's real-world colour, carried
      over from KitchenItem when the item is a kitchen food/drink. Optional
      because non-kitchen tools (soap, thermometer, toys...) don't need one. */
  color?: string;
  type: 'food' | 'drink' | 'soap' | 'shower' | 'blower' | 'medicine' | 'toy' | 'thermometer';
  inventoryKey?: keyof Inventory;
  amount?: number;
  xp?: number;
}

/** The exact item the pet is currently consuming, so the scene never falls back to a hardcoded food. */
interface ConsumedItem {
  name: string;
  icon: IconComponent;
  /** Carried from the item's own KitchenItem.color, so the food resting on the
      rug is tinted like that real food/drink rather than a flat generic brown. */
  color: string;
  kind: 'food' | 'drink';
}

export const PouWellnessTab: React.FC<PouWellnessTabProps> = ({
  species,
  companionName,
  stats,
  equipped,
  inventory,
  points,
  onUpdateStats,
  onUseInventory,
  onAddPoints,
  onOpenChat,
  onOpenMarket,
  onTriggerCrisisSafety,
  onChangeSpecies,
}) => {
  const [activeRoom, setActiveRoom] = useState<CareRoom>('kitchen');
  const [roomMood, setRoomMood] = useState<PetAnimationMood>(stats.isSleeping ? 'sleeping' : 'idle');
  // Held as a node, not a string, so a toast can inline Lucide icons alongside
  // its text instead of trailing emoji.
  const [interactionToast, setInteractionToast] = useState<React.ReactNode>(null);

  // Pantry shelf door open state in kitchen
  const [isPantryOpen, setIsPantryOpen] = useState(false);

  // Outside stormy weather state ("the outside its stormy so sad")
  const [isOutsideStormy, setIsOutsideStormy] = useState(true);

  // The meadow flower only grows once the rainy season has held for 5s.
  const [hasFlowerGrown, setHasFlowerGrown] = useState(false);

  // Dragging interaction state
  const [activeDragItem, setActiveDragItem] = useState<DraggableTool | null>(null);
  const [isHoveringPet, setIsHoveringPet] = useState(false);
  const [isShowerRunning, setIsShowerRunning] = useState(false);
  const [isBlowerRunning, setIsBlowerRunning] = useState(false);
  // Held so a second blow cancels the first one's timer, instead of the older
  // timeout switching the dryer off while a newer one is still going.
  const blowerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [soapBubbles, setSoapBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Ball bouncing in outside room
  const [isBallThrown, setIsBallThrown] = useState(false);

  // A real pet sniffs what it is served before it eats or drinks (or turns it
  // down), and shakes itself dry right after a rinse.
  const [isSniffingServed, setIsSniffingServed] = useState(false);
  const [isShakingOff, setIsShakingOff] = useState(false);

  // Mindful Mini-Games modal
  const [showGamesModal, setShowGamesModal] = useState(false);

  // Scene place rail: icon-only until an icon is tapped (one label at a time)
  const [revealedPlace, setRevealedPlace] = useState<ScenePlaceId | null>(null);

  // Item currently being eaten or drunk (drives the on-bowl visual + copy)
  const [consumedItem, setConsumedItem] = useState<ConsumedItem | null>(null);

  // The mark for whatever is being consumed right now — shown both on the rug and
  // in the eating bubble. Falls back to a plain bowl only if the mood is 'eating'
  // with no item recorded, so the bubble is never left without a glyph.
  const ConsumedIcon: IconComponent = consumedItem?.icon ?? Soup;

  const petAreaRef = useRef<HTMLDivElement>(null);

  // Set the moment a drag actually begins, cleared on the next pointerdown.
  // Lets a tap serve an item while still ignoring the synthetic click that
  // browsers fire at the end of a drag.
  const dragJustHappenedRef = useRef(false);

  // Timers for the multi-step pet behaviours (sniff -> eat, rinse -> shake off).
  // Tracked so they can all be cleared if the tab goes away mid-sequence.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // The kitchen's own food + drink list, shared with the in-scene pantry shelf.
  const kitchenItems = kitchenItemsFor(species);

  // Which place the user is actually standing in, so the pantry card below is
  // titled for that place instead of always claiming to be the kitchen's.
  // Kitchen -> "Kitchen Pantry", Bathroom -> "Bathroom Pantry", and so on for
  // every place in SCENE_PLACES, including any added later.
  const activePlace = placeFor(activeRoom);
  const pantryTitle = `${activePlace?.label ?? 'Room'} Pantry`;
  // The heading carries the selected place's own glyph rather than one fixed
  // mark, so the card reads as belonging to the place that is on screen.
  const PantryIcon: IconComponent = activePlace?.icon ?? PawPrint;

  // While the pet is being bathed or rinsed it walks over to the shower head
  // (mounted top-right) so the water visibly falls ON it.
  const isPetAtShower = isShowerRunning || roomMood === 'bathing';
  // The blower hangs on the LEFT wall, so it gets its own spot for the pet.
  // Showering wins if both were somehow live at once, so the established
  // bathing behaviour is never overridden.
  const petSceneLeft = isPetAtShower
    ? 'calc(100% - 8rem)'
    : isBlowerRunning
      ? '9rem'
      : '50%';

  // What the pet actually looks like right now. An action in progress (eating,
  // bathing, being petted...) always wins; otherwise the pet reacts to its
  // surroundings and how it is feeling, the way a real one would: asleep when
  // put to bed, miserable in the rain (a cat is openly displeased), drowsy when
  // worn out or unwell, and pleading when it is hungry.
  const displayMood: string = (() => {
    if (stats.isSleeping) return 'sleeping';
    // CuteCompanion has no "playing" pose; a pet chasing a ball is excited.
    if (roomMood === 'playing') return 'excited';
    if (roomMood !== 'idle') return roomMood;
    if (activeRoom === 'outside' && isOutsideStormy) {
      return species === 'cat' ? 'serious' : 'sad';
    }
    if (stats.isSick || stats.energy < 20) return 'tired';
    if (stats.hunger < 25) return 'anxious';
    return 'idle';
  })();

  // Clear the blower on unmount so a pending timeout can't set state after the
  // tab has gone.
  useEffect(() => {
    return () => {
      if (blowerTimerRef.current) clearTimeout(blowerTimerRef.current);
    };
  }, []);

  // Same for the sniff / eat / shake-off sequence timers.
  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach((id) => clearTimeout(id));
      pendingTimersRef.current = [];
    };
  }, []);

  // Rain has to hold for a full 5s before the flower grows. Growth is never
  // taken away once earned, so switching seasons does not undo it.
  useEffect(() => {
    if (!isOutsideStormy) return;
    const growTimer = setTimeout(() => setHasFlowerGrown(true), 5000);
    return () => clearTimeout(growTimer);
  }, [isOutsideStormy]);

  const showToast = (msg: React.ReactNode) => {
    setInteractionToast(msg);
    setTimeout(() => setInteractionToast(null), 2400);
  };

  // Sync mood with sleep
  useEffect(() => {
    if (stats.isSleeping) {
      setRoomMood('sleeping');
    } else if (roomMood === 'sleeping') {
      setRoomMood('idle');
    }
  }, [stats.isSleeping]);

  // Check if drag coordinates land on pet target
  const checkHitPet = (clientX: number, clientY: number): boolean => {
    if (!petAreaRef.current) return false;
    const rect = petAreaRef.current.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  // Runs `fn` after `ms`, remembering the timer so it can be cancelled on unmount.
  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      pendingTimersRef.current = pendingTimersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    pendingTimersRef.current.push(id);
  };

  // Cats are the pickier sniffers; a dog gets its nose in and dives straight in.
  const sniffMs = species === 'cat' ? 900 : 550;

  // The pet leans in and sniffs first; `then` runs once it has made up its mind.
  const sniffThen = (ms: number, then: () => void) => {
    setIsSniffingServed(true);
    schedule(() => {
      setIsSniffingServed(false);
      then();
    }, ms);
  };

  // Drag End handler: execute action if dropped on pet
  const handleDragEnd = (event: any, info: any, item: DraggableTool) => {
    const clientX = info.point.x;
    const clientY = info.point.y;
    const hit = checkHitPet(clientX, clientY);

    if (hit) {
      applyItemAction(item);
    }
    setActiveDragItem(null);
    setIsHoveringPet(false);
  };

  // Tap-to-serve on a kitchen item. Serving a tap has to bring the pet back into
  // view, because reaching the pantry means scrolling the stage off screen and the
  // user would otherwise never see the meal they just started. Drag-to-feed is
  // untouched: it already happens with the pet on screen, so it never scrolls.
  const handleKitchenItemTap = (item: DraggableTool, isOutOfStock: boolean) => {
    // Swallow the click that a completed drag emits.
    if (dragJustHappenedRef.current) {
      dragJustHappenedRef.current = false;
      return;
    }
    if (isOutOfStock) return;

    applyItemAction(item);

    // Next frame, so the eating state has painted and the pet's final on-screen
    // box is the one we scroll to.
    requestAnimationFrame(() => {
      petAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const applyItemAction = (item: DraggableTool) => {
    // A sleeping pet is not interested in anything until it is woken up.
    if (stats.isSleeping) {
      showToast(
        <>
          {companionName} is fast asleep — let them rest
          <Bed className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      return;
    }

    // Still sniffing or chewing: a real pet finishes one thing before the next.
    if (
      (item.type === 'food' || item.type === 'drink') &&
      (roomMood === 'eating' || isSniffingServed)
    ) {
      showToast(
        <>
          Let {companionName} finish first
          <Utensils className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      return;
    }

    if (item.type === 'food' && item.inventoryKey && item.icon) {
      if ((inventory[item.inventoryKey] || 0) <= 0) {
        showToast(
          <>
            No {item.name} left in pantry! Get more at Market
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        return;
      }

      // A full pet sniffs the bowl and turns it down, like a real one. Nothing
      // is used up and nothing is earned.
      if (stats.hunger >= 95) {
        sniffThen(sniffMs, () =>
          showToast(
            <>
              {companionName} sniffed the {item.name} but isn't hungry right now
              <Smile className="w-3.5 h-3.5 shrink-0" />
            </>
          )
        );
        return;
      }

      const success = onUseInventory(item.inventoryKey);
      if (!success) return;

      setConsumedItem({
        name: item.name,
        icon: item.icon,
        color: item.color ?? 'text-amber-800 dark:text-amber-300',
        kind: 'food',
      });
      onUpdateStats({
        hunger: Math.min(100, stats.hunger + 24),
        happiness: Math.min(100, stats.happiness + 8),
        health: Math.min(100, stats.health + 4),
      });
      if (item.xp) {
        onAddPoints(item.xp);
      }
      // Sniff first, then dig in.
      sniffThen(sniffMs, () => {
        setRoomMood('eating');
        confetti({ particleCount: 22, spread: 50, origin: { y: 0.65 } });
        showToast(
          <>
            *crunch nom nom* {companionName} loved the tasty {item.name}!
            <Smile className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        // Straight back to idle: no lingering 'happy' phase, so no interaction
        // animation or movement survives the end of the meal.
        schedule(() => {
          setConsumedItem(null);
          setRoomMood('idle');
        }, 2200);
      });
    } else if (item.type === 'drink' && item.inventoryKey && item.icon) {
      if ((inventory[item.inventoryKey] || 0) <= 0) {
        showToast(
          <>
            No {item.name} left in the cooler! Get more at Market
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        return;
      }
      const success = onUseInventory(item.inventoryKey);
      if (!success) return;

      setConsumedItem({
        name: item.name,
        icon: item.icon,
        color: item.color ?? 'text-sky-600 dark:text-sky-300',
        kind: 'drink',
      });
      onUpdateStats({
        hunger: Math.min(100, stats.hunger + 6),
        cleanliness: Math.min(100, stats.cleanliness + 4),
        happiness: Math.min(100, stats.happiness + 4),
      });
      if (item.xp) {
        onAddPoints(item.xp);
      }
      // A quick sniff of the bowl, then it laps. Reuses the existing
      // head-down-to-bowl animation; the lapping motion, droplets and copy are
      // layered on by the scene below.
      sniffThen(Math.round(sniffMs * 0.6), () => {
        setRoomMood('eating');
        showToast(
          <>
            *lap lap lap* {companionName} sipped the {item.name}!
            <Droplet className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        // Straight back to idle — the drinking animation stops the moment it ends.
        schedule(() => {
          setConsumedItem(null);
          setRoomMood('idle');
        }, 1800);
      });
    } else if (item.type === 'soap') {
      if (inventory.soap <= 0) {
        showToast(
          <>
            Out of gentle soap! Pick some up in the Market
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        return;
      }
      // Generate bubbles on pet
      const newBubbles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
      }));
      setSoapBubbles((prev) => [...prev.slice(-14), ...newBubbles]);
      setRoomMood('bathing');
      onUpdateStats({
        cleanliness: Math.min(100, stats.cleanliness + 22),
        happiness: Math.min(100, stats.happiness + 5),
        isSoapy: true,
      });
      showToast(
        <>
          Lathered {companionName} with warm foamy bubbles!
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
        </>
      );
    } else if (item.type === 'shower') {
      setIsShowerRunning(true);
      setSoapBubbles([]);
      // Dogs put up with a rinse cheerfully; a cat sits through it visibly
      // unimpressed.
      setRoomMood(species === 'cat' ? 'serious' : 'happy');
      onUpdateStats({
        cleanliness: 100,
        happiness: Math.min(100, stats.happiness + 8),
        isSoapy: false,
      });
      showToast(
        <>
          Warm water rinsed {companionName} sparkling fresh and clean!
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      schedule(() => {
        setIsShowerRunning(false);
        // Straight out of the water, the pet shakes itself dry — a dog with its
        // whole body, a cat more daintily.
        setIsShakingOff(true);
        schedule(() => {
          setIsShakingOff(false);
          setRoomMood('idle');
        }, 1000);
      }, 2500);
    } else if (item.type === 'blower') {
      // A blow replaces any blow already in progress, so the older timer can
      // never switch the dryer off mid-session.
      if (blowerTimerRef.current) clearTimeout(blowerTimerRef.current);
      setIsBlowerRunning(true);
      setSoapBubbles([]);
      setRoomMood(species === 'cat' ? 'serious' : 'happy');
      onUpdateStats({
        cleanliness: 100,
        happiness: Math.min(100, stats.happiness + 4),
        isSoapy: false,
      });
      showToast(
        <>
          *whoooosh* {companionName}'s fur is dry and fluffy!
          <Wind className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      blowerTimerRef.current = setTimeout(() => {
        // Clearing the flag stops the rotor, the air streaks, the dryer jitter
        // and the pet's shake in the same tick — nothing is left running.
        setIsBlowerRunning(false);
        setRoomMood('idle');
        blowerTimerRef.current = null;
      }, 2800);
    } else if (item.type === 'medicine') {
      if (inventory.medicine <= 0) {
        showToast(
          <>
            No animal vitamins left in medicine kit!
            <Pill className="w-3.5 h-3.5 shrink-0" />
          </>
        );
        return;
      }
      onUseInventory('medicine');
      setRoomMood('happy');
      onUpdateStats({
        health: 100,
        energy: Math.min(100, stats.energy + 20),
        isSick: false,
      });
      showToast(
        <>
          Administered gentle wellness vitamins to {companionName}!
          <Heart className="w-3.5 h-3.5 shrink-0" />
          <Bandage className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      setTimeout(() => setRoomMood('idle'), 2000);
    } else if (item.type === 'thermometer') {
      setRoomMood('happy');
      showToast(
        <>
          Checked temperature: 38.5&deg;C Normal! {companionName} is comfortable
          <Thermometer className="w-3.5 h-3.5 shrink-0" />
          <Sparkle className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      setTimeout(() => setRoomMood('idle'), 1800);
    } else if (item.type === 'toy') {
      triggerBallPlay();
    }
  };

  // Outside Toy Play
  const triggerBallPlay = () => {
    // A worn-out pet won't chase a ball, however nicely you ask.
    if (stats.energy <= 15) {
      showToast(
        <>
          {companionName} is too tired to play right now
          <Moon className="w-3.5 h-3.5 shrink-0" />
        </>
      );
      return;
    }
    setIsBallThrown(true);
    setRoomMood('playing');
    onUpdateStats({
      happiness: Math.min(100, stats.happiness + 15),
      energy: Math.max(10, stats.energy - 8),
    });
    showToast(
      <>
        *squeak!* {companionName} caught the bouncing tennis ball!
        <Volleyball className="w-3.5 h-3.5 shrink-0" />
      </>
    );
    setTimeout(() => {
      setIsBallThrown(false);
      setRoomMood('idle');
    }, 2200);
  };

  // Bedroom Sleep
  const handleToggleBed = () => {
    if (stats.isSleeping) {
      onUpdateStats({ isSleeping: false });
      setRoomMood('idle');
      showToast(
        <>
          {companionName} woke up well-rested and happy!
          <Sun className="w-3.5 h-3.5 shrink-0" />
        </>
      );
    } else {
      onUpdateStats({ isSleeping: true, energy: Math.min(100, stats.energy + 40) });
      setRoomMood('sleeping');
      showToast(
        <>
          Lights dimmed. {companionName} is tucked into bed...
          <Moon className="w-3.5 h-3.5 shrink-0" />
          <Bed className="w-3.5 h-3.5 shrink-0" />
        </>
      );
    }
  };

  const toggleSpecies = () => {
    if (onChangeSpecies) {
      onChangeSpecies(species === 'dog' ? 'cat' : 'dog');
    }
  };

  // How hard the pet shakes itself dry after a rinse: a dog shakes its whole
  // body, a cat only flicks.
  const shakeStrength = species === 'dog' ? 1 : 0.55;

  return (
    <div className="w-full flex flex-col items-center space-y-4 select-none pb-8">
      {/* =========================================================
          COMPANION HEADER: Avatar, Name, Wellness Level, Switch Icon
          ========================================================= */}
      <div className="w-full rounded-2xl bg-white dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/60 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-2.5">
            {/* Companion Avatar Circle */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl shadow-sm border-2 border-white dark:border-emerald-900 shrink-0">
              {species === 'dog' ? (
                <Dog className="w-6 h-6 text-white" />
              ) : (
                <Cat className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 leading-tight">
                {companionName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                {species === 'dog' ? 'Dog' : 'Cat'} &bull; Wellness: Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 text-center">
          <div className="flex flex-col items-center gap-1" title="Hunger">
            <Utensils className="w-3.5 h-3.5 text-amber-500" />
            <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.hunger > 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${stats.hunger}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-100">
              {stats.hunger}%
            </span>
          </div>

          <div className="flex flex-col items-center gap-1" title="Cleanliness">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500"
                style={{ width: `${stats.cleanliness}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-100">
              {stats.cleanliness}%
            </span>
          </div>

          <div className="flex flex-col items-center gap-1" title="Energy">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${stats.energy}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-100">
              {stats.energy}%
            </span>
          </div>

          <div className="flex flex-col items-center gap-1" title="Happiness">
            <Smile className="w-3.5 h-3.5 text-emerald-500" />
            <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.happiness}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-100">
              {stats.happiness}%
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          REALISTIC CARTOON POU ROOM STAGE (GROUNDED - NOT FLYING!)
          ========================================================= */}
      <div className="w-full h-84 sm:h-96 rounded-3xl relative overflow-hidden border border-emerald-200/80 dark:border-emerald-800 shadow-md select-none">
        {/* =========================================================
            ROOM 1: KITCHEN WITH REALISTIC REFRIGERATOR, COUNTER & FLOOR
            ========================================================= */}
        {activeRoom === 'kitchen' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#fef5e7] via-[#faebd7] to-[#e8d5bc] dark:from-[#251f18] dark:to-[#17130f] flex flex-col justify-between overflow-hidden">
            {/* Kitchen Wallpaper Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

            {/* Top Cabinets */}
            <div className="flex justify-start items-start p-4 z-10">
              <div className="flex gap-2">
                <div className="w-24 h-12 rounded-b-xl bg-amber-900/90 border-b-2 border-amber-950 shadow-sm flex items-end justify-center pb-1">
                  <div className="w-5 h-1 bg-amber-300/80 rounded-full" />
                </div>
                <div className="w-24 h-12 rounded-b-xl bg-amber-900/90 border-b-2 border-amber-950 shadow-sm flex items-end justify-center pb-1">
                  <div className="w-5 h-1 bg-amber-300/80 rounded-full" />
                </div>
              </div>
            </div>

            {/* =========================================================
                REFRIGERATOR. A real stainless-steel fridge standing on the
                kitchen floor — freezer strip on top, a door handle bar, feet
                and a floor contact shadow — rather than a wall-hung pantry
                cabinet. Opening the door reveals the SAME three stocked
                shelves as before, read from the SAME kitchenItems list the
                tray below uses, now tinted with each food/drink's own colour
                instead of a single flat tone.
                ========================================================= */}
            <div className="absolute left-3 bottom-14 w-28 sm:w-32 z-10">
              {/* Feet + floor contact shadow — a fridge stands on the floor,
                  it does not hang off the wall */}
              <div className="absolute inset-x-2 -bottom-1.5 h-2 rounded-full bg-slate-900/25 dark:bg-[#0b1411]/40 blur-[2px]" />
              <div className="absolute -bottom-1 left-3 w-1.5 h-2 rounded-sm bg-slate-500 dark:bg-slate-400 shadow-xs" />
              <div className="absolute -bottom-1 right-3 w-1.5 h-2 rounded-sm bg-slate-500 dark:bg-slate-400 shadow-xs" />

              {/* Carcass — brushed stainless-steel body */}
              <div className="rounded-xl bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-slate-500 dark:via-slate-600 dark:to-slate-700 border-2 border-slate-300 dark:border-slate-600 p-1.5 shadow-lg">
                {/* Freezer compartment strip on top, with its own small handle */}
                <div className="relative h-7 mb-1 rounded-md bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 border border-slate-300 dark:border-slate-500 shadow-inner flex items-center px-2">
                  <span className="text-[7px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                    Freezer
                  </span>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-slate-400 dark:bg-slate-300 shadow-xs" />
                </div>

                <div className="relative h-44 sm:h-52 rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                  <AnimatePresence mode="wait" initial={false}>
                    {isPantryOpen ? (
                      /* ---- OPEN: three stocked shelves, glass-shelf look ---- */
                      <motion.div
                        key="fridge-open"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="relative h-full flex flex-col justify-between py-1"
                      >
                        {/* Soft interior light glow, since a real fridge lights up when open */}
                        <div className="absolute inset-x-2 top-0 h-8 rounded-full bg-white/70 dark:bg-white/10 blur-md pointer-events-none" />
                        {[0, 1, 2].map((shelf) => (
                          <div key={shelf} className="relative">
                            {/* Stock sitting ON the shelf, each icon tinted like the
                                real food/drink it represents */}
                            <div className="grid grid-cols-2 gap-1 px-2">
                              {kitchenItems.slice(shelf * 2, shelf * 2 + 2).map((item) => {
                                const count = inventory[item.inventoryKey] || 0;
                                const StockIcon = item.icon;
                                return (
                                  <div
                                    key={item.id}
                                    title={item.name}
                                    className="flex flex-col items-center"
                                  >
                                    <StockIcon
                                      className={`w-4 h-4 drop-shadow-sm ${item.color} ${
                                        count <= 0 ? 'opacity-30' : ''
                                      }`}
                                    />
                                    <span
                                      className={`text-[7px] font-black leading-tight ${
                                        count <= 0
                                          ? 'text-slate-400/60 dark:text-slate-400/40'
                                          : 'text-slate-600 dark:text-slate-200'
                                      }`}
                                    >
                                      x{count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Glass shelf board */}
                            <div className="h-1 rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 dark:from-slate-600 dark:via-slate-400 dark:to-slate-600 shadow-sm" />
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      /* ---- CLOSED: a real fridge door, not a flat sticker ---- */
                      <motion.div
                        key="fridge-closed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800"
                      >
                        <Refrigerator className="w-6 h-6 text-slate-500 dark:text-slate-300" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                          Fridge
                        </span>
                        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-400/70">
                          Tap to open
                        </span>
                        {/* Door handle bar + hinges, so the door reads as a door */}
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-16 rounded-full bg-slate-400 dark:bg-slate-300 shadow-inner" />
                        <div className="absolute left-0.5 top-1.5 w-1 h-2 rounded-full bg-slate-400/70 dark:bg-slate-500/70" />
                        <div className="absolute left-0.5 bottom-1.5 w-1 h-2 rounded-full bg-slate-400/70 dark:bg-slate-500/70" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inner shadow so the cavity has depth in both states */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]" />
                </div>
              </div>

              {/* Control: the one control for the fridge door, using a Lucide icon */}
              <button
                type="button"
                onClick={() => setIsPantryOpen((open) => !open)}
                aria-expanded={isPantryOpen}
                aria-label={isPantryOpen ? 'Close fridge' : 'Open fridge'}
                title={isPantryOpen ? 'Close fridge' : 'Open fridge'}
                className="mt-1.5 w-full flex items-center justify-center gap-1 rounded-lg py-1 bg-slate-500 dark:bg-slate-600 border border-slate-600 dark:border-slate-500 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                {isPantryOpen ? (
                  <PackageOpen className="w-3 h-3 text-white" />
                ) : (
                  <Package className="w-3 h-3 text-white" />
                )}
                <span className="text-[8px] font-black uppercase tracking-wider text-white">
                  {isPantryOpen ? 'Close' : 'Open'}
                </span>
              </button>
            </div>

            {/* Kitchen Floor: Warm Checkerboard tiles */}
            <div className="absolute bottom-0 inset-x-0 h-22 bg-gradient-to-b from-[#d4a373] to-[#bc6c25] border-t-4 border-[#935116] shadow-inner opacity-95">
              <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px] [background-position:0_0,12px_12px]" />
            </div>

            {/* Woven Kitchen Floor Rug (Grounded beneath the pet!) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-16 rounded-full bg-gradient-to-r from-[#b5763b] via-[#cf9358] to-[#b5763b] border-2 border-[#8c4f1c] shadow-inner z-10 flex items-center justify-around px-4 opacity-90">
              <div className="w-48 h-12 rounded-full border border-dashed border-[#fef3c7]/40" />

              {/* What the pet is actually consuming, resting on the rug.
                  This is a CHILD of the rug element, so it inherits the rug's
                  responsive geometry (w-56 -> sm:w-64) and stays centred on it at
                  every breakpoint. No hardcoded scene offsets to drift out of
                  alignment when the scene or resolution scales. */}
              <AnimatePresence>
                {consumedItem && (
                  <motion.div
                    key={`${consumedItem.kind}-${consumedItem.name}`}
                    initial={{ opacity: 0, y: 8, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="absolute left-1/2 bottom-4 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  >
                    {/* Consumable itself — the exact item picked by the user */}
                    <motion.span
                      animate={
                        consumedItem.kind === 'drink'
                          ? { y: [0, 1.5, 0], rotate: [0, -7, 0] }
                          : { y: [0, -2, 0], scale: [1, 1.06, 1] }
                      }
                      transition={
                        consumedItem.kind === 'drink'
                          ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
                      }
                      className="leading-none"
                    >
                      <ConsumedIcon className={`w-6 h-6 ${consumedItem.color} drop-shadow-sm`} />
                    </motion.span>

                    <span className="mt-0.5 text-[9px] font-black text-amber-950/80 whitespace-nowrap">
                      {consumedItem.name}
                    </span>

                    {/* Kind-specific garnish: crumbs when eating, droplets when drinking */}
                    {consumedItem.kind === 'drink' ? (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-sky-500/80">
                        {[...Array(3)].map((_, i) => (
                          <motion.span
                            key={i}
                            className="absolute"
                            animate={{ y: [0, -10, 0], opacity: [0.9, 0, 0.9] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.26,
                            }}
                            style={{ left: i * 5 - 5 }}
                          >
                            <Droplet className="w-2.5 h-2.5" />
                          </motion.span>
                        ))}
                      </span>
                    ) : (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-amber-600/80">
                        {[...Array(3)].map((_, i) => (
                          <motion.span
                            key={i}
                            className="absolute"
                            animate={{ y: [0, -9, 0], opacity: [0.9, 0, 0.9] }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: i * 0.22,
                            }}
                            style={{ left: i * 5 - 5 }}
                          >
                            <Sparkle className="w-2.5 h-2.5" />
                          </motion.span>
                        ))}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ScenePlaceRail
              activeRoom={activeRoom}
              isGamesOpen={showGamesModal}
              revealedPlace={revealedPlace}
              onReveal={setRevealedPlace}
              onSelectRoom={setActiveRoom}
              onOpenGames={() => setShowGamesModal(true)}
            />
          </div>
        )}

        {/* =========================================================
            ROOM 2: BATHROOM WITH REALISTIC TILE WALL, SHOWER & TUB
            ========================================================= */}
        {activeRoom === 'bathroom' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] dark:from-[#0c2233] dark:to-[#081824] flex flex-col justify-between overflow-hidden">
            {/* Ceramic Tile Grid */}
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] [background-size:28px_28px]" />

            {/* Overhead Realistic Shower Head on Right */}
            <div className="absolute top-2 right-8 z-10 flex flex-col items-center pointer-events-none">
              <div className="w-3 h-8 bg-slate-400 rounded-b-md shadow-xs" />
              <div className="w-16 h-6 rounded-b-2xl bg-gradient-to-r from-slate-300 via-white to-slate-400 border border-slate-400 shadow-md flex items-center justify-around px-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-slate-600" />
                ))}
              </div>
              {/* Flowing Water Jet Streams when showering */}
              {isShowerRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 0.85, height: 180 }}
                  className="w-14 bg-gradient-to-b from-sky-400/80 to-transparent flex justify-around overflow-hidden"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, 90] }}
                      transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.06 }}
                      className="w-0.5 h-6 bg-white rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Wall-mounted mirrored medicine cabinet + towel rail on the left.
                Framed and screwed to the tiled wall with its own cast shadow, and
                a towel actually hanging off the rail, so it reads as bathroom
                furniture rather than a floating label card. */}
            <div className="absolute top-3 left-3 z-10">
              {/* Cast shadow on the tiles behind the cabinet */}
              <div className="absolute -bottom-1 -right-1 w-full h-full rounded-lg bg-sky-900/25 blur-[2px]" />
              <div className="relative w-24 rounded-lg bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 border-2 border-slate-400 shadow-md p-1.5">
                {/* Mirror glass with a diagonal sheen */}
                <div className="w-full h-[62%] rounded-md bg-gradient-to-br from-sky-100 via-white to-sky-200 dark:from-sky-900 dark:via-slate-600 dark:to-sky-800 border border-slate-300 dark:border-slate-500 shadow-inner overflow-hidden">
                  <div className="w-full h-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.55)_45%,transparent_55%)]" />
                </div>
                {/* Two cabinet doors under the mirror */}
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div className="h-4 rounded-sm bg-gradient-to-b from-amber-600 to-amber-700 border border-amber-800 shadow-xs" />
                  <div className="h-4 rounded-sm bg-gradient-to-b from-amber-600 to-amber-700 border border-amber-800 shadow-xs" />
                </div>
                {/* Door knobs */}
                <div className="mt-0.5 flex justify-around">
                  <span className="w-1 h-1 rounded-full bg-amber-900/70" />
                  <span className="w-1 h-1 rounded-full bg-amber-900/70" />
                </div>
              </div>

              {/* Towel rail with a towel draped over it */}
              <div className="relative mt-1.5 flex flex-col items-center">
                <div className="w-full h-1 rounded-full bg-gradient-to-r from-slate-300 to-slate-500 shadow-xs" />
                <div className="w-9 h-7 rounded-b-md bg-gradient-to-b from-teal-300 to-teal-500 border border-teal-600 shadow-xs">
                  <div className="h-full w-px ml-2.5 bg-teal-600/30" />
                </div>
                {/* Rail end mounts */}
                <div className="absolute -left-1 top-0 w-1 h-1.5 rounded-full bg-slate-400" />
                <div className="absolute -right-1 top-0 w-1 h-1.5 rounded-full bg-slate-400" />
              </div>
            </div>

            {/* Bathroom Tile Floor at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-[#0284c7] to-[#0369a1] border-t-2 border-sky-300/60" />

            {/* Plush Fluffy Bath Rug in front of Tub */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full bg-sky-200/80 border border-sky-300 shadow-sm z-10 flex items-center justify-center">
              <span className="flex items-center gap-1.5 text-[10px] text-sky-700 font-bold">
                <PawPrint className="w-3 h-3" />
                Warm Bath Mat
                <PawPrint className="w-3 h-3" />
              </span>
            </div>

            {/* REALISTIC PORCELAIN BATHTUB:
                The back wall of the tub sits at z-10 behind the companion.
                The front rim & bubbly water sits at z-25 in front of pet's paws,
                so the animal is genuinely sitting INSIDE the tub! */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 sm:w-76 h-28 rounded-t-[42px] bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#cbd5e1] border-t-4 border-l-2 border-r-2 border-slate-300 shadow-xl z-10 pointer-events-none dark:from-[#8fa2b5] dark:via-[#75899c] dark:to-[#4d5f72] dark:border-slate-600" />

            {/* Front Tub Wall with Water Line (Rendered in front of the pet at z-25) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 sm:w-76 h-14 rounded-t-3xl bg-gradient-to-t from-[#f8fafc] to-[#e2e8f0] border-t-4 border-sky-200 shadow-md z-25 pointer-events-none flex flex-col justify-start overflow-hidden dark:from-[#8fa2b5] dark:to-[#a3b4c6] dark:border-sky-800/70">
              {/* Warm Bubbly Water Surface Line */}
              <div className="w-full h-3 bg-gradient-to-r from-sky-300 via-sky-200 to-sky-300 flex items-center justify-around px-4">
                <Sparkles className="w-2.5 h-2.5 text-white/90" />
                <Sparkles className="w-2 h-2 text-white/80" />
                <Sparkles className="w-2.5 h-2.5 text-white/90" />
                <Sparkles className="w-2 h-2 text-white/80" />
              </div>
              {/* Soap Bar resting on Tub Rim */}
              <div className="absolute right-4 top-1 w-6 h-3 rounded-md bg-amber-200 border border-amber-300 shadow-xs" />
            </div>

            {/* Wooden bath caddy sitting in the tub, holding a bath brush, a soap
                bar and a rolled towel. Wrapped in a copy of the tub's own
                responsive geometry (w-68 sm:w-76, same centring) so it always
                tracks the tub it belongs to at any breakpoint. z-20 puts it behind
                the front rim (z-25), so the rim laps its base and it reads as
                resting inside the tub rather than pasted over it. */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 sm:w-76 h-28 z-20 pointer-events-none">
              <div className="absolute left-2 top-3 flex items-end">
                {/* Rolled towel at the back of the caddy */}
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 border border-teal-500 shadow-xs -translate-y-1" />
                {/* Caddy tray the items rest in */}
                <div className="relative w-12 h-2.5 rounded-sm bg-gradient-to-b from-amber-600 to-amber-800 border border-amber-900 shadow-sm">
                  {/* Tray slats */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-amber-900/50" />
                </div>
                {/* Bath brush, leaning out of the tray (Lucide icon) */}
                <div className="absolute left-1 -top-3 flex flex-col items-center">
                  <Brush className="w-2.5 h-2.5 text-amber-700" />
                  <div className="w-0.5 h-2 rounded-full bg-amber-700" />
                </div>
                {/* Soap bar in the tray */}
                <div className="absolute left-7 -top-1.5 w-3 h-1.5 rounded-sm bg-gradient-to-b from-pink-200 to-pink-300 border border-pink-400 shadow-xs" />
              </div>
            </div>

            {/* Wall-hung pet blower on the left, nozzle pointing at the pet */}
            <PetBlower isRunning={isBlowerRunning} />

            <ScenePlaceRail
              activeRoom={activeRoom}
              isGamesOpen={showGamesModal}
              revealedPlace={revealedPlace}
              onReveal={setRevealedPlace}
              onSelectRoom={setActiveRoom}
              onOpenGames={() => setShowGamesModal(true)}
            />
          </div>
        )}

        {/* =========================================================
            ROOM 3: BEDROOM WITH REALISTIC COZY BED, LAMP TABLE & MOON WINDOW
            ========================================================= */}
        {activeRoom === 'bedroom' && (
          <div
            className={`absolute inset-0 transition-colors duration-700 flex flex-col justify-between overflow-hidden ${
              stats.isSleeping
                ? 'bg-gradient-to-b from-[#050b1a] via-[#0d1633] to-[#131f47]'
                : 'bg-gradient-to-b from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe] dark:from-[#1b122c] dark:to-[#120a1f]'
            }`}
          >
            {/* Arched Window with Moon & Stars */}
            <div className="absolute top-4 left-6 w-20 h-28 rounded-t-full border-2 border-indigo-300/70 bg-[#090f26] overflow-hidden shadow-inner z-10">
              <Moon className="absolute top-3 right-3 w-4 h-4 text-amber-200" />
              <Sparkle className="absolute top-8 left-4 w-2.5 h-2.5 text-amber-200 animate-ping" />
              <Sparkle className="absolute top-14 right-5 w-2 h-2 text-amber-100 animate-pulse" />
              <div className="absolute inset-x-0 top-14 h-0.5 bg-indigo-300/40" />
              <div className="absolute inset-y-0 left-10 w-0.5 bg-indigo-300/40" />
            </div>

            {/* Vintage Bedside Lamp on a Lamp Table, standing on the floor to
                the LEFT of the pet (who sleeps centre-stage on the bed).

                Placement notes, since this scene is fully hand-positioned:
                  - `bottom-6` + `left-3/sm:left-5` puts the table's feet inside
                    the hardwood floor band (the floor is the bottom 72px), so it
                    reads as standing on the floor rather than floating.
                  - The whole group is TALLER than the gap between the floor and
                    the arched window above, which is why the label sits on TOP of
                    the lamp instead of below the table: below the table there is
                    no room left before the scene's bottom edge clips it.
                  - `z-30` (bed is z-10, sleep quilt z-25) is load-bearing, not
                    cosmetic: the bed is 256-288px wide and centred, so on a
                    ~360px stage its left edge reaches x≈52 and overlaps this
                    table. Above the bed, the lamp is never clipped and its click
                    target is never covered. The bed is `pointer-events-none`.
                  - The place rail is z-30 too, but it lives on the far right
                    (`right-1.5 sm:right-3`), so the two never collide. */}
            <div className="absolute bottom-6 left-3 sm:left-5 z-30 flex flex-col items-center">
              <button
                onClick={handleToggleBed}
                className="flex flex-col items-center cursor-pointer group"
                title="Click to toggle sleep & lamp"
              >
                <span className="text-[10px] font-bold text-amber-950 dark:text-amber-200 mb-1 bg-white/80 dark:bg-[#0b1411]/60 px-2 py-0.5 rounded-full shadow-xs inline-flex items-center gap-1 whitespace-nowrap">
                  {stats.isSleeping ? (
                    <>
                      Turn Lamp On
                      <Sun className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Sleep Lamp
                      <Moon className="w-3 h-3" />
                    </>
                  )}
                </span>

                {/* Lamp — sits directly on the table top, so its base is the
                    table's upper surface rather than a free-floating disc. */}
                <div className="flex flex-col items-center">
                  {/* Lampshade */}
                  <div
                    className={`w-14 h-9 rounded-t-sm transition-all ${
                      stats.isSleeping
                        ? 'bg-amber-950/70 border border-amber-950 text-slate-400'
                        : 'bg-amber-300 border-2 border-amber-400 shadow-[0_0_26px_#fde047]'
                    }`}
                    style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                  />
                  {/* Stem */}
                  <div className="w-1.5 h-5 bg-amber-800" />
                  {/* Lamp foot, resting on the table top */}
                  <div className="w-8 h-1.5 rounded-sm bg-amber-900 border border-amber-950/60" />
                </div>

                {/* Lamp table — top slab, then the cabinet with its drawer */}
                <div className="w-16 h-2 rounded-sm bg-gradient-to-b from-amber-500 to-amber-700 border border-amber-950 shadow-sm" />

                <div className="w-14 h-14 rounded-b-md bg-gradient-to-b from-amber-600 to-amber-800 border-x border-b border-amber-950 shadow-md relative">
                  {/* Drawer face + pull */}
                  <div className="absolute inset-x-1.5 top-2 h-4 rounded-sm bg-amber-700/60 border border-amber-900/60" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-5 h-1 rounded-full bg-amber-300/90" />
                </div>
              </button>
            </div>

            {/* Hardwood Bedroom Floor at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-18 bg-gradient-to-b from-[#5c3a21] to-[#3a2212] border-t-2 border-[#7c4d28]" />

            {/* Cozy Bedside Rug */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-60 h-14 rounded-full bg-indigo-200/50 border border-indigo-300 shadow-inner z-10" />

            {/* REALISTIC WOODEN BED (Backboard & Mattress at z-10) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 sm:w-72 h-32 rounded-t-3xl bg-gradient-to-t from-[#312e81] to-[#4338ca] border-t-4 border-indigo-300 shadow-xl z-10 flex flex-col items-center justify-start pt-2 pointer-events-none">
              {/* Fluffy Pillow */}
              <div className="w-40 h-8 rounded-full bg-white/95 border border-indigo-200 shadow-sm dark:bg-[#c7d2fe]/85 dark:border-indigo-400/40" />
            </div>

            {/* When Pet is Sleeping: Warm Quilt Blanket Over Body (z-25) */}
            {stats.isSleeping && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 sm:w-72 h-18 rounded-t-3xl bg-gradient-to-t from-[#1e1b4b] to-[#3730a3] border-t-4 border-indigo-200 shadow-2xl z-25 pointer-events-none flex flex-col items-center pt-1">
                {/* Blanket Pattern Trim */}
                <div className="w-full h-3 bg-indigo-300/30 border-b border-indigo-200/40" />
                <span className="mt-2 text-[10px] text-indigo-200 font-bold inline-flex items-center gap-1">
                  Tucked in &bull; Sleeping soundly
                  <Bed className="w-3 h-3" />
                </span>
              </div>
            )}

            <ScenePlaceRail
              activeRoom={activeRoom}
              isGamesOpen={showGamesModal}
              revealedPlace={revealedPlace}
              onReveal={setRevealedPlace}
              onSelectRoom={setActiveRoom}
              onOpenGames={() => setShowGamesModal(true)}
            />
          </div>
        )}

        {/* =========================================================
            ROOM 4: OUTSIDE MEADOW / STORMY RAIN ("THE OUTSIDE ITS STORMY SO SAD")
            ========================================================= */}
        {activeRoom === 'outside' && (
          <div
            className={`absolute inset-0 transition-colors duration-700 flex flex-col justify-between overflow-hidden ${
              isOutsideStormy
                ? 'bg-gradient-to-b from-[#1e293b] via-[#334155] to-[#142e20]'
                : 'bg-gradient-to-b from-[#bae6fd] via-[#7dd3fc] to-[#86efac] dark:from-[#0d2818] dark:to-[#1a4a28]'
            }`}
          >
            {/* Season control: two separate icon buttons instead of one toggle.
                Both stay in place at all times; only the active one is filled, so
                choosing a season never shifts the other control. */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
              {(
                [
                  { id: 'rainy', label: 'Rainy season', icon: CloudRain },
                  { id: 'sunny', label: 'Sunny season', icon: Sun },
                ] as const
              ).map((season) => {
                const SeasonIcon = season.icon;
                const isActive = isOutsideStormy === (season.id === 'rainy');
                return (
                  <button
                    key={season.id}
                    type="button"
                    onClick={() => setIsOutsideStormy(season.id === 'rainy')}
                    aria-pressed={isActive}
                    aria-label={season.label}
                    title={season.label}
                    className={`h-8 w-8 flex items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-[#0b1411]/50 hover:bg-[#0b1411]/70 text-white/80 border-white/20'
                    }`}
                  >
                    <SeasonIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Stormy Raindrop Simulation */}
            {isOutsideStormy && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-30, 360], x: [0, -25] }}
                    transition={{
                      duration: 0.55 + (i % 5) * 0.1,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: (i % 8) * 0.08,
                    }}
                    className="absolute w-0.5 h-6 bg-gradient-to-b from-transparent to-sky-200/80 rounded-full"
                    style={{ left: `${(i * 4.2) % 100}%`, top: '-20px' }}
                  />
                ))}
                {/* Wet Puddle Ripples on Grass */}
                <div className="absolute bottom-10 left-12 w-20 h-4 rounded-full bg-slate-900/30 border border-sky-300/30 animate-pulse" />
                <div className="absolute bottom-6 right-16 w-24 h-5 rounded-full bg-slate-900/30 border border-sky-300/30 animate-pulse" />
              </div>
            )}

            {/* Drifting Clouds (Dark storm clouds or white fluffy clouds) */}
            <motion.div
              animate={{ x: [-50, 420] }}
              transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 left-0 flex items-center opacity-90 pointer-events-none"
            >
              <div
                className={`w-18 h-9 rounded-full shadow-xs ${
                  isOutsideStormy ? 'bg-slate-700' : 'bg-white dark:bg-[#c3d0de]'
                }`}
              />
              <div
                className={`w-12 h-12 rounded-full -ml-5 -mt-3 shadow-xs ${
                  isOutsideStormy ? 'bg-slate-800' : 'bg-white dark:bg-[#aebfd0]'
                }`}
              />
              <div
                className={`w-14 h-8 rounded-full -ml-4 shadow-xs ${
                  isOutsideStormy ? 'bg-slate-700' : 'bg-white dark:bg-[#c3d0de]'
                }`}
              />
            </motion.div>

            {/* Tree Branch on the Top Left with Swaying Leaves */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 w-44 pointer-events-none origin-top-left z-10"
            >
              <svg viewBox="0 0 160 120" className="w-full h-auto">
                <path d="M 0 0 Q 60 20 120 40" stroke="#78350f" strokeWidth="6" fill="none" />
                <circle cx="90" cy="35" r="22" fill={isOutsideStormy ? '#1e3a24' : '#22c55e'} opacity="0.9" />
                <circle cx="120" cy="45" r="18" fill={isOutsideStormy ? '#162e1c' : '#16a34a'} opacity="0.9" />
                <circle cx="70" cy="40" r="16" fill={isOutsideStormy ? '#102416' : '#15803d'} opacity="0.9" />
              </svg>
            </motion.div>

            {/* Distant Hills Layer */}
            <div className="absolute bottom-16 inset-x-0 h-36 pointer-events-none">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 80 Q 140 20 280 65 T 500 45 L 500 150 L 0 150 Z"
                  fill={isOutsideStormy ? '#1b4332' : '#4ade80'}
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Garden White Picket Fence in Midground */}
            <div className="absolute bottom-16 inset-x-6 flex justify-around pointer-events-none opacity-60 z-5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-10 bg-white dark:bg-[#aebfd0] border border-slate-300 dark:border-slate-600 rounded-t-sm"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)' }}
                />
              ))}
            </div>

            {/* Foreground Lush Hill Mound with Wildflowers */}
            <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10">
              <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0 45 Q 240 5 500 35 L 500 120 L 0 120 Z"
                  fill={isOutsideStormy ? '#143422' : '#22c55e'}
                />
              </svg>
            </div>

            {/* Meadow planting. The old floating emoji flowers are replaced by a
                rooted SVG flower — it springs up after the rain has held for 5s
                and sways in the wind on a sunny day — plus static grass tufts.
                Nothing here loops unless its own effect is active. */}
            <MeadowFlower
              grown={hasFlowerGrown}
              swaying={!isOutsideStormy}
              stormy={isOutsideStormy}
            />

            {/* Grass tufts along the near edge of the mound */}
            <div className="absolute bottom-1 right-3 flex items-end gap-1 opacity-70 pointer-events-none z-15">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="w-1 rounded-t-full bg-emerald-600 dark:bg-emerald-400"
                  style={{ height: `${7 + (i % 3) * 4}px` }}
                />
              ))}
            </div>

            {/* Thrown Play Ball Animation */}
            {isBallThrown && (
              <motion.div
                initial={{ x: 40, y: 180, scale: 0.8 }}
                animate={{
                  x: [40, 160, 260],
                  y: [180, 50, 170],
                  rotate: [0, 360, 720],
                }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute z-30 pointer-events-none"
              >
                <Volleyball className="w-7 h-7 text-lime-500 drop-shadow-sm" />
              </motion.div>
            )}

            <ScenePlaceRail
              activeRoom={activeRoom}
              isGamesOpen={showGamesModal}
              revealedPlace={revealedPlace}
              onReveal={setRevealedPlace}
              onSelectRoom={setActiveRoom}
              onOpenGames={() => setShowGamesModal(true)}
            />
          </div>
        )}

        {/* =========================================================
            ROOM 5: CLINIC & WELLNESS CHECK-UP (HEALTH & RECOVERY)
            ========================================================= */}
        {activeRoom === 'clinic' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] dark:from-[#062c20] dark:to-[#041a13] flex flex-col justify-between overflow-hidden">
            {/* Health status, centre-left. The old "Sanctuary Clinic" card and the
                stethoscope / note icons are gone; the pet's live health reading
                now lives here as a wall-mounted vitals panel, styled with a
                bezel and a bracket so it belongs to the clinic wall. Reads the
                same stats.health as before. */}
            <div className="absolute top-3 left-[26%] z-10">
              {/* Mounting bracket behind the panel */}
              <div className="absolute -bottom-1 left-3 w-1 h-2 rounded-full bg-emerald-700/50" />
              <div className="relative w-40 sm:w-48 rounded-xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border-2 border-slate-400 shadow-md p-2">
                {/* Screen */}
                <div className="rounded-lg bg-gradient-to-br from-emerald-950 to-emerald-900 border border-emerald-700/70 px-2 py-1.5 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300/90">
                      Health Status
                    </span>
                    <span className="ml-auto text-[11px] font-black text-emerald-300 tabular-nums">
                      {stats.health}%
                    </span>
                  </div>
                  {/* Vitals bar, driven by the same stats.health value */}
                  <div className="mt-1 h-1.5 w-full rounded-full bg-emerald-950 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                      animate={{ width: `${stats.health}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                {/* Bezel controls so the panel reads as a fitted device */}
                <div className="mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-auto text-[7px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Sanctuary Vitals
                  </span>
                </div>
              </div>
            </div>

            {/* Clinic Floor */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-b from-[#256049] to-[#047857] border-t-4 border-emerald-600 shadow-inner" />

            {/* First-aid / medical kit standing on the clinic floor at the left.
                Replaces the old card. Built as a real case — lid seam, handle,
                two clasps, cross emblem — resting on a contact shadow so it sits
                on the floorboards instead of floating over them. */}
            <div className="absolute left-4 bottom-16 z-10">
              {/* Contact shadow grounding the case to the floor */}
              <div className="absolute -bottom-1 left-0 w-full h-2 rounded-full bg-emerald-950/45 blur-[2px]" />
              <div className="relative w-20">
                {/* Carry handle */}
                <div className="mx-auto w-9 h-2.5 rounded-t-lg border-2 border-b-0 border-rose-800 bg-rose-200" />
                {/* Case body */}
                <div className="relative rounded-lg bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 border-2 border-rose-500 shadow-md px-1.5 pt-2 pb-1.5">
                  {/* Lid seam */}
                  <div className="absolute inset-x-0 top-4 h-px bg-rose-500/60" />
                  {/* Cross emblem, the kit's own marking */}
                  <div className="flex items-center justify-center h-7">
                    <div className="relative w-6 h-6">
                      <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 rounded-sm bg-white shadow-sm" />
                      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-sm bg-white shadow-sm" />
                    </div>
                  </div>
                  {/* Clasps */}
                  <div className="mt-1 flex justify-around">
                    <span className="w-2 h-1.5 rounded-sm bg-rose-600/80" />
                    <span className="w-2 h-1.5 rounded-sm bg-rose-600/80" />
                  </div>
                </div>
              </div>
              {/* Kit label — a Lucide medical case icon, since one exists */}
              <div className="mt-1 flex items-center justify-center gap-1 text-white-900/80">
                <BriefcaseMedical className="w-3 h-3" />
                <span className="text-[7px] font-black uppercase tracking-wider">
                  Medical Kit
                </span>
              </div>
            </div>

            {/* Clean Medical Examination Mat under pet */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full bg-white/90 dark:bg-emerald-900/80 border border-emerald-400/60 shadow-md z-10 flex items-center justify-center">
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1">
                <Sparkle className="w-2.5 h-2.5" />
                Examination Table
                <Sparkle className="w-2.5 h-2.5" />
              </span>
            </div>

            <ScenePlaceRail
              activeRoom={activeRoom}
              isGamesOpen={showGamesModal}
              revealedPlace={revealedPlace}
              onReveal={setRevealedPlace}
              onSelectRoom={setActiveRoom}
              onOpenGames={() => setShowGamesModal(true)}
            />
          </div>
        )}

        {/* =========================================================
            POU-STYLE COMPANION GROUNDED IN CENTER (NOT FLOATING!)
            ========================================================= */}
        <div
          ref={petAreaRef}
          style={{
            // Normally dead-centre. While bathing, the pet walks over to sit under
            // the shower head, which is mounted top-right and throws water from
            // 2.25rem to 5.75rem in from the right edge. While the blower runs it
            // moves to the dryer's spot on the LEFT wall instead. Anchoring the
            // pet's CENTRE on those points puts the water / airflow squarely on its
            // body at every stage width, unlike a fixed percentage which would
            // drift away from the fixtures on wide screens. -translate-x-1/2 still
            // centres the pet on that point, and `left` is animatable, so the walk
            // is smooth.
            left: petSceneLeft,
          }}
          className={`absolute bottom-4 sm:bottom-6 -translate-x-1/2 z-20 flex flex-col items-center transition-[transform,left] duration-500 ease-out ${
            // A modest one-shot scale-up while consuming makes the pet easy to read.
            // Deliberately NOT raised above z-20: the served item sits inside the rug's
            // own z-10 stacking context, so lifting the pet higher would hide the food.
            // Item identity is carried above everything by the z-40 eating bubble.
            roomMood === 'eating' ? 'scale-110' : isHoveringPet ? 'scale-105' : ''
          }`}
        >
          {/* Soapy Suds on Pet */}
          {soapBubbles.map((b) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              className="absolute z-30 pointer-events-none"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <Sparkles className="w-5 h-5 text-white/95 drop-shadow-sm" />
            </motion.div>
          ))}

          {/* Real-time Pet Reaction & Emotional Feeling Bubble (User Request: Drag Feedback & Emotions) */}
          <AnimatePresence>
            {activeDragItem && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                className="absolute -top-16 z-40 bg-white/95 dark:bg-[#182a22]/95 px-3.5 py-1.5 rounded-2xl border border-emerald-400/60 shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-none whitespace-nowrap"
              >
                <span className="text-emerald-600 dark:text-emerald-300 animate-bounce">
                  {isHoveringPet ? (
                    <Smile className="w-5 h-5" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black text-emerald-950 dark:text-emerald-50 inline-flex items-center gap-1">
                    {isHoveringPet ? (
                      <>
                        Subuan mo na ako ng {activeDragItem.name}!
                        <Utensils className="w-3 h-3 shrink-0" />
                        <Sparkle className="w-2.5 h-2.5 shrink-0" />
                      </>
                    ) : (
                      <>
                        *Sniff sniff...* Amoy {activeDragItem.name}!
                        <Droplet className="w-3 h-3 shrink-0" />
                      </>
                    )}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    {isHoveringPet ? 'Bitawan dito para kainin!' : 'I-drag palapit sa akin'}
                    <PawPrint className="w-2.5 h-2.5 shrink-0" />
                  </span>
                </div>
                {/* Speech bubble arrow pointer */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#182a22] border-b-2 border-r-2 border-emerald-400 rotate-45" />
              </motion.div>
            )}

            {roomMood === 'eating' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8 }}
                className={`absolute -top-14 z-40 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-2 pointer-events-none whitespace-nowrap ${
                  consumedItem?.kind === 'drink'
                    ? 'bg-gradient-to-r from-sky-500 to-teal-500 border-sky-300'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300'
                }`}
              >
                {/* Name the item actually being consumed, never a hardcoded fish */}
                <ConsumedIcon className="w-4 h-4 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  {consumedItem?.kind === 'drink' ? (
                    <>
                      *Lap lap lap!* Inuman ng {consumedItem.name}!
                      <Droplet className="w-3.5 h-3.5 shrink-0" />
                    </>
                  ) : consumedItem ? (
                    <>
                      *Crunch crunch!* Sarap ang {consumedItem.name}!
                      <Smile className="w-3.5 h-3.5 shrink-0" />
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                    </>
                  ) : (
                    <>
                      *Crunch crunch nom nom!* Ang sarap!
                      <Smile className="w-3.5 h-3.5 shrink-0" />
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                </span>
              </motion.div>
            )}

            {roomMood === 'bathing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: .8, y: -8 }}
                className="absolute -top-14 z-40 bg-gradient-to-r from-sky-500 to-teal-500 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-2 border-sky-300 pointer-events-none whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="inline-flex items-center gap-1">
                  Mabangong ligo! Tanggal pagod!
                  <Heart className="w-3.5 h-3.5 shrink-0" />
                </span>
              </motion.div>
            )}

            {/* Drying reaction bubble, shown only while the blower is running */}
            {isBlowerRunning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8 }}
                className="absolute -top-14 z-40 bg-gradient-to-r from-cyan-500 to-sky-500 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-2 border-cyan-300 pointer-events-none whitespace-nowrap"
              >
                <Wind className="w-3.5 h-3.5 shrink-0" />
                <span>Tufty at na buhok ni {companionName}!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The pet is wrapped in its own motion group so the airflow can shake
              it independently of the container's own centring and eating-scale
              transforms — otherwise the two would fight over `transform`.
              The shake is a short repeat ONLY while the blower runs; otherwise it
              settles to rest, so nothing keeps moving after the blow ends.
              The one-shot shake-off after a rinse uses the same group: a dog
              shakes its whole body, a cat only flicks. */}
          <motion.div
            className="flex flex-col items-center"
            animate={
              isBlowerRunning
                ? {
                    rotate: [0, 2.5, -2.5, 1.5, 0],
                    x: [0, -3, 3, -1, 0],
                    y: [0, -1.5, 0, -0.5, 0],
                  }
                : isShakingOff
                ? {
                    rotate: [0, 9, -9, 7, -7, 3, 0].map((v) => v * shakeStrength),
                    x: [0, -4, 4, -3, 3, -1, 0].map((v) => v * shakeStrength),
                    y: [0, -1, 0, -1, 0, 0, 0],
                  }
                : { rotate: 0, x: 0, y: 0 }
            }
            transition={
              isBlowerRunning
                ? { duration: 0.44, repeat: Infinity, ease: 'easeInOut' }
                : isShakingOff
                ? { duration: 0.9, ease: 'easeInOut' }
                : { duration: 0.28, ease: 'easeOut' }
            }
          >
            <CuteCompanion
              species={species}
              mood={displayMood}
              equipped={equipped}
              size="lg"
              interactive={true}
              showBowl={activeRoom === 'kitchen' || roomMood === 'eating'}
              isEating={roomMood === 'eating'}
              isSniffing={
                (activeDragItem !== null &&
                  (activeDragItem.type === 'food' ||
                    activeDragItem.type === 'drink' ||
                    isHoveringPet)) ||
                isSniffingServed
              }
              consumedItemIcon={consumedItem?.icon}
              consumedItemKind={consumedItem?.kind}
              onPet={() => {
                if (stats.isSleeping) {
                  showToast(
                    <>
                      {companionName} is sleeping soundly...
                      <Bed className="w-3.5 h-3.5 shrink-0" />
                    </>
                  );
                  return;
                }
                setRoomMood('happy');
                onUpdateStats({ happiness: Math.min(100, stats.happiness + 5) });
                showToast(
                  <>
                    {companionName} purrs happily!
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                  </>
                );
                setTimeout(() => setRoomMood('idle'), 1800);
              }}
            />
          </motion.div>

          {/* Companion Name Tag (Clean & Proportionate) */}
        </div>

        {/* Drop Instruction Hint */}

        {/* Interaction Toast Alert */}
        <AnimatePresence>
          {interactionToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-950/95 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-emerald-700/50 pointer-events-none whitespace-nowrap inline-flex items-center justify-center gap-1"
            >
              {interactionToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/60 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5">
              <PantryIcon className="w-3.5 h-3.5" />
              {pantryTitle}
            </span>
          </span>
          {/* Shop button — same onOpenMarket navigation as the old "Market" text
              button, presented as a single icon in the scene's visual language. */}
          <button
            type="button"
            onClick={onOpenMarket}
            aria-label="Shop"
            title="Shop"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/95 dark:bg-emerald-950/90 border border-emerald-200 dark:border-[#2d4d41]/75 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
          </button>
        </div>

        {/* Room Specific Draggables */}
        {activeRoom === 'kitchen' && (
          <div className="flex flex-col gap-3">
            {/* Feeding Note */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2">
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>Drag food or a drink onto {companionName} to serve it, or tap Serve below!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {kitchenItems.map((item) => {
                const count = inventory[item.inventoryKey] || 0;
                const isOutOfStock = count <= 0;
                const FoodIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isOutOfStock
                        ? 'bg-white dark:bg-[#182a22] border-emerald-100/60 dark:border-emerald-900/40 opacity-70'
                        : 'bg-white dark:bg-[#182a22] border-emerald-200 dark:border-emerald-800/60 shadow-2xs hover:border-emerald-400 hover:shadow-xs'
                    }`}
                  >
                    <motion.div
                      drag={!isOutOfStock}
                      dragSnapToOrigin
                      whileDrag={{ scale: 1.25, zIndex: 50 }}
                      onPointerDown={() => {
                        // A new interaction starts: drop any stale drag flag.
                        dragJustHappenedRef.current = false;
                      }}
                      onDragStart={() => {
                        setActiveDragItem(item);
                        dragJustHappenedRef.current = true;
                      }}
                      onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
                      onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                      onClick={() => handleKitchenItemTap(item, isOutOfStock)}
                      role="button"
                      tabIndex={isOutOfStock ? -1 : 0}
                      onKeyDown={(e) => {
                        if (isOutOfStock) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleKitchenItemTap(item, isOutOfStock);
                        }
                      }}
                      aria-label={`Serve ${item.name}`}
                      className={`relative flex flex-col items-center touch-none w-full ${
                        isOutOfStock ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      {/* Food Picture with Stock Badge */}
                      <div className="relative w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center mb-1.5">
                        <FoodIcon className={`w-7 h-7 ${item.color}`} />
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center leading-none shadow-sm border-2 border-white dark:border-[#182a22]">
                          x{count}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        +{item.xp} XP
                      </span>
                    </motion.div>

                    {/* Direct Feed / Restock Button */}
                    {isOutOfStock ? (
                      <button
                        onClick={onOpenMarket}
                        className="mt-2 w-full py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-900/50 text-slate-600 dark:text-slate-300 font-bold text-[10px] cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleKitchenItemTap(item, isOutOfStock)}
                        className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-[10px] shadow-xs cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Serve</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vet-Approved Nutrition Safety Card */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300">
              <Shield className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold">
                  {species === 'dog' ? 'Vet-Approved Canine Nutrition' : 'Vet-Approved Feline Nutrition'}
                </span>
                <span className="text-[10px] opacity-85">
                  {species === 'dog'
                    ? '100% canine-safe protein, biscuits, and apples. Chocolate, grapes, and onions are strictly excluded.'
                    : '100% feline-safe steamed fish, kibble, and catnip. Coconut, chocolate, and cow milk are strictly excluded.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeRoom === 'bathroom' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              // No `icon` on any of these: each renders a real Lucide glyph below.
              { id: 'soap', name: 'Bath Soap', type: 'soap' as const, inventoryKey: 'soap' as keyof Inventory },
              { id: 'shower', name: 'Rinse Shower', type: 'shower' as const },
              { id: 'blower', name: 'Pet Blower', type: 'blower' as const },
            ].map((item) => {
              // Every bathroom item renders a real Lucide glyph — no emoji. The
              // old sponge has been replaced outright by the pet blower.
              const ItemIcon = BATHROOM_ITEM_ICONS[item.id];
              return (
              <motion.div
                key={item.id}
                drag
                dragSnapToOrigin
                whileDrag={{ scale: 1.25, zIndex: 50 }}
                onDragStart={() => setActiveDragItem(item)}
                onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
                onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50/80 dark:bg-[#182a22] border border-sky-200 dark:border-sky-900/50 cursor-grab active:cursor-grabbing shadow-2xs hover:bg-sky-100 transition-colors touch-none"
              >
                <ItemIcon className="w-7 h-7 mb-1 text-sky-600 dark:text-sky-300" />
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {item.name}
                </span>
                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold">
                  {item.inventoryKey ? `x${inventory[item.inventoryKey] || 0}` : 'Unlimited'}
                </span>
              </motion.div>
              );
            })}
          </div>
        )}

        {activeRoom === 'bedroom' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tea',
                  name: 'Bedtime Chamomile',
                  icon: Leaf,
                  type: 'drink',
                  inventoryKey: 'herbalTea',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tea',
                  name: 'Bedtime Chamomile',
                  icon: Leaf,
                  type: 'drink',
                  inventoryKey: 'herbalTea',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <Leaf className="w-7 h-7 mb-1 text-teal-600 dark:text-teal-300" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Chamomile Tea
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                x{inventory.herbalTea || 0}
              </span>
            </motion.div>

            <button
              onClick={handleToggleBed}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 cursor-pointer shadow-2xs hover:bg-indigo-100"
            >
              {stats.isSleeping ? (
                <Sun className="w-7 h-7 mb-1 text-amber-500 dark:text-amber-300" />
              ) : (
                <Moon className="w-7 h-7 mb-1 text-indigo-500 dark:text-indigo-300" />
              )}
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                {stats.isSleeping ? 'Turn Lamp On (Wake)' : 'Bedside Lamp (Sleep)'}
              </span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                {stats.isSleeping ? 'Sleeping peacefully' : 'Dim lights to rest'}
              </span>
            </button>
          </div>
        )}

        {activeRoom === 'outside' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'ball',
                  name: 'Tennis Ball',
                  icon: Volleyball,
                  type: 'toy',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'ball',
                  name: 'Tennis Ball',
                  icon: Volleyball,
                  type: 'toy',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <Volleyball className="w-7 h-7 mb-1 text-lime-600 dark:text-lime-400" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Drag to Throw Ball
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                Play in rain or sun!
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tea',
                  name: 'Herbal Tea',
                  icon: Leaf,
                  type: 'drink',
                  inventoryKey: 'herbalTea',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tea',
                  name: 'Herbal Tea',
                  icon: Leaf,
                  type: 'drink',
                  inventoryKey: 'herbalTea',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <Leaf className="w-7 h-7 mb-1 text-teal-600 dark:text-teal-300" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Warm Tea
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                x{inventory.herbalTea || 0}
              </span>
            </motion.div>
          </div>
        )}

        {activeRoom === 'clinic' && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'thermometer',
                  name: 'Clinical Thermometer',
                  icon: Thermometer,
                  type: 'thermometer',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'thermometer',
                  name: 'Clinical Thermometer',
                  icon: Thermometer,
                  type: 'thermometer',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <Thermometer className="w-7 h-7 mb-1 text-rose-600 dark:text-rose-300" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Thermometer
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                Check Health
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'meds',
                  name: 'Vitamins',
                  icon: Pill,
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'meds',
                  name: 'Vitamins',
                  icon: Pill,
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <Pill className="w-7 h-7 mb-1 text-emerald-600 dark:text-emerald-300" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Vitamins
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                x{inventory.medicine || 0}
              </span>
            </motion.div>

            <motion.div
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() =>
                setActiveDragItem({
                  id: 'tonic',
                  name: 'Herbal Tonic',
                  icon: FlaskConical,
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              onDrag={(e, info) => setIsHoveringPet(checkHitPet(info.point.x, info.point.y))}
              onDragEnd={(e, info) =>
                handleDragEnd(e, info, {
                  id: 'tonic',
                  name: 'Herbal Tonic',
                  icon: FlaskConical,
                  type: 'medicine',
                  inventoryKey: 'medicine',
                })
              }
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 cursor-grab active:cursor-grabbing shadow-2xs touch-none"
            >
              <FlaskConical className="w-7 h-7 mb-1 text-cyan-600 dark:text-cyan-300" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Healing Tonic
              </span>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-semibold">
                Cures Sickness
              </span>
            </motion.div>
          </div>
        )}
      </div>

      {/* =========================================================
          MINDFUL MINI-GAMES MODAL (Triggered from Room Dock)
          ========================================================= */}
      <AnimatePresence>
        {showGamesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b1411]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#182a22] rounded-3xl border border-emerald-200/80 dark:border-emerald-800/70 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 bg-emerald-50 dark:bg-[#182a22] border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-emerald-100">
                    Mindful Mini-Games
                  </h3>
                </div>

                <button
                  onClick={() => setShowGamesModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-500 dark:text-emerald-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-4 overflow-y-auto">
                <WellnessMiniGames
                  species={species}
                  companionName={companionName}
                  onAddPoints={onAddPoints}
                  onBoostHappiness={(amt) =>
                    onUpdateStats({ happiness: Math.min(100, stats.happiness + amt) })
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};