/* ============================================================
   CONFIGURED CRISIS / HELP TRIGGERS
   ============================================================
   One list, shared by the chat modal and the streaming server, so a
   phrase is treated the same way everywhere and the list can be
   tuned in a single place.

   Two levels, on purpose:
   - CRISIS phrases intercept the conversation: the companion stops
     answering normally and hands over the real hotlines.
   - HELP phrases only decide whether the hotline shortcut is
     allowed to appear. Someone asking for help has not said
     anything about hurting themselves, and should still be able to
     reach a human in one tap.

   Matching is anchored to word boundaries: an unanchored `includes`
   would fire "mamatay" inside unrelated words, and the number of
   false positives is what makes a safety net get ignored.
   ============================================================ */

/** High-risk phrases. Intercept the chat and show the hotlines. */
export const CRISIS_TRIGGER_PHRASES: string[] = [
  'suicide',
  'kill myself',
  'magpakamatay',
  'pakamatay',
  'mamatay',
  'end my life',
  'end it all',
  'hurt myself',
  'harm myself',
  'self harm',
  'self-harm',
  'cutting',
  'slit my',
  'overdose',
  'hang myself',
  'jump off',
  'want to die',
  'better off dead',
  'giving up on life',
  'ayaw ko na mabuhay',
  'ayoko na mabuhay',
  'gusto ko na mawala',
  'ayaw ko na',
];

/**
 * Help-seeking phrases. These do not interrupt the conversation — they only
 * allow the hotline shortcut in the header to appear, so reaching a human
 * stays one tap away the moment someone asks for it.
 */
export const HELP_TRIGGER_PHRASES: string[] = [
  'i need help',
  'i need someone to talk to',
  'i need to talk to someone',
  'i want to talk to someone',
  'can i talk to someone',
  'talk to someone',
  'someone to talk to',
  'help me',
  'please help',
  'i need a counselor',
  'i need a therapist',
  'i need support',
  'i feel unsafe',
  'i do not feel safe',
  "i don't feel safe",
  'i feel like giving up',
  'i feel like giving in',
  'i cannot do this',
  'i can not do this',
  "i can't do this",
  'i cant do this',
  'hindi ko na kaya',
  'kailangan ko ng tulong',
  'tulong',
  'hotline',
  'crisis',
];

/** Compiles a phrase list once, with word boundaries where they apply. */
const compile = (phrases: string[]): RegExp[] =>
  phrases.map((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lead = /^\w/.test(phrase) ? '\\b' : '';
    const trail = /\w$/.test(phrase) ? '\\b' : '';
    return new RegExp(`${lead}${escaped}${trail}`, 'i');
  });

const CRISIS_MATCHERS = compile(CRISIS_TRIGGER_PHRASES);
const HELP_MATCHERS = compile(HELP_TRIGGER_PHRASES);

const matchesAny = (matchers: RegExp[], text: string): boolean =>
  matchers.some((matcher) => matcher.test(text));

/** The message says someone may be in danger of hurting themselves. */
export const containsCrisisTrigger = (text: string): boolean =>
  matchesAny(CRISIS_MATCHERS, text);

/** The message asks for help, which is enough to surface the hotline. */
export const containsHelpTrigger = (text: string): boolean =>
  matchesAny(HELP_MATCHERS, text);

/**
 * Whether the hotline shortcut may be shown for this message. Used to keep the
 * number out of the header until it is actually relevant.
 */
export const shouldRevealHotline = (text: string): boolean =>
  containsCrisisTrigger(text) || containsHelpTrigger(text);
