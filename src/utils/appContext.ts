/* ============================================================
   HANGIN — WHAT THIS APP ACTUALLY IS, AND HOW TO ANSWER A QUESTION
   ============================================================
   The companion was only ever told to be warm and grounding, so every
   message came back as the same handful of reassurances — including
   plain questions like "1+1=2" or "what does this app do?", which got
   comfort that had nothing to do with what was asked.

   This file is the missing half:

   - `APP_CONTEXT` is handed to the model, so a question about the app is
     answered from the features that actually ship instead of guessed at.
   - `resolveInquiry` answers what can be answered with certainty right
     here (arithmetic, app questions) and stays deliberately silent about
     everything else, so the caller can fall back to its own emotional
     support path untouched.

   Both the streaming server and the chat modal use it, so a reply still
   corresponds to the inquiry even when no model is available.
   ============================================================ */

export const APP_NAME = 'HANGIN';

/**
 * A plain description of the shipped app, written from the UI itself so the
 * companion can talk about the real sanctuary instead of improvising one.
 */
export const APP_CONTEXT = `HANGIN (🍃) is a Philippine mental-wellness sanctuary web app: a gentle place to check in with your feelings and care for a companion animal. "Hangin" is Tagalog for "to hang", after the vines that sway over the scene.

What the user can actually do in the app:
- Home: a mountain-lake scene with swaying vines and drifting clouds that changes with Philippine Standard Time — sunlit morning/day, golden sunset, or starlit night.
- Mood check-in: log how you feel (Happy, Calm, Sad, Tired, Overwhelmed) and get a reflection written for that exact feeling.
- Daily goals: a checklist of mindful goals (less doomscrolling, stress relief, self-care habits, journaling, sleep hygiene) that resets at 12:00 AM PHT.
- Chat with the companion: this live AI conversation, with text-to-speech, live microphone input, and crisis safety.
- Wellness: feed, bathe, brush and play with your companion, watch its hunger/cleanliness/energy/happiness, use the Digital Shield (adult + reels blocker with a PIN lock), focus sessions, Box Breathing (4-4-4-4) and other guided mindfulness, plus small wellness mini-games.
- Community: the "Bayanihan Circle", a moderated peer space with channels, upvotes and post validation.
- Journal: a Private Journal with a PIN lock, mood tags, and entries that stay on the device.
- Market: spend Wellness Points (WP) on hats, outfits, food and care items. WP is earned through habits, check-ins, journaling and kindness in the community.
- Account: profile, streak days, points and companion stats.

Notes: the app speaks English and Filipino/Taglish, it is free, and a user's data is stored in their own browser. It is a wellness companion, not a therapist or a medical service — for urgent support it can point to the Philippine NCMH hotline 1553 and other real hotlines.`;

export type InquiryKind = 'math' | 'app' | 'unavailable';

export interface InquiryReply {
  kind: InquiryKind;
  text: string;
}

/* ------------------------------------------------------------
   ARITHMETIC
   A checkable question gets a checkable answer, instead of a
   reassurance in place of a number.
   ------------------------------------------------------------ */

type MathOperator = '+' | '-' | '*' | '/';

const OPERATORS: Record<MathOperator, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

/** Spelled-out operations, so "12 times 12" is understood too. */
const WORD_OPERATORS: Array<[RegExp, MathOperator]> = [
  [/\bmultiplied\s+by\b|\btimes\b|\bx\b/gi, '*'],
  [/\bdivided\s+by\b|\bover\b/gi, '/'],
  [/\bplus\b/gi, '+'],
  [/\bminus\b|\bsubtract(?:ed)?\b/gi, '-'],
];

/**
 * Boundaries on both sides keep a hyphenated word or a date from being read as
 * a subtraction, while still matching "2+2 in math".
 */
const MATH_EXPRESSION =
  /(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*([-+*/])\s*(\d+(?:\.\d+)?)(?![\p{L}\p{N}])/u;

/** "1+1=3" — the user wrote an answer down, so it can be checked. */
const ASSERTED_RESULT = /^\s*(?:=|\bequals\b|\bis\b)\s*(-?\d+(?:\.\d+)?)/i;

const formatNumber = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));

/** Normalises typography and spelled-out operations into a plain expression. */
const normalizeMath = (text: string): string =>
  WORD_OPERATORS.reduce(
    (acc, [pattern, symbol]) => acc.replace(pattern, symbol),
    text
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1*')
  );

const solveArithmetic = (text: string): InquiryReply | null => {
  const normalized = normalizeMath(text);
  const match = MATH_EXPRESSION.exec(normalized);
  if (!match) return null;

  const [, leftRaw, opRaw, rightRaw] = match;
  const op = opRaw as MathOperator;
  const left = Number(leftRaw);
  const right = Number(rightRaw);
  const expression = `${leftRaw} ${op} ${rightRaw}`;

  if (op === '/' && right === 0) {
    return {
      kind: 'math',
      text: `*peers at the sum very closely* ${expression} has no answer — you can't divide by zero, it just goes on forever. Want to try another one? 🐾`,
    };
  }

  const result = formatNumber(OPERATORS[op](left, right));
  const asserted = ASSERTED_RESULT.exec(
    normalized.slice(match.index + match[0].length)
  );

  if (asserted) {
    const claimed = asserted[1];
    if (formatNumber(Number(claimed)) === result) {
      return {
        kind: 'math',
        text: `*sits up straight and taps a paw proudly* ${expression} = ${result}. Correct! 🐾`,
      };
    }
    return {
      kind: 'math',
      text: `*counts carefully on a soft paw* Good try — ${expression} is ${result}, not ${claimed}. The answer is ${result}. 🐾`,
    };
  }

  return {
    kind: 'math',
    text: `*tilts head and works it out* ${expression} = ${result}. 🐾 Want another one?`,
  };
};

/* ------------------------------------------------------------
   APP QUESTIONS
   Every answer below points at something the sanctuary really
   contains, so a question about the app gets a real answer.
   ------------------------------------------------------------ */

export interface InquiryContext {
  companionName: string;
  species: 'dog' | 'cat';
}

const APP_ANSWERS: Array<{
  test: RegExp;
  reply: (ctx: InquiryContext) => string;
}> = [
  {
    test: /\b(1553|\b988\b|hotline|crisis line|findahelpline)\b/i,
    reply: () =>
      `*moves closer and lowers my voice* If you need someone to talk to right now, these are real, free and awake right now:\n\n📞 NCMH Crisis Hotline: 1553 (toll-free nationwide)\n📱 Globe / TM: 0917-899-8727 · Smart / Sun / TNT: 0966-351-4518\n☎️ In Touch Community Services: (02) 8893-7603\n💬 Text "USAP" to 1553\n\nOutside the Philippines, dial 988 in the US/Canada or visit findahelpline.com. You deserve someone on the line with you. 🌿`,
  },
  {
    test: /\b(private|privacy|my data|secure|delete my|who sees)\b/i,
    reply: () =>
      `*sits quietly beside you* Your sanctuary stays in this browser — journal, mood logs, points and all — and your Private Journal is behind a PIN only you know. Nothing is shared anywhere without you. 🌿`,
  },
  {
    test: /\b(free|cost|how much|price|paid|subscription|pay|peso)\b/i,
    reply: () =>
      `*wags happily* It's completely free — no subscriptions, no paywalls. Everything in the sanctuary, Market included, is earned or given. 🍃`,
  },
  {
    test: /\b(who (?:made|built|created)|developer|creator|who owns|who made it)\b/i,
    reply: () =>
      `*perks up* HANGIN is a student-built mental wellness project, and I'm the companion who lives inside it. Every part of it was designed to make a heavy day feel a little lighter. 🌿`,
  },
  {
    test: /\b(journal|diary|write)\b/i,
    reply: () =>
      `*curls up beside the notebook* The Journal tab is a Private Journal — write freely, tag how you felt, and lock it behind a PIN only you set. Nothing in there is ever shared. 📔`,
  },
  {
    test: /\b(market|shop|store|buy|purchase|hat|outfit|accessor)\b/i,
    reply: () =>
      `*points a paw at the little shop* The Market stocks hats, outfits, food and care items, all paid for with Wellness Points (WP) instead of money. You earn WP through habits, check-ins, journaling and kindness in the community. 🛍️`,
  },
  {
    test: /\b(wellness tab|feed|bathe|bath|brush|clean|play with|hunger|cleanliness|energy|take care of)\b/i,
    reply: () =>
      `*perks up at the mention of treats* The Wellness tab is where you care for me — feeding, bathing, brushing and playing, and watching my hunger, cleanliness, energy and happiness. It also holds the Digital Shield, focus sessions, Box Breathing and a few small wellness games. 🍚`,
  },
  {
    test: /\b(digital shield|blocker|blocked|blocking|porn|reels|shorts|doomscroll|website block)\b/i,
    reply: () =>
      `*sits up alert* The Digital Shield lives in Wellness: it can block adult sites and doomscroll reels, counts what it stopped today, and can be PIN-locked so it stays on even on a rough day. 🛡️`,
  },
  {
    test: /\b(breath|breathe|breathing|meditat|mindful|mindfulness|box breathing|grounding exercise)\b/i,
    reply: () =>
      `*breathes slowly, inviting you to match my pace* The Mindful Studio has guided Box Breathing — in for 4, hold 4, out 4, hold 4 — plus other short grounding exercises. I can also walk you through one round right here. 🌬️`,
  },
  {
    test: /\b(community|forum|bayanihan|thread|channel|other people|peer)\b/i,
    reply: () =>
      `*tail wags at the mention of others* The Community tab is the Bayanihan Circle — a moderated peer space with channels, upvotes, and a "validate" button so a post that helped you gets noticed. 🌿`,
  },
  {
    test: /\b(point|points|\bwp\b|reward|earn|coin)\b/i,
    reply: () =>
      `*eyes light up* Wellness Points (WP) come from real self-care: finishing daily habits and goals, mood check-ins, journal entries, and helping others in the Bayanihan Circle. You spend them in the Market. ✨`,
  },
  {
    test: /\b(goal|goals|checklist|daily task)\b/i,
    reply: () =>
      `*taps the list gently* Today's Goals is a short checklist of the mindful goals you chose — less doomscrolling, easing stress, self-care habits, journaling, sleep hygiene. It clears itself at 12:00 AM Philippine time, so every day starts fresh. ✅`,
  },
  {
    test: /\b(streak|consistent|every day)\b/i,
    reply: () =>
      `*sits proud* Your streak counts the days you keep showing up — habits, check-ins, journal. It grows one gentle day at a time, and a missed day is never a reason to quit. 📅`,
  },
  {
    test: /\b(mood check|check[- ]?in|how am i feeling|log my mood)\b/i,
    reply: () =>
      `*leans in* The Home tab has a Mood check-in — Happy, Calm, Sad, Tired or Overwhelmed. Pick the one that's true today and I'll answer with a reflection written for that exact feeling. 🎭`,
  },
  {
    test: /\b(mini game|games?\b|play a game)\b/i,
    reply: () =>
      `*perks up* Wellness has a few small mindful mini-games for a light break — good for a few minutes between heavier things. 🎮`,
  },
  {
    test: /\b(focus|pomodoro|timer|session|concentrat)\b/i,
    reply: () =>
      `*settles in beside you* Focus sessions in Wellness give you a set stretch of time to work without the feed — start one, put the phone down, and I'll keep you company while it runs. ⏳`,
  },
  {
    test: /\b(who are you|what are you|your name|are you (?:a )?(?:real )?(?:human|ai|bot|alive))\b/i,
    reply: ({ companionName, species }) =>
      `*tail wags* I'm ${companionName}, your ${species} companion in HANGIN. I run on AI, so I can't promise everything — but I'm here, I listen properly, and I'll always answer you straight. 🐾`,
  },
  {
    test: /\b(therapist|therapy|doctor|medical|diagnosis|medication|professional|counsel\w*)\b/i,
    reply: () =>
      `*sits honestly beside you* I'm a wellness companion, not a therapist or a doctor — I can't diagnose or treat anything. For anything that heavy a real counselor is worth it, and the NCMH hotline 1553 is free here in the Philippines. I'll stay right beside you either way. 🌿`,
  },
  {
    test: /\b(tagalog|taglish|filipino|language)\b/i,
    reply: ({ companionName }) =>
      `*ears perk up* Sure, kaibigan — I speak English and Taglish. You can write to ${companionName} in either, and I'll answer in the one you're using. 🇵🇭`,
  },
  {
    test: /\b(philippine time|\bpht\b|time of day|day scene|night scene|what time)\b/i,
    reply: () =>
      `*glances up at the sky* The scene follows real Philippine Standard Time — sunlit by day, golden at sunset, starlight at night — with the PHT clock right in the corner. 🌅`,
  },
  {
    test: /\b(companion|my pet|the pet|the (?:dog|cat))\b/i,
    reply: ({ companionName, species }) =>
      `*leans into your hand* I'm your ${species}, ${companionName}. You can pet me, rename me, and dress me in hats and outfits from the Market — and I mirror whatever you're feeling, so I'm never cheerful when you're not. 🐾`,
  },
  {
    test: /\b(this chat|this conversation|voice aloud|live mic|can you (?:hear|speak))\b/i,
    reply: ({ companionName }) =>
      `*ears forward* This is a live conversation with me, ${companionName}. Turn on Voice Aloud to hear me, or use the mic to talk instead of typing — and whatever you ask, I'll answer it straight. 🎙️`,
  },
  {
    test: /\b(feature|features|what can i do|what does (?:this|the) (?:app|site|website)|how does (?:this|the) (?:app|site|website) work|getting started|how do i use|tour|help me use|what is hangin|what's hangin|what is this app|what can you do)\b/i,
    reply: () => `*sits up and gives you the tour* ${APP_CONTEXT}`,
  },
  {
    test: /\b(app|application|website|site|hangin|this program)\b/i,
    reply: () => `*sits up and gives you the tour* ${APP_CONTEXT}`,
  },
];

/* ------------------------------------------------------------
   INQUIRY SHAPE
   Used only to tell a question apart from a feeling, so the
   support path keeps every emotional message it already had.
   ------------------------------------------------------------ */

/** Feeling words, in English and Taglish. */
const EMOTIONAL_CUES =
  /\b(sad|happy|glad|tired|exhausted|anxious|anxiety|worried|worry|scared|afraid|overwhelmed|lonely|alone|cry|crying|cried|tears|hurt|hurts|pain|angry|mad|frustrat\w*|stress(ed)?|numb|empty|hopeless|miss|missing|love|loved|thank|thanks|grateful|proud|feel|feeling|felt|okay|ok|fine|good|bad|day|days|life|tonight|today|homework|exam|deadline)\b|\b(pagod|malungkot|masaya|kinakabahan|nakakabahan|nakaiintindihan|nakakalito|umiiyak|masakit|ayaw ko|gusto ko|mahal|salamat|marami|kapag|pahinga|huminga|muna|tayo|kaibigan)\b/i;

/** "?" or a question / imperative opener. */
const INQUIRY_SHAPE =
  /\?|\b(who|what|whats|what's|where|when|why|how|which|is|are|am|can|could|do|does|did|will|would|should|may|explain|describe|tell me|list|name)\b/i;

const answerAppQuestion = (text: string, ctx: InquiryContext): InquiryReply | null => {
  const isQuestion = INQUIRY_SHAPE.test(text);
  if (!isQuestion) return null;

  for (const { test, reply } of APP_ANSWERS) {
    if (test.test(text)) {
      return { kind: 'app', text: reply(ctx) };
    }
  }
  return null;
};

/**
 * Answers the inquiry directly when we can be certain of the answer, and says
 * so honestly when we cannot. Returns `null` for anything emotional, so the
 * caller keeps its existing mood-based support flow exactly as it was.
 */
export const resolveInquiry = (
  message: string,
  ctx: InquiryContext = { companionName: 'your companion', species: 'dog' }
): InquiryReply | null => {
  const text = message.trim();
  if (!text) return null;

  const math = solveArithmetic(text);
  if (math) return math;

  // An app question is answered even when it carries feeling words too
  // ("how do I journal when I feel sad?") — the question comes first.
  const app = answerAppQuestion(text, ctx);
  if (app) return app;

  // A feeling, a vent, a story — leave these to the companion's own voice.
  if (EMOTIONAL_CUES.test(text)) return null;

  if (INQUIRY_SHAPE.test(text)) {
    return {
      kind: 'unavailable',
      text: `*tilts head, thinking as hard as a small brain can* I don't have that one loaded in my head right now, and I'd rather tell you that than guess and get it wrong. Tell me a little more about what you're after and we'll work it out together. 🌿`,
    };
  }

  return null;
};
