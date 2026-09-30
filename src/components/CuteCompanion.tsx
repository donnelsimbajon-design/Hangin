import React, { useState, useEffect, useId } from 'react';
import { motion } from 'motion/react';
import {
  PetSpecies,
  PetAnimationMood,
  EquippedAccessories,
  HatId,
  ClothingId,
} from '../types';

interface CuteCompanionProps {
  species: PetSpecies;
  mood?: PetAnimationMood | 'excited' | string;
  equipped?: EquippedAccessories;
  interactive?: boolean;
  onPet?: () => void;
  className?: string;
  /** `avatar` is a small, self-contained size for the community post/comment
      headers. Same art, same wardrobe renderers — only the box is smaller, so
      an avatar can never drift from the companion it is meant to represent. */
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'avatar';
  showBowl?: boolean;
  isEating?: boolean;
  isSniffing?: boolean;
  /** Lucide glyph for the exact food/drink being consumed, so the mark matches
      the item the user actually served. Avoids a hardcoded species snack. */
  consumedItemIcon?: React.ElementType<{ className?: string }>;
  /** Pins the mascot to the flat 2D illustration and hides the 3D toggle.
      Opt-in, so surfaces that still want the 3D canvas keep the default. */
  force2D?: boolean;
  /** Distinguishes lapping (drink) from chewing (food). */
  consumedItemKind?: 'food' | 'drink';
}

/**
 * Per-mood idle drift for the 2D mascot: a slow float, a heavy sink, a
 * worried sway. Every entry is a gentle loop — the pet should read as
 * breathing, never as a spinner.
 */
const MOOD_DRIFT: Record<
  string,
  { y: number[]; rotate: number[]; duration: number }
> = {
  idle: { y: [0, -2, 0], rotate: [0, 0.6, -0.6, 0], duration: 3.2 },
  listening: { y: [0, -4, 0], rotate: [0, 1, -1, 0], duration: 2.1 },
  happy: { y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0], duration: 0.95 },
  excited: { y: [0, -18, 0], rotate: [0, -3, 3, 0], duration: 0.5 },
  loving: { y: [0, -7, 0], rotate: [0, 2, -2, 0], duration: 1.1 },
  curious: { y: [0, -5, 0], rotate: [0, 4, -4, 0], duration: 1.7 },
  anxious: { y: [0, -3, 0], rotate: [0, -2.5, 2.5, 0], duration: 1.5 },
  overwhelmed: { y: [0, -3, 0], rotate: [0, -2.5, 2.5, 0], duration: 1.5 },
  serious: { y: [0, -1, 0], rotate: [0, -1, 1, 0], duration: 3 },
  angry: { y: [0, -1, 0], rotate: [0, -1, 1, 0], duration: 3 },
  calm: { y: [0, -3, 0], rotate: [0, 0.8, -0.8, 0], duration: 4.2 },
  peaceful: { y: [0, -3, 0], rotate: [0, 0.8, -0.8, 0], duration: 4.2 },
  sad: { y: [0, 2, 0], rotate: [0, -1.2, 1.2, 0], duration: 3.4 },
  lonely: { y: [0, 2, 0], rotate: [0, -1.2, 1.2, 0], duration: 3.4 },
  crying: { y: [0, 3, 0], rotate: [0, -2, 2, -1, 0], duration: 2.2 },
  tired: { y: [0, 3, 0], rotate: [0, 1, -1, 0], duration: 5 },
  sleeping: { y: [0, 2, 0], rotate: [0, 0, 0], duration: 3.2 },
};

/** Eating / drinking / sniffing motion: the pet dips toward its bowl on every
    bite, laps more slowly for a drink, and leans in with a small nose-bob when
    food is dragged close. */
const EAT_DRIFT = {
  food: { y: [4, 15, 6, 15, 4], rotate: [2, 7, 3, 7, 2], duration: 0.6 },
  drink: { y: [6, 16, 6], rotate: [3, 8, 3], duration: 0.9 },
  sniff: { y: [0, 4, 0, 4, 0], rotate: [0, 3, 0, 3, 0], duration: 0.7 },
};

/**
 * Expression overlay drawn over the mascot's eyes. Both species place their
 * eyes at roughly y≈80, x≈79/121, so a single overlay fits dog and cat.
 * Tears animate on a wrapping <g> so we only ever animate a transform —
 * never a geometry attribute.
 */
const PetExpression: React.FC<{
  crying: boolean;
  downhearted: boolean;
  loving: boolean;
  tired: boolean;
  worried: boolean;
  serious: boolean;
  confused: boolean;
}> = ({ crying, downhearted, loving, tired, worried, serious, confused }) => {
  const showsBrow = worried || serious || downhearted;
  return (
    <g pointerEvents="none">
      {/* Brows — the pet looks concerned with you, not at you */}
      {showsBrow && (
        <g stroke="#3A200A" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.8">
          {downhearted ? (
            <>
              {/* inner ends lifted — the classic "I'm worried about you" brow */}
              <path d="M 70 69 Q 79 63 89 67" />
              <path d="M 130 69 Q 121 63 111 67" />
            </>
          ) : serious ? (
            <>
              {/* lowered, flat, serious */}
              <path d="M 70 68 L 89 73" />
              <path d="M 130 68 L 111 73" />
            </>
          ) : (
            <>
              <path d="M 70 70 Q 79 66 89 69" />
              <path d="M 130 70 Q 121 66 111 69" />
            </>
          )}
        </g>
      )}

      {/* Tears — the pet visibly feels it too */}
      {downhearted &&
        ([-1, 1] as const).map((side) => (
          <motion.g
            key={side}
            animate={
              crying
                ? { y: [0, 20, 20], opacity: [0, 0.95, 0] }
                : { y: [0, 9], opacity: [0.8, 0] }
            }
            transition={{
              duration: crying ? 1.5 : 3.6,
              repeat: Infinity,
              ease: 'easeIn',
              delay: side > 0 ? (crying ? 0.4 : 0.7) : 0,
            }}
          >
            <ellipse
              cx={100 + side * 21}
              cy={86}
              rx={crying ? 3.4 : 2.6}
              ry={crying ? 5 : 3.8}
              fill="#7DD3FC"
              stroke="#38BDF8"
              strokeWidth="0.8"
            />
          </motion.g>
        ))}

      {/* A single slow blink-squeeze of relief when the user is tender */}
      {loving &&
        ([-1, 1] as const).map((side) => (
          <motion.g
            key={side}
            animate={{ y: [0, -16, -16], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: side > 0 ? 0.5 : 0,
            }}
          >
            <text
              x={100 + side * 24}
              y={70}
              fontSize="13"
              textAnchor="middle"
              fill="#FB7185"
              opacity="0.9"
            >
              ♥
            </text>
          </motion.g>
        ))}

      {/* Drowsy lids */}
      {tired && (
        <g stroke="#3A200A" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M 70 78 Q 80 72 90 78" />
          <path d="M 110 78 Q 120 72 130 78" />
        </g>
      )}

      {/* A small "?" — the pet is thinking it over with you */}
      {confused && (
        <motion.g
          animate={{ y: [0, -4, 0], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <text
            x="137"
            y="54"
            fontSize="19"
            fontWeight="bold"
            textAnchor="middle"
            fill="#0F766E"
            opacity="0.8"
          >
            ?
          </text>
        </motion.g>
      )}
    </g>
  );
};

/** Chewing jaw for food, lapping tongue for a drink. Drawn in the same 200×200
    viewBox as the rest of the face, at the mouth position of each species. */
const EatingMouth: React.FC<{ cx: number; cy: number; drinking: boolean }> = ({
  cx,
  cy,
  drinking,
}) =>
  drinking ? (
    <g>
      <path
        d={`M ${cx - 7} ${cy - 2} Q ${cx} ${cy + 2} ${cx + 7} ${cy - 2}`}
        stroke="#241408"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d={`M ${cx - 3} ${cy} Q ${cx} ${cy + 10} ${cx + 3} ${cy} Z`}
        fill="#FF6B8B"
        stroke="#E11D48"
        strokeWidth="0.8"
        style={{ transformBox: 'fill-box', transformOrigin: 'top center' }}
        animate={{ scaleY: [0.4, 1.3, 0.4] }}
        transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  ) : (
    <motion.ellipse
      cx={cx}
      cy={cy + 1}
      rx={5}
      ry={4}
      fill="#431407"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      animate={{ scaleY: [0.3, 1, 0.3], scaleX: [1.15, 0.85, 1.15] }}
      transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );

/**
 * Shared SVG wardrobe renderer for the 2D mascot.
 *
 * Both species' SVGs share the same 200×200 viewBox and near-identical body
 * geometry, so one set of paths works for both: clothing wraps the torso and
 * hats sit on the head. The groups are rendered INSIDE the pet's own <svg>,
 * alongside the ears/head/body, so they inherit the exact same drift, wag and
 * scale animation as the fur — equipped gear always follows the pet, on every
 * surface that renders a CuteCompanion.
 */
const OUTERWEAR_TORSO =
  'M 66 116 C 66 98 134 98 134 116 ' +
  'C 145 132 143 152 132 158 ' +
  'C 100 163 68 163 68 158 ' +
  'C 57 152 55 132 66 116 Z';

const PetHat: React.FC<{
  hatId: HatId | null | undefined;
}> = ({ hatId }) => {
  if (!hatId) return null;

  if (hatId === 'beanie') {
    return (
      <g>
        <path d="M 64 56 C 64 30 136 30 136 56 Z" fill="#4F46E5" stroke="#3730A3" strokeWidth="2" />
        <circle cx="100" cy="30" r="7" fill="#818CF8" />
      </g>
    );
  }

  if (hatId === 'salakot') {
    return (
      <g>
        <path d="M 46 54 Q 100 26 154 54 Q 100 64 46 54 Z" fill="#E0A85C" stroke="#9C6B3E" strokeWidth="2" />
        <circle cx="100" cy="26" r="4" fill="#B9793A" />
      </g>
    );
  }

  if (hatId === 'cap') {
    return (
      <g>
        {/* Denim crown */}
        <path d="M 62 56 C 62 30 138 30 138 56 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
        {/* Top button */}
        <circle cx="100" cy="31" r="4" fill="#3B82F6" />
        {/* Curved visor */}
        <path d="M 118 50 Q 152 44 166 56 Q 152 66 118 60 Z" fill="#1D4ED8" stroke="#172554" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Stitch line */}
        <path d="M 64 54 Q 100 60 136 54" stroke="#93C5FD" strokeWidth="1.2" fill="none" strokeDasharray="3 3" opacity="0.7" />
      </g>
    );
  }

  if (hatId === 'bucketHat') {
    return (
      <g>
        {/* Crown */}
        <path d="M 70 54 C 70 34 130 34 130 54 Z" fill="#D2BE93" stroke="#987F58" strokeWidth="2" />
        {/* Downturned wide brim */}
        <path d="M 52 56 Q 100 62 148 56 Q 136 68 100 70 Q 64 68 52 56 Z" fill="#C4AE84" stroke="#987F58" strokeWidth="2" strokeLinejoin="round" />
        {/* Brim stitch */}
        <path d="M 55 58 Q 100 63 145 58" stroke="#A98E60" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
      </g>
    );
  }

  if (hatId === 'flowerCrown') {
    const petals = (
      <g fill="#F472B6" stroke="#E11D48" strokeWidth="1">
        <circle cx="6" cy="0" r="4" />
        <circle cx="-6" cy="0" r="4" />
        <circle cx="0" cy="-6" r="4" />
        <circle cx="0" cy="6" r="4" />
      </g>
    );
    return (
      <g>
        {/* Vine band */}
        <path d="M 56 57 Q 100 45 144 57" stroke="#65A30D" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Little leaves */}
        <path d="M 62 54 Q 70 48 78 51 Q 70 56 62 54 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
        <path d="M 122 51 Q 130 48 138 54 Q 130 56 122 51 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
        {/* Blossoms */}
        <g transform="translate(70 52)" opacity="0.95">{petals}</g>
        <g transform="translate(100 49)" opacity="0.95">{petals}</g>
        <g transform="translate(130 52)" opacity="0.95">{petals}</g>
        <g transform="translate(85 47) scale(0.8)" opacity="0.9">{petals}</g>
        <g transform="translate(115 47) scale(0.8)" opacity="0.9">{petals}</g>
        <circle cx="70" cy="52" r="2" fill="#FDF2F8" />
        <circle cx="100" cy="49" r="2" fill="#FDF2F8" />
        <circle cx="130" cy="52" r="2" fill="#FDF2F8" />
      </g>
    );
  }

  // adventureHat — wide explorer brim with a trail band + buckle
  return (
    <g>
      <path
        d="M 42 56 Q 100 28 158 56 Q 132 68 100 68 Q 68 68 42 56 Z"
        fill="#D6C08E"
        stroke="#9C7B4A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M 66 52 C 66 32 134 32 134 52 Z" fill="#CBB27E" stroke="#9C7B4A" strokeWidth="2" />
      {/* Trail band */}
      <path d="M 60 54 Q 100 58 140 54" stroke="#8B5A33" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Buckle */}
      <rect x="94" y="50" width="12" height="10" rx="2" fill="#FBBF24" stroke="#8B5A33" strokeWidth="1.4" />
      <line x1="100" y1="51" x2="100" y2="59" stroke="#8B5A33" strokeWidth="1.4" />
    </g>
  );
};

const PetClothing: React.FC<{
  clothing: ClothingId | null | undefined;
}> = ({ clothing }) => {
  if (!clothing) return null;

  if (clothing === 'hoodie') {
    return (
      <g>
        <path d={OUTERWEAR_TORSO} fill="#4F46E5" stroke="#3730A3" strokeWidth="2" />
        {/* Hood ring around the neck */}
        <path d="M 64 120 C 74 108 88 112 88 112 C 88 118 94 124 100 124 C 106 124 112 118 112 112 C 112 112 126 108 136 120" stroke="#6366F1" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Drawstrings peeking under the chin */}
        <path d="M 92 118 L 92 129" stroke="#E5E7EB" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 108 118 L 108 129" stroke="#E5E7EB" strokeWidth="2.2" strokeLinecap="round" />
        {/* Ribbed hem */}
        <path d="M 69 157 Q 100 162 131 157" stroke="#3730A3" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Kangaroo pocket */}
        <path d="M 82 136 Q 100 130 118 136 L 118 150 Q 100 157 82 150 Z" fill="#6366F1" stroke="#3730A3" strokeWidth="1.6" />
      </g>
    );
  }

  if (clothing === 'sweater') {
    return (
      <g>
        <path d={OUTERWEAR_TORSO} fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
        {/* Round neck ribbing */}
        <path d="M 78 122 Q 100 132 122 122" stroke="#3F6212" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Stitch details down the front */}
        <path d="M 100 128 L 100 152" stroke="#65A30D" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M 92 128 L 92 146" stroke="#65A30D" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" opacity="0.8" />
        <path d="M 108 128 L 108 146" stroke="#65A30D" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" opacity="0.8" />
        {/* Ribbed hem */}
        <path d="M 68 152 L 132 152" stroke="#3F6212" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 68 157 L 132 157" stroke="#3F6212" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
    );
  }

  if (clothing === 'raincoat') {
    return (
      <g>
        <path d={OUTERWEAR_TORSO} fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
        {/* Hood rim */}
        <path d="M 74 118 Q 100 108 126 118" stroke="#EAB308" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Front placket + buttons */}
        <line x1="100" y1="124" x2="100" y2="160" stroke="#CA8A04" strokeWidth="2" />
        <circle cx="100" cy="132" r="2.2" fill="#78350F" />
        <circle cx="100" cy="142" r="2.2" fill="#78350F" />
        <circle cx="100" cy="152" r="2.2" fill="#78350F" />
        {/* Hem */}
        <path d="M 69 153 Q 100 162 131 153" stroke="#CA8A04" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  if (clothing === 'pajamas') {
    return (
      <g>
        {/* Longer lounge romper */}
        <path
          d="M 66 116 C 66 96 134 96 134 116 C 145 132 143 160 132 166 C 100 171 68 171 68 166 C 57 160 55 132 66 116 Z"
          fill="#FB7185"
          stroke="#E11D48"
          strokeWidth="2"
        />
        {/* Collar flaps */}
        <path d="M 76 120 L 100 132 L 90 120 Z" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
        <path d="M 124 120 L 100 132 L 110 120 Z" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
        {/* Button placket */}
        <circle cx="102" cy="136" r="2" fill="#FFF1F2" stroke="#E11D48" strokeWidth="0.8" />
        <circle cx="102" cy="146" r="2" fill="#FFF1F2" stroke="#E11D48" strokeWidth="0.8" />
        <circle cx="102" cy="156" r="2" fill="#FFF1F2" stroke="#E11D48" strokeWidth="0.8" />
        {/* Dreamy dots */}
        <circle cx="80" cy="136" r="1.4" fill="#FDA4AF" />
        <circle cx="120" cy="142" r="1.4" fill="#FDA4AF" />
        <circle cx="86" cy="152" r="1.4" fill="#FDA4AF" />
      </g>
    );
  }

  if (clothing === 'explorerJacket') {
    return (
      <g>
        <path d={OUTERWEAR_TORSO} fill="#D6C08E" stroke="#A08B5E" strokeWidth="2" />
        {/* Collar */}
        <path d="M 70 118 L 90 126 L 96 118 Z" fill="#C4AE84" stroke="#8A7448" strokeWidth="1.2" />
        <path d="M 130 118 L 110 126 L 104 118 Z" fill="#C4AE84" stroke="#8A7448" strokeWidth="1.2" />
        {/* Front zipper line */}
        <line x1="100" y1="126" x2="100" y2="156" stroke="#8A7448" strokeWidth="1.6" strokeDasharray="2 2" />
        {/* Chest pockets */}
        <rect x="72" y="132" width="18" height="13" rx="3" fill="#CBB27E" stroke="#8A7448" strokeWidth="1.2" />
        <rect x="110" y="132" width="18" height="13" rx="3" fill="#CBB27E" stroke="#8A7448" strokeWidth="1.2" />
        <line x1="72" y1="136" x2="90" y2="136" stroke="#8A7448" strokeWidth="1" />
        <line x1="110" y1="136" x2="128" y2="136" stroke="#8A7448" strokeWidth="1" />
        {/* Belt */}
        <path d="M 70 148 Q 100 154 130 148" stroke="#8B5A33" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="95" y="145" width="10" height="8" rx="1.5" fill="#FBBF24" stroke="#8B5A33" strokeWidth="1.2" />
      </g>
    );
  }

  // summerShirt — light short-sleeve with collar + polka dots
  return (
    <g>
      <path d={OUTERWEAR_TORSO} fill="#7DD3FC" stroke="#0284C7" strokeWidth="2" />
      {/* Collar */}
      <path d="M 82 116 L 100 126 L 92 114 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
      <path d="M 118 116 L 100 126 L 108 114 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
      {/* Tiny sleeve stubs */}
      <path d="M 64 118 C 56 126 58 136 68 140 C 72 130 74 122 74 118 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M 136 118 C 144 126 142 136 132 140 C 128 130 126 122 126 118 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Polka dots */}
      <circle cx="84" cy="136" r="2.4" fill="#E0F2FE" opacity="0.9" />
      <circle cx="116" cy="140" r="2.4" fill="#E0F2FE" opacity="0.9" />
      <circle cx="100" cy="150" r="2.4" fill="#E0F2FE" opacity="0.9" />
      <circle cx="92" cy="142" r="1.8" fill="#E0F2FE" opacity="0.75" />
      <circle cx="108" cy="132" r="1.8" fill="#E0F2FE" opacity="0.75" />
      <path d="M 70 155 Q 100 160 130 155" stroke="#0284C7" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  );
};

export const CuteCompanion: React.FC<CuteCompanionProps> = ({
  species,
  mood = 'idle',
  equipped = { hat: null, clothing: null, glasses: false, scarf: false, collar: true },
  interactive = true,
  onPet,
  className = '',
  size = 'md',
  showBowl = false,
  isEating: isEatingProp = false,
  isSniffing = false,
  consumedItemIcon,
  consumedItemKind = 'food',
}) => {
  const [isPetted, setIsPetted] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [blink, setBlink] = useState(false);
  const [earWiggle, setEarWiggle] = useState(false);

  /**
   * The mascot's coat, ears, stripes, blush and contact shadow are all SVG
   * paint servers referenced as `url(#id)`. An `id` on a gradient is
   * *document-global*, and several surfaces legitimately show more than one pet
   * at a time — the chat modal mounts both the desktop sidebar pet and the
   * mobile-bar pet (one is merely `display:none` via `hidden`/`md:hidden`), and
   * the Home / Wellness / Account tabs each own a pet too.
   *
   * Two copies of `id="dogFurGrad"` in one document is invalid markup, and the
   * browser resolves every `url(#dogFurGrad)` to whichever copy comes first —
   * so a pet could be filled with another instance's palette (or with nothing at
   * all, falling back to black) instead of its own. Scoping the ids per
   * instance guarantees each pet always paints from its own `<defs>`, whatever
   * else is on screen and in either Light or Dark Mode.
   *
   * `useId` values are only ever `[A-Za-z0-9_:]`; strip anything that is not
   * strictly id/url-safe so the fragment stays a valid `url(#...)` target.
   */
  const svgUid = useId().replace(/[^A-Za-z0-9_-]/g, '');
  const paint = (key: string) => `${svgUid}-${key}`;

  // Natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Soft ear twitch
  useEffect(() => {
    const earInterval = setInterval(() => {
      setEarWiggle(true);
      setTimeout(() => setEarWiggle(false), 350);
    }, 4000 + Math.random() * 2500);

    return () => clearInterval(earInterval);
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX =
      'clientX' in e
        ? e.clientX
        : (e as React.TouchEvent).touches[0]?.clientX || rect.left + rect.width / 2;
    const clientY =
      'clientY' in e
        ? e.clientY
        : (e as React.TouchEvent).touches[0]?.clientY || rect.top + rect.height / 2;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const emojis = ['💖', '✨', '🐾', '🌸', '⭐', '💚'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart = { id: Date.now() + Math.random(), x, y, emoji: randomEmoji };
    setHearts((prev) => [...prev.slice(-5), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);

    setIsPetted(true);
    setEarWiggle(true);
    setTimeout(() => setIsPetted(false), 900);
    setTimeout(() => setEarWiggle(false), 500);

    if (onPet) onPet();
  };

  const dimensions = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-60 h-60',
    hero: 'w-72 h-72 sm:w-80 sm:h-80',
    // Square and small, matching the round frame the community headers clip it
    // into. The mascot is centred, so the face lands inside the circle.
    avatar: 'w-full h-full',
  }[size];

  const isSleeping = mood === 'sleeping';
  const isEating = isEatingProp || mood === 'eating';
  const isBathing = mood === 'bathing';
  const isExcited = mood === 'excited';
  const isHappy = mood === 'happy' || isPetted || isExcited;

  // ============================================================
  // EXPRESSION LAYER — lets the mascot visibly feel what the user
  // is going through, so it can stand beside them in it.
  // ============================================================
  const isCrying = mood === 'crying';
  const isSad = mood === 'sad';
  const isLonely = mood === 'lonely';
  const isDownhearted = isCrying || isSad || isLonely;
  const isLoving = mood === 'loving';
  const isTiredMood = mood === 'tired';
  const isConfused = mood === 'curious';
  const isWorried = mood === 'overwhelmed' || mood === 'anxious';
  const isSerious = mood === 'serious' || mood === 'angry';
  const isCalmMood = mood === 'calm' || mood === 'peaceful';

  // Eating: chewing food vs lapping a drink. Sniffing only counts while the
  // pet is not already eating, so the bite motion always wins.
  const isDrinking = isEating && consumedItemKind === 'drink';
  const isSniffingNow = isSniffing && !isEating;

  // Gentle, emotion-appropriate idle movement. Downhearted moods sink and
  // sway rather than bounce, so the pet never looks cheerful by default.
  // Eating, drinking and sniffing take over the motion while they last.
  const drift = isEating
    ? isDrinking
      ? EAT_DRIFT.drink
      : EAT_DRIFT.food
    : isSniffingNow
    ? EAT_DRIFT.sniff
    : MOOD_DRIFT[mood] ?? (isHappy ? MOOD_DRIFT.happy : MOOD_DRIFT.idle);
  const hasDrift = isEating || isSniffingNow || Boolean(MOOD_DRIFT[mood]) || isHappy;

  // The item actually being consumed. Only fall back to a species nibble when the
  // caller has not told us what was served, so we never imply "fish" for water.
  const ServedIcon = consumedItemIcon;
  const snackIcon = ServedIcon ? (
    <ServedIcon className="w-7 h-7 drop-shadow-sm" />
  ) : isEating ? (
    species === 'dog' ? (
      '🦴'
    ) : (
      '🐟'
    )
  ) : null;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${dimensions} ${className}`}
    >
      {/* Floating Hearts & Sparkles on Pet */}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 1, scale: 0.6, x: h.x - 12, y: h.y - 12 }}
          animate={{ opacity: 0, scale: 1.4, y: h.y - 70, x: h.x + (Math.random() * 20 - 10) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute z-30 pointer-events-none text-2xl drop-shadow-md"
        >
          {h.emoji}
        </motion.div>
      ))}

      {/* Bathing Bubbles */}
      {isBathing && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.5 }}
              animate={{
                opacity: [0, 0.9, 0],
                y: [-10, -60],
                x: (i % 2 === 0 ? 1 : -1) * (14 + i * 8),
                scale: [0.5, 1.2, 0.7],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
              className="absolute bottom-8 left-1/2 w-6 h-6 rounded-full bg-cyan-200/80 dark:bg-cyan-400/25 border-2 border-white dark:border-cyan-100/70 shadow-inner"
            />
          ))}
        </div>
      )}

      {/* Sleeping Zzzs */}
      {isSleeping && (
        <div className="absolute top-1 right-3 z-20 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.95, 0], y: -32, x: i * 8, scale: [0.6, 1.3, 0.8] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.7,
                ease: 'easeOut',
              }}
              className="absolute text-emerald-600 dark:text-emerald-400 font-black text-sm tracking-widest select-none"
            >
              Zzz
            </motion.span>
          ))}
        </div>
      )}

      {/* Eating / Drinking Snack Floating.
          Renders the item the user actually served — no hardcoded fish. Falls back
          to the species nibble only when the caller supplies no item. Drinks get a
          shorter, gentler lap so the animation matches what is being consumed. */}
      {isEating && snackIcon && (
        <motion.div
          animate={
            consumedItemKind === 'drink'
              ? { y: [0, -3, 0], rotate: [0, -6, 0] }
              : { y: [0, -5, 0], rotate: [-5, 5, -5] }
          }
          transition={{ duration: consumedItemKind === 'drink' ? 0.45 : 0.6, repeat: Infinity }}
          className="absolute bottom-6 z-25 text-3xl pointer-events-none"
        >
          {snackIcon}
        </motion.div>
      )}

          {/* ============================================================
              THEME-NEUTRAL STAGE (2D art only)

              The mascot's coat is deliberately the loudest thing in the
              illustration, but a fair amount of it is near-white: cream belly
              and muzzle, cream chest, cream paws, and the cat's white tail tip
              (#FFFBEB). On the sanctuary's very pale Light-Mode surfaces those
              parts used to dissolve into the background and the pet read as a
              washed-out sticker rather than a golden / ginger companion.

              This is a soft, desaturated warm-grey pool that sits BEHIND the
              artwork only. It carries no brand hue, so it cannot tint the
              pet's own amber or ginger, and it fades to fully transparent well
              inside the frame so the ambient Light/Dark theme around it still
              reads. Purely decorative — no pointer events, no markup change.
              ============================================================ */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(62% 56% at 50% 64%, rgba(74, 58, 44, 0.20) 0%, rgba(74, 58, 44, 0.08) 52%, rgba(74, 58, 44, 0) 78%)',
            }}
          >
            {/* At night the same pool is a faint warm lift, so the pale fur
                still separates from the deep green-charcoal surface. */}
            <div
              className="absolute inset-0 hidden dark:block"
              style={{
                backgroundImage:
                  'radial-gradient(62% 56% at 50% 64%, rgba(255, 243, 224, 0.13) 0%, rgba(255, 243, 224, 0.05) 52%, rgba(255, 243, 224, 0) 78%)',
              }}
            />
          </div>

          {/* Main Mascot Vector Illustration Container with Smooth Squish & Bounce.
              Drifts with the mood, so a sad pet sways heavy and low while an
              excited one hops — the pet never idles cheerfully by default.
              While eating it dips toward the bowl on every bite. */}
          <motion.div
        animate={{
          y: drift.y,
          rotate: hasDrift ? drift.rotate : 0,
          scaleY: isEating
            ? [1, 0.94, 1]
            : isExcited
            ? [1, 1.08, 0.94, 1]
            : isHappy || isLoving
            ? [1, 1.04, 0.97, 1]
            : isSleeping
            ? [1, 0.98, 1]
            : [1, 1.01, 1],
          scaleX: isExcited ? [1, 0.96, 1.03, 1] : isHappy || isLoving ? [1, 0.97, 1.02, 1] : [1, 1, 1],
        }}
        transition={{
          y: { duration: drift.duration, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: drift.duration, repeat: Infinity, ease: 'easeInOut' },
          scaleY: {
            duration: isEating
              ? drift.duration
              : isExcited
              ? 0.45
              : isHappy || isLoving
              ? 0.8
              : 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          scaleX: {
            duration: isExcited ? 0.45 : isHappy || isLoving ? 0.8 : 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {species === 'dog' ? (
          /* ============================================================
             DOG (HABI): VIBRANT GOLDEN-CARAMEL PUPPY
             Rich warm golden honey coat, chocolate floppy ears,
             warm cream belly patch, glossy dark nose, panting pink tongue,
             solid grounded front paws, wagging puppy tail
             ============================================================ */
          <svg
            viewBox="0 0 200 200"
            className="relative w-full h-full drop-shadow-[0_12px_20px_rgba(58,32,10,0.24)] dark:drop-shadow-[0_14px_26px_rgba(0,0,0,0.45)]"
          >
            <defs>
              <linearGradient id={paint('dogFur')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDEACB" />
                <stop offset="45%" stopColor="#F6D19A" />
                <stop offset="100%" stopColor="#E0A85C" />
              </linearGradient>
              <linearGradient id={paint('dogMuzzle')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="100%" stopColor="#FCEFD6" />
              </linearGradient>
              <linearGradient id={paint('dogEar')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E0A85C" />
                <stop offset="100%" stopColor="#B9793A" />
              </linearGradient>
              <radialGradient id={paint('dogCheek')} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9EB0" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FF9EB0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={paint('dogGround')} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a24" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#1e3a24" stopOpacity="0" />
              </radialGradient>
              {/* Glossy plush eyes — a warm brown radial rather than flat black,
                  matching the catchlight-heavy "big anime eyes" reference look. */}
              <radialGradient id={paint('dogEyeGloss')} cx="35%" cy="28%" r="75%">
                <stop offset="0%" stopColor="#6B4A2E" />
                <stop offset="55%" stopColor="#2B1B0E" />
                <stop offset="100%" stopColor="#140B04" />
              </radialGradient>
              {/* Soft top-down sheen laid over the fur for a plush, lit-from-above look */}
              <radialGradient id={paint('dogSheen')} cx="50%" cy="18%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* GROUND CONTACT SHADOW */}
            <ellipse cx="100" cy="180" rx="48" ry="10" fill={`url(#${paint('dogGround')})`} />

            {/* CLICKABLE DOG BODY */}
            <g
              onClick={handleInteraction}
              onTouchStart={handleInteraction}
              className={`${interactive ? 'cursor-pointer' : ''}`}
            >
              {/* Wagging Puppy Tail */}
              <motion.path
                d="M 134 144 C 160 142 178 126 172 98 C 164 112 148 128 130 138 Z"
                fill={`url(#${paint('dogEar')})`}
                animate={{
                  d: isHappy
                    ? [
                        'M 134 144 C 160 142 178 126 172 98 C 164 112 148 128 130 138 Z',
                        'M 134 144 C 168 136 186 112 182 84 C 170 106 150 124 130 138 Z',
                        'M 134 144 C 156 146 170 132 164 104 C 158 118 146 132 130 138 Z',
                        'M 134 144 C 160 142 178 126 172 98 C 164 112 148 128 130 138 Z',
                      ]
                    : [
                        'M 134 144 C 160 142 178 126 172 98 C 164 112 148 128 130 138 Z',
                        'M 134 144 C 164 138 182 118 176 92 C 168 110 150 126 130 138 Z',
                        'M 134 144 C 160 142 178 126 172 98 C 164 112 148 128 130 138 Z',
                      ],
                }}
                transition={{
                  duration: isHappy ? 0.28 : 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Chubby Sitting Body with Warm Outline */}
              <path
                d="M 64 118 C 64 92 136 92 136 118 C 148 134 146 164 132 172 C 100 177 68 177 68 172 C 54 164 52 134 64 118 Z"
                fill={`url(#${paint('dogFur')})`}
                stroke="#B9793A"
                strokeWidth="2.5"
              />

              {/* Cream Chest / Belly Patch */}
              <path
                d="M 80 124 C 80 110 120 110 120 124 C 124 144 122 166 100 168 C 78 166 76 144 80 124 Z"
                fill={`url(#${paint('dogMuzzle')})`}
              />

              {/* Solid Planted Front Paws on Ground */}
              <g>
                <ellipse cx="80" cy="170" rx="12" ry="8" fill="#FFFBEB" stroke="#E0A85C" strokeWidth="2" />
                <ellipse cx="120" cy="170" rx="12" ry="8" fill="#FFFBEB" stroke="#E0A85C" strokeWidth="2" />
                {/* Paw Pad Claws */}
                <line x1="76" y1="167" x2="76" y2="173" stroke="#E0A85C" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="84" y1="167" x2="84" y2="173" stroke="#E0A85C" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="116" y1="167" x2="116" y2="173" stroke="#E0A85C" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="124" y1="167" x2="124" y2="173" stroke="#E0A85C" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Equipped Clothing — wraps the torso under the ears/head so the
                  head stays on top and the outfit reads as worn, not planted. */}
              <PetClothing clothing={equipped.clothing} />

              {/* Left Floppy Ear */}
              <motion.g
                animate={{
                  rotate: isHappy ? [0, -8, 6, 0] : earWiggle ? [0, -14, 10, 0] : [0, -2, 2, 0],
                  transformOrigin: '54px 62px',
                }}
                transition={{ duration: earWiggle ? 0.35 : 2.4, repeat: earWiggle ? 1 : Infinity, ease: 'easeInOut' }}
              >
                <path
                  d="M 56 62 C 34 76 26 112 44 122 C 58 128 66 104 60 76 Z"
                  fill={`url(#${paint('dogEar')})`}
                  stroke="#8B5A33"
                  strokeWidth="2"
                />
              </motion.g>

              {/* Right Floppy Ear */}
              <motion.g
                animate={{
                  rotate: isHappy ? [0, 8, -6, 0] : earWiggle ? [0, 14, -10, 0] : [0, 2, -2, 0],
                  transformOrigin: '146px 62px',
                }}
                transition={{ duration: earWiggle ? 0.35 : 2.4, repeat: earWiggle ? 1 : Infinity, ease: 'easeInOut' }}
              >
                <path
                  d="M 144 62 C 166 76 174 112 156 122 C 142 128 134 104 140 76 Z"
                  fill={`url(#${paint('dogEar')})`}
                  stroke="#8B5A33"
                  strokeWidth="2"
                />
              </motion.g>

              {/* Chubby Round Head */}
              <path
                d="M 52 82 C 48 50 152 50 148 82 C 150 114 136 126 100 126 C 64 126 50 114 52 82 Z"
                fill={`url(#${paint('dogFur')})`}
                stroke="#B9793A"
                strokeWidth="2.5"
              />

              {/* Cute Cream Muzzle */}
              <ellipse cx="100" cy="98" rx="24" ry="17" fill={`url(#${paint('dogMuzzle')})`} stroke="#EAC08A" strokeWidth="1.2" />

              {/* Cheerful Blush Cheeks */}
              <circle cx="68" cy="96" r="10" fill={`url(#${paint('dogCheek')})`} />
              <circle cx="132" cy="96" r="10" fill={`url(#${paint('dogCheek')})`} />

              {/* Eyes — the pet's face mirrors what the user is feeling */}
              {blink || isSleeping || isEating ? (
                /* Sleeping / Blinking / Eating Happy Arcs */
                <g stroke="#3A200A" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 72 82 Q 80 88 88 82" />
                  <path d="M 112 82 Q 120 88 128 82" />
                </g>
              ) : isLoving ? (
                /* Heart Eyes */
                <g>
                  <text x="80" y="89" fontSize="23" textAnchor="middle" fill="#FB7185" stroke="#E11D48" strokeWidth="0.4">♥</text>
                  <text x="120" y="89" fontSize="23" textAnchor="middle" fill="#FB7185" stroke="#E11D48" strokeWidth="0.4">♥</text>
                </g>
              ) : isTiredMood ? (
                /* Heavy, drowsy lids */
                <g stroke="#3A200A" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 70 79 Q 80 87 90 79" />
                  <path d="M 110 79 Q 120 87 130 79" />
                </g>
              ) : isDownhearted ? (
                /* Glossy eyes under lowered, heavy lids */
                <g>
                  <circle cx="80" cy="80" r="8.5" fill={`url(#${paint('dogEyeGloss')})`} />
                  <circle cx="77.5" cy="77" r="2.6" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="81" cy="83" r="1.1" fill="#FFFFFF" opacity="0.55" />
                  <circle cx="120" cy="80" r="8.5" fill={`url(#${paint('dogEyeGloss')})`} />
                  <circle cx="117.5" cy="77" r="2.6" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="121" cy="83" r="1.1" fill="#FFFFFF" opacity="0.55" />
                  <g fill={`url(#${paint('dogFur')})`}>
                    <rect x="69" y="68" width="22" height="11" rx="5.5" />
                    <rect x="109" y="68" width="22" height="11" rx="5.5" />
                  </g>
                </g>
              ) : isHappy ? (
                /* Happy Curved Eyes (^_^) */
                <g stroke="#3A200A" strokeWidth="3.2" strokeLinecap="round" fill="none">
                  <path d="M 72 84 Q 80 75 88 84" />
                  <path d="M 112 84 Q 120 75 128 84" />
                </g>
              ) : (
                /* Glossy Big Puppy Eyes — plush gradient iris with two catchlights,
                   sized up slightly for the wide, glassy "cute realistic" look */
                <g>
                  <circle cx="80" cy="80" r="8.5" fill={`url(#${paint('dogEyeGloss')})`} />
                  <circle cx="77" cy="77" r="3.1" fill="#FFFFFF" />
                  <circle cx="82.5" cy="83.5" r="1.5" fill="#FFFFFF" opacity="0.85" />

                  <circle cx="120" cy="80" r="8.5" fill={`url(#${paint('dogEyeGloss')})`} />
                  <circle cx="117" cy="77" r="3.1" fill="#FFFFFF" />
                  <circle cx="122.5" cy="83.5" r="1.5" fill="#FFFFFF" opacity="0.85" />
                </g>
              )}

              {/* Concerned brows / tears / hearts / "?" overlay */}
              <PetExpression
                crying={isCrying}
                downhearted={isDownhearted}
                loving={isLoving}
                tired={isTiredMood}
                worried={isWorried}
                serious={isSerious}
                confused={isConfused}
              />

              {/* Dark Truffle Nose */}
              <path
                d="M 94 92 C 94 89 106 89 106 92 C 106 96 101 99 100 99 C 99 99 94 96 94 92 Z"
                fill="#241408"
              />
              <ellipse cx="98" cy="91" rx="2" ry="1" fill="#FFFFFF" opacity="0.6" />

              {/* Mouth & Pink Tongue */}
              {isEating ? (
                /* Chewing food / lapping a drink */
                <EatingMouth cx={100} cy={102} drinking={isDrinking} />
              ) : isCrying ? (
                /* Quivering frown — the pet is upset about what you told it */
                <motion.path
                  d="M 91 104 Q 100 98 109 104"
                  stroke="#241408"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      'M 91 104 Q 100 98 109 104',
                      'M 91 101 Q 100 100 109 101',
                      'M 91 104 Q 100 98 109 104',
                    ],
                  }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : isDownhearted ? (
                /* Downturned, quiet */
                <path
                  d="M 92 102 Q 100 98 108 102"
                  stroke="#241408"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isSerious ? (
                /* Flat, composed line */
                <path
                  d="M 93 101 L 107 101"
                  stroke="#241408"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isTiredMood ? (
                /* Small drowsy yawn */
                <ellipse cx="100" cy="102" rx="3.6" ry="2.8" fill="#431407" />
              ) : isHappy ? (
                <g>
                  <path
                    d="M 93 99 Q 100 102 107 99"
                    stroke="#241408"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Panting Puppy Tongue */}
                  <motion.path
                    d="M 96 101 Q 100 114 104 101 Z"
                    fill="#FF6B8B"
                    stroke="#E11D48"
                    strokeWidth="1"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </g>
              ) : (
                <path
                  d="M 94 99 Q 97 103 100 100 Q 103 103 106 99"
                  stroke="#241408"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Equipped Collar */}
              {equipped.collar && (
                <g>
                  <path
                    d="M 70 120 Q 100 130 130 120"
                    stroke="#059669"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="100" cy="126" r="4.5" fill="#FBBF24" stroke="#B9793A" strokeWidth="1" />
                </g>
              )}

              {/* Accessories */}
              {equipped.glasses && (
                <g>
                  <rect x="66" y="73" width="28" height="18" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
                  <rect x="106" y="73" width="28" height="18" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
                  <line x1="94" y1="81" x2="106" y2="81" stroke="#18181B" strokeWidth="3" />
                  <line x1="72" y1="77" x2="84" y2="77" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
                </g>
              )}

              {/* Headwear — shared renderer draws every owned hat on the head */}
              <PetHat hatId={equipped.hat} />
            </g>
          </svg>
        ) : (
          /* ============================================================
             CAT (MUNING): WARM GINGER-APRICOT TABBY / CALICO KITTEN
             (NO GHOST! Rich warm orange-apricot coat, amber tabby stripes,
              soft cream chest & paws, grounded contact shadow,
              sweet whiskers, pink nose, striped curled tail)
             ============================================================ */
          <svg
            viewBox="0 0 200 200"
            className="relative w-full h-full drop-shadow-[0_12px_20px_rgba(58,32,10,0.24)] dark:drop-shadow-[0_14px_26px_rgba(0,0,0,0.45)]"
          >
            <defs>
              {/* WARM CREAM-BEIGE COAT GRADIENT, matching the plush kitten reference */}
              <linearGradient id={paint('catFur')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBEFD9" />
                <stop offset="45%" stopColor="#F3DDB0" />
                <stop offset="100%" stopColor="#E0BC7E" />
              </linearGradient>
              <linearGradient id={paint('catCream')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="100%" stopColor="#FCF3DF" />
              </linearGradient>
              <linearGradient id={paint('catStripe')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D6A868" />
                <stop offset="100%" stopColor="#B98A4C" />
              </linearGradient>
              <linearGradient id={paint('catEar')} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBC7CE" />
                <stop offset="100%" stopColor="#F4A0AC" />
              </linearGradient>
              <radialGradient id={paint('catCheek')} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9EB0" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FF9EB0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={paint('catGround')} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a24" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#1e3a24" stopOpacity="0" />
              </radialGradient>
              {/* Glossy plush eyes — a warm brown radial rather than flat black */}
              <radialGradient id={paint('catEyeGloss')} cx="35%" cy="28%" r="75%">
                <stop offset="0%" stopColor="#5C4230" />
                <stop offset="55%" stopColor="#241708" />
                <stop offset="100%" stopColor="#120B03" />
              </radialGradient>
              {/* Soft top-down sheen for a plush, lit-from-above look */}
              <radialGradient id={paint('catSheen')} cx="50%" cy="18%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* GROUND CONTACT SHADOW - Anchors the cat to earth */}
            <ellipse cx="100" cy="180" rx="46" ry="10" fill={`url(#${paint('catGround')})`} />

            {/* CLICKABLE CAT BODY */}
            <g
              onClick={handleInteraction}
              onTouchStart={handleInteraction}
              className={`${interactive ? 'cursor-pointer' : ''}`}
            >
              {/* Striped Ginger Curled Tail */}
              <motion.g
                animate={{
                  rotate: isHappy ? [0, 10, -8, 0] : [0, 4, -4, 0],
                  transformOrigin: '136px 146px',
                }}
                transition={{ duration: isHappy ? 0.35 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Tail Base */}
                <path
                  d="M 134 146 C 162 146 182 130 176 100 C 168 114 154 128 132 138 Z"
                  fill={`url(#${paint('catFur')})`}
                  stroke="#B98A4C"
                  strokeWidth="2"
                />
                {/* Tabby Tail Stripes */}
                <path d="M 148 136 C 158 130 166 122 164 114" stroke={`url(#${paint('catStripe')})`} strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 160 122 C 168 116 172 108 170 102" stroke={`url(#${paint('catStripe')})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* White Tip */}
                <path d="M 172 104 C 176 100 176 96 172 98 Z" fill="#FFFBEB" />
              </motion.g>

              {/* Chubby Sitting Cat Body (VIBRANT WARM GINGER) */}
              <path
                d="M 64 120 C 64 94 136 94 136 120 C 148 136 146 166 130 172 C 100 177 70 177 70 172 C 54 166 52 136 64 120 Z"
                fill={`url(#${paint('catFur')})`}
                stroke="#B98A4C"
                strokeWidth="2.5"
              />

              {/* Soft Cream Chest & Tummy Patch */}
              <path
                d="M 82 122 C 82 108 118 108 118 122 C 122 142 120 164 100 166 C 80 164 78 142 82 122 Z"
                fill={`url(#${paint('catCream')})`}
              />

              {/* Tabby Side Markings */}
              <path d="M 64 130 Q 72 134 68 142" stroke={`url(#${paint('catStripe')})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 66 146 Q 74 148 70 156" stroke={`url(#${paint('catStripe')})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 136 130 Q 128 134 132 142" stroke={`url(#${paint('catStripe')})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 134 146 Q 126 148 130 156" stroke={`url(#${paint('catStripe')})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Solid Planted Little White Front Paws */}
              <g>
                <ellipse cx="80" cy="170" rx="11" ry="7.5" fill="#FFFBEB" stroke="#E0A85C" strokeWidth="2" />
                <ellipse cx="120" cy="170" rx="11" ry="7.5" fill="#FFFBEB" stroke="#E0A85C" strokeWidth="2" />
                <line x1="77" y1="167" x2="77" y2="173" stroke="#EAC08A" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="83" y1="167" x2="83" y2="173" stroke="#EAC08A" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="117" y1="167" x2="117" y2="173" stroke="#EAC08A" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="123" y1="167" x2="123" y2="173" stroke="#EAC08A" strokeWidth="1.4" strokeLinecap="round" />
              </g>

              {/* Equipped Clothing — wraps the torso under the ears/head so the
                  head stays on top and the outfit reads as worn, not planted. */}
              <PetClothing clothing={equipped.clothing} />

              {/* Left Pointy Cat Ear with Pink Inside */}
              <motion.g
                animate={{
                  rotate: isHappy ? [0, -6, 4, 0] : earWiggle ? [0, -12, 8, 0] : [0, -2, 1, 0],
                  transformOrigin: '68px 65px',
                }}
                transition={{ duration: earWiggle ? 0.35 : 2.5, repeat: earWiggle ? 1 : Infinity, ease: 'easeInOut' }}
              >
                <path d="M 52 74 C 46 42 72 30 88 56 Z" fill={`url(#${paint('catFur')})`} stroke="#B98A4C" strokeWidth="2" />
                <path d="M 58 70 C 56 46 72 38 82 56 Z" fill={`url(#${paint('catEar')})`} />
              </motion.g>

              {/* Right Pointy Cat Ear with Pink Inside */}
              <motion.g
                animate={{
                  rotate: isHappy ? [0, 6, -4, 0] : earWiggle ? [0, 12, -8, 0] : [0, 2, -1, 0],
                  transformOrigin: '132px 65px',
                }}
                transition={{ duration: earWiggle ? 0.35 : 2.5, repeat: earWiggle ? 1 : Infinity, ease: 'easeInOut' }}
              >
                <path d="M 148 74 C 154 42 128 30 112 56 Z" fill={`url(#${paint('catFur')})`} stroke="#B98A4C" strokeWidth="2" />
                <path d="M 142 70 C 144 46 128 38 118 56 Z" fill={`url(#${paint('catEar')})`} />
              </motion.g>

              {/* Chubby Round Head (WARM GINGER APRICOT) */}
              <path
                d="M 52 82 C 48 52 152 52 148 82 C 150 116 136 128 100 128 C 64 128 50 116 52 82 Z"
                fill={`url(#${paint('catFur')})`}
                stroke="#B98A4C"
                strokeWidth="2.5"
              />

              {/* Classic Cat Tabby Forehead 'M' Marking */}
              <g stroke={`url(#${paint('catStripe')})`} strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M 92 60 L 96 70 L 100 64 L 104 70 L 108 60" />
                <line x1="100" y1="56" x2="100" y2="62" />
              </g>

              {/* Cream Muzzle / Whisker Pads */}
              <ellipse cx="92" cy="100" rx="10" ry="8" fill={`url(#${paint('catCream')})`} stroke="#E8CB9C" strokeWidth="1" />
              <ellipse cx="108" cy="100" rx="10" ry="8" fill={`url(#${paint('catCream')})`} stroke="#E8CB9C" strokeWidth="1" />

              {/* Cheerful Pink Blush */}
              <circle cx="66" cy="98" r="9" fill={`url(#${paint('catCheek')})`} />
              <circle cx="134" cy="98" r="9" fill={`url(#${paint('catCheek')})`} />

              {/* 3 Delicate Whiskers on Each Cheek */}
              <g stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" opacity="0.75">
                <line x1="36" y1="94" x2="60" y2="97" />
                <line x1="34" y1="102" x2="60" y2="102" />
                <line x1="36" y1="110" x2="60" y2="106" />

                <line x1="164" y1="94" x2="140" y2="97" />
                <line x1="166" y1="102" x2="140" y2="102" />
                <line x1="164" y1="110" x2="140" y2="106" />
              </g>

              {/* Eyes — the pet's face mirrors what the user is feeling */}
              {blink || isSleeping || isEating ? (
                /* Sleeping / Blinking / Eating Happy Arcs */
                <g stroke="#3A200A" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 70 82 Q 78 88 86 82" />
                  <path d="M 114 82 Q 122 88 130 82" />
                </g>
              ) : isLoving ? (
                /* Heart Eyes */
                <g>
                  <text x="78" y="89" fontSize="24" textAnchor="middle" fill="#FB7185" stroke="#E11D48" strokeWidth="0.4">♥</text>
                  <text x="122" y="89" fontSize="24" textAnchor="middle" fill="#FB7185" stroke="#E11D48" strokeWidth="0.4">♥</text>
                </g>
              ) : isTiredMood ? (
                /* Heavy, drowsy lids */
                <g stroke="#3A200A" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 68 79 Q 78 87 88 79" />
                  <path d="M 112 79 Q 122 87 132 79" />
                </g>
              ) : isDownhearted ? (
                /* Glossy eyes under lowered, heavy lids */
                <g>
                  <circle cx="78" cy="80" r="9" fill={`url(#${paint('catEyeGloss')})`} />
                  <circle cx="75.5" cy="77" r="2.8" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="79" cy="83" r="1.2" fill="#FFFFFF" opacity="0.55" />
                  <circle cx="122" cy="80" r="9" fill={`url(#${paint('catEyeGloss')})`} />
                  <circle cx="119.5" cy="77" r="2.8" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="123" cy="83" r="1.2" fill="#FFFFFF" opacity="0.55" />
                  <g fill={`url(#${paint('catFur')})`}>
                    <rect x="66" y="68" width="24" height="11" rx="5.5" />
                    <rect x="110" y="68" width="24" height="11" rx="5.5" />
                  </g>
                </g>
              ) : isHappy ? (
                /* Cheerful Squeezed Eyes */
                <g stroke="#3A200A" strokeWidth="3.2" strokeLinecap="round" fill="none">
                  <path d="M 70 84 Q 78 75 86 84" />
                  <path d="M 114 84 Q 122 75 130 84" />
                </g>
              ) : (
                /* Large Glossy Cat Eyes — plush gradient iris with two catchlights */
                <g>
                  <circle cx="78" cy="80" r="9" fill={`url(#${paint('catEyeGloss')})`} />
                  <circle cx="75" cy="77" r="3.3" fill="#FFFFFF" />
                  <circle cx="80.5" cy="83.5" r="1.6" fill="#FFFFFF" opacity="0.85" />

                  <circle cx="122" cy="80" r="9" fill={`url(#${paint('catEyeGloss')})`} />
                  <circle cx="119" cy="77" r="3.3" fill="#FFFFFF" />
                  <circle cx="124.5" cy="83.5" r="1.6" fill="#FFFFFF" opacity="0.85" />
                </g>
              )}

              {/* Concerned brows / tears / hearts / "?" overlay */}
              <PetExpression
                crying={isCrying}
                downhearted={isDownhearted}
                loving={isLoving}
                tired={isTiredMood}
                worried={isWorried}
                serious={isSerious}
                confused={isConfused}
              />

              {/* Tiny Pink Cat Nose */}
              <polygon points="97,94 103,94 100,98" fill="#FB7185" stroke="#E11D48" strokeWidth="0.8" />

              {/* Mouth — mirrors the user's emotional weight */}
              {isEating ? (
                /* Chewing food / lapping a drink */
                <EatingMouth cx={100} cy={101} drinking={isDrinking} />
              ) : isCrying ? (
                /* Quivering frown — the pet feels it with you */
                <motion.path
                  d="M 92 103 Q 100 97 108 103"
                  stroke="#431407"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      'M 92 103 Q 100 97 108 103',
                      'M 92 100 Q 100 99 108 100',
                      'M 92 103 Q 100 97 108 103',
                    ],
                  }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : isDownhearted ? (
                /* Downturned, quiet */
                <path
                  d="M 93 101 Q 100 97 107 101"
                  stroke="#431407"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isSerious ? (
                /* Flat, composed line */
                <path
                  d="M 94 100 L 106 100"
                  stroke="#431407"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isTiredMood ? (
                /* Small drowsy yawn */
                <ellipse cx="100" cy="101" rx="3.4" ry="2.6" fill="#431407" />
              ) : isHappy ? (
                <g>
                  <path
                    d="M 94 98 Q 97 102 100 100 Q 103 102 106 98"
                    stroke="#431407"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Little Pink Tongue Blep (:P) */}
                  <motion.path
                    d="M 97 100 Q 100 109 103 100 Z"
                    fill="#FB7185"
                    stroke="#E11D48"
                    strokeWidth="0.8"
                    animate={{ scaleY: [1, 1.15, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </g>
              ) : (
                <path
                  d="M 94 98 Q 97 102 100 100 Q 103 102 106 98"
                  stroke="#431407"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Equipped Collar with Heart Charm */}
              {equipped.collar && (
                <g>
                  <path
                    d="M 70 120 Q 100 130 130 120"
                    stroke="#BE123C"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Gold Bell / Heart */}
                  <circle cx="100" cy="126" r="4.5" fill="#FBBF24" stroke="#B9793A" strokeWidth="1" />
                  <circle cx="100" cy="127" r="1" fill="#8B5A33" />
                </g>
              )}

              {/* Equipped Accessories */}
              {equipped.glasses && (
                <g>
                  <rect x="66" y="73" width="28" height="18" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
                  <rect x="106" y="73" width="28" height="18" rx="6" fill="#18181B" stroke="#3F3F46" strokeWidth="1.8" />
                  <line x1="94" y1="81" x2="106" y2="81" stroke="#18181B" strokeWidth="3" />
                  <line x1="72" y1="77" x2="84" y2="77" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
                </g>
              )}

              {/* Headwear — shared renderer draws every owned hat on the head */}
              <PetHat hatId={equipped.hat} />
            </g>
          </svg>
        )}
      </motion.div>
    </div>
  );
};