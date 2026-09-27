import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  PhoneCall,
  Shield,
  Smile,
  Zap,
  X,
  Heart,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
} from 'lucide-react';
import { CuteCompanion } from './CuteCompanion';
import { PetSpecies, EquippedAccessories } from '../types';
import confetti from 'canvas-confetti';

interface CompanionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  species: PetSpecies;
  companionName: string;
  equipped: EquippedAccessories;
  onAddPoints?: (amount: number) => void;
  onTriggerCrisisSafety?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'companion' | 'user';
  text: string;
  timestamp: string;
  isCrisis?: boolean;
  isStreaming?: boolean;
}

// ============================================================
// LIGHTWEIGHT CLIENT-SIDE MOOD CLASSIFICATION
// Reads the emotional *meaning* of what the user just said so the
// 2D pet can respond in kind. Weighted phrase signals + negation
// and intensifier handling — not exact-keyword matching.
//
// This is presentation only. It decides how the mascot's face
// looks; it never touches what is sent, stored, scored or handled.
// ============================================================
type PetEmotion =
  | 'crying'
  | 'sad'
  | 'lonely'
  | 'anxious'
  | 'serious'
  | 'tired'
  | 'confused'
  | 'loving'
  | 'excited'
  | 'happy'
  | 'calm'
  | 'listening';

/** Ordered by emotional gravity — used to break score ties. */
const EMOTION_PRIORITY: PetEmotion[] = [
  'crying',
  'sad',
  'lonely',
  'anxious',
  'serious',
  'tired',
  'confused',
  'loving',
  'excited',
  'happy',
  'calm',
  'listening',
];

/**
 * Phrase signals per emotion. Longer, more specific phrases carry more
 * weight than single common words, so "can't go on" outweighs "on".
 * A few Tagalog/Taglish cues are included since the sanctuary is PH-facing.
 */
const EMOTION_SIGNALS: Array<{ emotion: PetEmotion; weight: number; phrases: string[] }> = [
  {
    emotion: 'crying',
    weight: 2,
    phrases: [
      "don't know how much longer", 'not much longer', "can't go on", 'cannot go on',
      "can't handle", 'can not handle', 'can handle this', 'handle this', 'too much to carry',
      'at my limit', 'my limit', 'breaking point', 'falling apart', 'fall apart',
      'break down', 'breaking down', 'broke down', 'give up', 'giving up', 'gave up',
      'no point', 'no hope', 'hopeless', 'unbearable', "can't breathe", 'cannot breathe',
      'so hard', 'been so hard', 'really hard', 'so painful', 'in pain', 'hurting',
      'devastated', 'crushed', 'destroyed me', 'ruined', 'miserable', 'rock bottom',
      'worst', 'terrible', 'awful', 'so tired of', 'suffocating', 'drowning',
      'crying', 'cried', 'sobbing', 'sobbing', 'tears', 'shaking', 'numb',
      'walang pag asa', 'hindi ko na kaya', 'sa gitna ng gabi', 'umiiyak',
    ],
  },
  {
    emotion: 'sad',
    weight: 1.6,
    phrases: [
      'sad', 'depressed', 'unhappy', 'grief', 'grieving', 'heartbroken', 'hurt',
      'pain', 'painful', 'empty', 'regret', 'disappointed', 'discouraged',
      'lost', 'loss', 'miss', 'missing', 'sorry', 'apologize', 'failed', 'failure',
      'rejected', 'let down', 'gave up on', 'hurts', 'tired of', 'fed up',
      'malungkot', 'masakit', 'hinihapis',
    ],
  },
  {
    emotion: 'lonely',
    weight: 1.8,
    phrases: [
      'lonely', 'alone', 'nobody', 'no one', 'nobody understands', 'no one understands',
      "nobody cares", 'no one cares', 'left out', 'excluded', 'ignored', 'unwanted',
      'invisible', 'no friends', "don't have anyone", 'dont have anyone', 'by myself',
      'on my own', 'abandoned', 'no one listens', 'nobody listens', 'no one talks to me',
      'walang nakakaintindihan', 'nakaiintindihan', 'akong mag isa', 'walang kaibigan',
    ],
  },
  {
    emotion: 'anxious',
    weight: 1.7,
    phrases: [
      'anxious', 'anxiety', 'nervous', 'worried', 'worry', 'worrying', 'scared',
      'afraid', 'fear', 'panic', 'panicking', 'panicking', 'overwhelmed', 'stressed',
      'stress', 'tense', 'paranoid', 'dread', 'uneasy', 'restless', "can't sleep",
      'cant sleep', 'insomnia', 'racing', 'butterflies', 'freaking out', 'spiraling',
      'spiralling', 'on edge', 'jittery', 'nag aalala', 'takot', 'matatakot', 'kasiyahan',
    ],
  },
  {
    emotion: 'serious',
    weight: 1.7,
    phrases: [
      'angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'annoying',
      'frustrated', 'frustrating', 'pissed', 'resent', 'unfair', 'disrespect',
      'infuriating', 'triggered', 'sick of', 'done with', 'hate', 'ridiculous',
      'galit', 'naihi', 'yabo', 'angal',
    ],
  },
  {
    emotion: 'tired',
    weight: 1.7,
    phrases: [
      'tired', 'exhausted', 'drained', 'sleepy', 'no energy', 'weary', 'worn out',
      'burned out', 'burnt out', "can't keep up", 'cant keep up', 'need to sleep',
      'need sleep', 'knackered', 'running on empty', 'overworked', 'swamped',
      'slept', 'no sleep', 'pagod', 'pagod na', 'tulog', 'hindi na ako makapagpahinga',
    ],
  },
  {
    emotion: 'confused',
    weight: 1.5,
    phrases: [
      'confused', 'confusing', "don't understand", 'dont understand', "don't get it",
      'no idea', 'makes no sense', 'lost track', "what's happening", 'whats happening',
      'why does', 'why do i', 'why am i', 'so weird', 'strange', 'baffled', 'not sure',
      'unsure', 'overthinking', 'overthinking', 'head spin', 'lost', '??',
      'hindi ko maintindihan', 'bakit', 'nakakalito',
    ],
  },
  {
    emotion: 'loving',
    weight: 1.6,
    phrases: [
      'love you', 'i love', 'thank you', 'thanks', 'appreciate', 'grateful',
      'gratitude', "you're the best", 'good boy', 'good girl', 'hug', 'hugs',
      'proud of you', 'care about you', 'adore', 'sweet', 'kind', 'blessed',
      'lucky to have', 'my best friend', 'salamat', 'mahal kita', 'mahal',
    ],
  },
  {
    emotion: 'excited',
    weight: 1.9,
    phrases: [
      'yay', 'yesss', 'yess', 'hooray', 'finally', 'i passed', 'passed my',
      'congrats', 'congratulations', 'promoted', 'got the job', 'got hired',
      'graduat', 'wedding', 'achievement', 'so happy', 'so excited', "can't wait",
      'cant wait', 'great news', 'amazing news', 'best day', 'i did it', 'i won',
      'accepted', 'birthday', 'celebrat', 'it worked', 'passed', 'offer',
      'nakatanggap', 'malaki ang saya',
    ],
  },
  {
    emotion: 'happy',
    weight: 1.2,
    phrases: [
      'happy', 'glad', 'good', 'great', 'better', 'improving', 'proud', 'content',
      'cheerful', 'enjoy', 'enjoying', 'nice', 'wonderful', 'light', 'lighter',
      'masaya', 'buti', 'okay now', 'i am okay', "i'm okay", 'i feel okay',
    ],
  },
  {
    emotion: 'calm',
    weight: 1.3,
    phrases: [
      'calm', 'relaxed', 'relieved', 'at peace', 'peace', 'settled', 'steady',
      'rested', 'unwound', 'quiet', 'slow down', 'grounded', 'clear', 'breathe',
      'breathing', 'meditat', 'yoga', 'peaceful', 'ayon na', 'kalmado', 'payapa',
    ],
  },
];

/**
 * Signals pre-compiled with word boundaries. Unanchored `includes` let short
 * cues fire inside unrelated words — "yay" matched inside "nangyayari", which
 * read a visibly worried message as excitement.
 */
const COMPILED_SIGNALS = EMOTION_SIGNALS.map(({ emotion, weight, phrases }) => ({
  emotion,
  weight,
  matchers: phrases.map((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lead = /^\w/.test(phrase) ? '\\b' : '';
    const trail = /\w$/.test(phrase) ? '\\b' : '';
    return new RegExp(`${lead}${escaped}${trail}`);
  }),
}));

/** "not happy", "i'm not okay", "not happy anymore" — a negated positive is a negative. */
const NEGATED_POSITIVE =
  /\b(?:not|never|no longer|anymore|any more|at all|isn't|wasn't|dont|don't|didn't|does not|do not)\s+(?:\w+\s+){0,2}?(?:really\s+|very\s+|that\s+)?(happy|excited|okay|ok|good|fine|great|calm|relaxed|alright|enough)\b/;

/** Words that deepen whatever feeling the sentence already carries. */
const INTENSIFIERS =
  /\b(?:so|really|very|extremely|incredibly|always|constantly|utterly|deeply|seriously|completely|totally|never|so much|too)\b/;

/**
 * Classifies a user's message into the feeling the pet should mirror.
 * Falls back to 'listening' — attentive, neutral companionship — so the
 * pet is never hardcoded to happy.
 */
const classifyMood = (text: string): PetEmotion => {
  const t = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s'?!]/gu, ' ').replace(/\s+/g, ' ')} `;
  if (!t.trim()) return 'listening';

  const scores: Partial<Record<PetEmotion, number>> = {};
  const bump = (e: PetEmotion, n: number) => {
    scores[e] = (scores[e] ?? 0) + n;
  };

  for (const { emotion, weight, matchers } of COMPILED_SIGNALS) {
    for (const matcher of matchers) {
      // Phrases stack within an emotion: leaning on several words for the
      // same feeling ("hopeless", "empty", "numb") is real evidence of how
      // strongly the user feels it.
      if (matcher.test(t)) bump(emotion, weight);
    }
  }

  // Negation flips a positive statement into a heavy one.
  if (NEGATED_POSITIVE.test(t)) {
    bump('sad', 2.2);
    bump('crying', 1);
  }

  // Intensity scales whatever was already detected.
  const intensity = INTENSIFIERS.test(t) ? 1.4 : 1;
  for (const key of Object.keys(scores) as PetEmotion[]) {
    scores[key] = (scores[key] ?? 0) * intensity;
  }

  // A question with no clearer signal reads as thoughtful confusion.
  if (/(?:\?\?|\?$)/.test(text.trim()) && !(scores.excited || scores.happy)) {
    bump('confused', 0.8);
  }

  let best: PetEmotion = 'listening';
  let bestScore = 0;
  for (const emotion of EMOTION_PRIORITY) {
    const score = scores[emotion] ?? 0;
    if (score > bestScore) {
      best = emotion;
      bestScore = score;
    }
  }
  return best;
};

/** Maps a classified feeling onto the 2D mascot's expression vocabulary. */
const EMOTION_TO_PET_MOOD: Record<PetEmotion, string> = {
  crying: 'crying',
  sad: 'sad',
  lonely: 'lonely',
  anxious: 'anxious',
  serious: 'serious',
  tired: 'tired',
  confused: 'curious',
  loving: 'loving',
  excited: 'excited',
  happy: 'happy',
  calm: 'calm',
  listening: 'listening',
};

// ============================================================
// OFFLINE-FALLBACK REPLY POOLS
// Used only when the live streaming endpoint fails. Several lines per
// feeling so the companion never answers every message with the exact
// same sentence — the reply is picked to match the mood just classified,
// then chosen at random from that mood's pool.
// ============================================================
const FALLBACK_REPLIES: Record<PetEmotion, string[]> = {
  crying: [
    "*presses close and lets you lean on me, holding steady while you cry* I'm right here. You don't have to explain anything right now. Just breathe with me.",
    '*nuzzles gently and stays very still beside you* This is a lot to carry. I\u2019m not going anywhere. Take your time.',
    "*rests my whole weight against you, warm and quiet* Whatever this is, it's heavy. Let's just sit in it together for a moment.",
  ],
  sad: [
    '*settles close with soft, sad eyes mirroring yours* I feel how heavy this is for you. Want to tell me more, or just sit together quietly?',
    "*leans my head gently against your arm* I'm sorry today feels like this. You don't have to pretend it's okay with me.",
    "*curls up beside you, tail still* That sounds really hard. I'm listening, for as long as you need.",
  ],
  lonely: [
    "*stays extra close, refusing to leave your side* You're not alone right now — I'm right here, and I'm not going anywhere.",
    '*presses against your hand, gentle and steady* Even when it feels like no one else is around, I am. Talk to me.',
    "*tucks in beside you quietly* Loneliness is heavy. Let's keep each other company for a bit.",
  ],
  anxious: [
    "*sits calmly and breathes slowly, inviting you to match my pace* Let's slow this down together. In... and out. What's the loudest worry right now?",
    "*keeps very still, a steady presence next to the racing thoughts* I've got you. One breath at a time — you don't have to solve everything this second.",
    "*rests a paw gently near yours, grounding* That sounds like a lot of 'what ifs.' Let's name just one, together.",
  ],
  serious: [
    "*doesn't flinch, just stays steady while you vent* That's frustrating, and it's okay to feel that. Let it out — I can take it.",
    "*sits attentively, ears forward, taking you seriously* Something's clearly not sitting right with you. Tell me what happened.",
    '*holds a calm, grounded posture next to your frustration* I hear you. What part of this made you angriest?',
  ],
  tired: [
    "*yawns softly and settles low, matching your energy* Sounds like you're running on empty. Want to just rest here for a bit?",
    "*curls up quietly beside you, slow and unhurried* You don't have to have energy for this conversation. I'll wait with you.",
    '*lays down heavily, sympathetically* Pagod na pagod ka na, no? Let\u2019s just breathe slow for a minute.',
  ],
  confused: [
    "*tilts head, curious and patient* That does sound confusing. Want to try saying it out loud again, piece by piece?",
    "*waits quietly, giving you space to think* No rush. Let's untangle this one thread at a time.",
    "*blinks thoughtfully* Hmm, that is a lot to make sense of. What's the part that's confusing you most?",
  ],
  loving: [
    "*wags/purrs warmly, soaking in the kindness* That means a lot, thank you for saying it. I care about you too.",
    "*leans into you happily* Aww, kaibigan. I'm really glad you're here.",
    "*nuzzles affectionately* You're kind for saying that. I feel lucky to be your companion.",
  ],
  excited: [
    "*bounces happily, tail wagging fast* Yesss! Tell me everything — I want to hear all of it!",
    "*spins in a happy little circle* That's wonderful news! I'm so proud of you!",
    '*perks up, eyes bright* Ang saya naman! Let\u2019s celebrate this moment together.',
  ],
  happy: [
    "*relaxes into a warm, content posture* I'm really glad to hear that. What's been going well?",
    '*smiles softly, settled and at ease* That\u2019s a nice thing to sit with for a moment.',
    "*wags gently, calm and pleased* Good days deserve to be noticed too.",
  ],
  calm: [
    "*breathes slow and easy beside you* This feels like a good, quiet moment. Let's stay in it a little longer.",
    "*settles peacefully next to you* Calm looks good on you. I'm happy to just be here.",
    '*rests quietly, unhurried* Nice and steady. No need to rush anything right now.',
  ],
  listening: [
    "*tilts head and settles in to listen* I hear you. Take your time — what's on your mind?",
    "*keeps a warm, steady gaze on you* I'm right here. Go on, whenever you're ready.",
    '*waits patiently, ears perked* Tell me more, friend.',
  ],
};

/** Picks a reply for the given mood without repeating the very last one said,
    so two offline replies in a row for the same feeling still read differently. */
const pickFallbackReply = (mood: PetEmotion, avoid?: string): string => {
  const pool = FALLBACK_REPLIES[mood];
  const options = pool.length > 1 && avoid ? pool.filter((line) => line !== avoid) : pool;
  return options[Math.floor(Math.random() * options.length)];
};

export const CompanionChatModal: React.FC<CompanionChatModalProps> = ({
  isOpen,
  onClose,
  species,
  companionName,
  equipped,
  onAddPoints,
  onTriggerCrisisSafety,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'companion',
      text: `*nuzzles close warmly and looks up at you* Hi friend! I'm right here with you. Whatever is on your mind today, you're safe to share it with me. 🌿`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Listening with care');
  const [companionMood, setCompanionMood] = useState<'idle' | 'happy' | 'listening' | 'excited'>('happy');
  const [isPurring, setIsPurring] = useState(false);
  const [isVoiceSpeechEnabled, setIsVoiceSpeechEnabled] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [hasAwardedPoints, setHasAwardedPoints] = useState(false);
  // The feeling the pet mirrors back. Presentation only — set from the
  // user's own words so the companion reacts in kind.
  const [petReflection, setPetReflection] = useState<PetEmotion>('listening');
  // The last fallback line actually said, so a second offline reply for the
  // same mood doesn't repeat it verbatim.
  const lastFallbackRef = useRef<string | undefined>(undefined);

  const purrAudioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for Live Mic input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListeningMic(false);
        };

        recognition.onend = () => {
          setIsListeningMic(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition not available:', e);
      }
    }
  }, []);

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message below!');
      return;
    }

    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  // Text-To-Speech: Speak companion reply with warm, soothing voice
  const speakCompanionReply = (fullText: string) => {
    if (!isVoiceSpeechEnabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      // Remove asterisks mannerisms (e.g. *soft tail wag*) for cleaner spoken audio
      const spokenWords = fullText.replace(/\*[^*]+\*/g, '').trim();
      if (!spokenWords) return;

      const utterance = new SpeechSynthesisUtterance(spokenWords);
      utterance.rate = 0.92; // Gently relaxed pacing
      utterance.pitch = species === 'dog' ? 1.05 : 1.15; // Warm, friendly pitch

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // 28Hz Feline Purr Web Audio Synthesizer
  const togglePurr = () => {
    try {
      if (isPurring) {
        if (purrAudioRef.current) {
          purrAudioRef.current.osc.stop();
          purrAudioRef.current.ctx.close();
          purrAudioRef.current = null;
        }
        setIsPurring(false);
      } else {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const masterGain = ctx.createGain();

        // 28Hz fundamental feline purr frequency
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(28, ctx.currentTime);

        // Amplitude modulation breathing rhythm (~4.2 Hz)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(4.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

        masterGain.gain.setValueAtTime(0.06, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(masterGain.gain);
        osc.connect(masterGain);
        masterGain.connect(ctx.destination);

        osc.start();
        lfo.start();

        purrAudioRef.current = { ctx, osc, gain: masterGain };
        setIsPurring(true);
      }
    } catch (e) {
      console.warn('Purr audio error:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (purrAudioRef.current) {
        try {
          purrAudioRef.current.osc.stop();
          purrAudioRef.current.ctx.close();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Feeling overwhelmed today 🌊',
    'Help me separate what I can control 🧭',
    'Need to vent safely 🍃',
    'Guide me through a breath 💨',
    'Pahinga muna tayo? ☕',
  ];

  // The pet holds the feeling the user last shared, so it stays beside them
  // instead of snapping back to cheerful once the reply finishes.
  const petMood = (() => {
    const lastCompanionMessage = [...messages].reverse().find((m) => m.sender === 'companion');
    if (lastCompanionMessage?.isCrisis) return 'crying';
    if (companionMood === 'excited') return 'excited';
    if (isStreaming) return 'listening';
    return EMOTION_TO_PET_MOOD[petReflection];
  })();

  // LIVE STREAMING SEND HANDLER
  const handleSendText = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    }

    const userText = text.trim();
    // The pet reads the feeling behind these words and wears it. Kept in a
    // local const so the offline fallback below can pick a reply that
    // matches the SAME classification, without re-running it.
    const detectedMood = classifyMood(userText);
    setPetReflection(detectedMood);
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare streaming companion message placeholder
    const compMsgId = 'comp-' + Date.now();
    const compMsgPlaceholder: ChatMessage = {
      id: compMsgId,
      sender: 'companion',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, compMsgPlaceholder]);
    setInputText('');
    setIsStreaming(true);
    setLiveStatus('Reflecting in real-time...');
    setCompanionMood('listening');

    // Mindful reflection reward
    if (!hasAwardedPoints && onAddPoints) {
      onAddPoints(5);
      setHasAwardedPoints(true);
    }

    let fullAccumulatedText = '';

    // CRISIS TRIGGER WORDS DETECTION (PHILIPPINES MENTAL HEALTH HOTLINES)
    const CRISIS_TRIGGER_REGEX = /(suicide|kill myself|magpakamatay|mamatay|end my life|hurt myself|harm myself|cutting|ayaw ko na mabuhay|ayoko na mabuhay|gusto ko na mawala|overdose|hang myself|jump off|i want to die|self harm|end it all)/i;
    const isCrisisTrigger = CRISIS_TRIGGER_REGEX.test(userText);

    if (isCrisisTrigger) {
      if (onTriggerCrisisSafety) {
        onTriggerCrisisSafety();
      }
      setCompanionMood('idle');
      const crisisHotlineText = `*rests head gently on your lap and looks into your eyes with deep compassion* \n\nFriend, your life is deeply important, and you do not have to carry this heavy pain alone. Please connect with people who can help support you right this moment:\n\n📞 **NCMH Crisis Hotline:** 1553 (Toll-Free Nationwide)\n📱 **Globe / TM:** 0966-351-4518 / 0917-899-8727\n📱 **Smart / Sun / TNT:** 0908-639-2672\n💬 **Crisis Textline:** Text "USAP" to 1553\n\nI am staying right here with you. Huminga tayo nang malalim nang sabay. 🌿`;

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === compMsgId
              ? { ...m, text: crisisHotlineText, isCrisis: true, isStreaming: false }
              : m
          )
        );
        setIsStreaming(false);
        setLiveStatus('Safe crisis support active 🛡️');
      }, 500);
      return;
    }

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      // Connect to Live Streaming Endpoint
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          companionName,
          species,
          history: historyPayload,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      setLiveStatus('Live AI streaming ⚡');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.slice(6);
                const data = JSON.parse(jsonStr);

                if (data.isCrisis && onTriggerCrisisSafety) {
                  onTriggerCrisisSafety();
                }

                if (data.text) {
                  fullAccumulatedText += data.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === compMsgId
                        ? { ...m, text: fullAccumulatedText, isCrisis: data.isCrisis }
                        : m
                    )
                  );
                }

                if (data.done) {
                  done = true;
                }
              } catch (e) {
                // Ignore chunk parse glitch
              }
            }
          }
        }
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) => (m.id === compMsgId ? { ...m, isStreaming: false } : m))
      );
      setCompanionMood('happy');
      setLiveStatus('Active now');

      // Voice read aloud if enabled
      speakCompanionReply(fullAccumulatedText);
    } catch (err) {
      console.warn('[CompanionChat] Streaming fallback to offline:', err);
      // Picked from a pool matching the mood just classified, and never the
      // exact line said last time, so repeated offline replies still vary.
      const fallback = pickFallbackReply(detectedMood, lastFallbackRef.current);
      lastFallbackRef.current = fallback;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === compMsgId ? { ...m, text: fallback, isStreaming: false } : m
        )
      );
      setCompanionMood('happy');
      setLiveStatus('Active now');
      speakCompanionReply(fallback);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
  };

  const handlePetMini = () => {
    setCompanionMood('excited');
    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.3 },
    });
    setTimeout(() => setCompanionMood('happy'), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1411]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      {/* RESPONSIVE SANCTUARY CHAT CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl h-[720px] max-h-[94vh] rounded-3xl bg-white dark:bg-[#13221b] border border-emerald-100 dark:border-emerald-800/50 shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
      >
        {/* ============================================================
            COMPANION SIDEBAR (kept) + 2D PET PINNED BOTTOM-LEFT
            ============================================================ */}
        <div className="hidden md:flex flex-col items-center w-72 bg-emerald-50/50 dark:bg-[#13221b] p-4 border-r border-emerald-100 dark:border-emerald-800/50 shrink-0 relative overflow-x-hidden overflow-y-auto">
          {/* Ambient glow behind the pet. Deliberately a warm neutral rather than
              the brand emerald: a large translucent green pool sitting behind
              the mascot cast a green wash over its amber (dog) and ginger (cat)
              coat, and the themed `emerald-400` also re-resolves very differently
              in Light vs Dark Mode. Neutral keeps the pet's own colours intact
              in both. */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#f5c987]/20 dark:bg-[#f5c987]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Companion name — identity only, never an emotion read-out */}
          <div className="w-full flex items-center shrink-0 z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-emerald-950/80 border border-emerald-200 dark:border-[#2d4d41]/75 shadow-xs min-w-0">
              <span className="text-xs shrink-0">{species === 'dog' ? '🐶' : '🐱'}</span>
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-100 truncate">
                {companionName}
              </span>
            </div>
          </div>

          {/* Companion Live Talking Speech Bubble (sits above the pet) */}
          <div className="relative mt-3 w-full p-3 bg-white dark:bg-[#182a22] rounded-2xl border border-emerald-200/90 dark:border-[#2d4d41]/70 shadow-md text-xs text-emerald-950 dark:text-emerald-50 text-center font-medium leading-relaxed z-10 shrink-0">
            {/* Tail now points down toward the pet */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-[#182a22]" />
            <p className="line-clamp-3">
              {isStreaming
                ? `*listens attentively and focuses warmly on you*`
                : companionMood === 'excited'
                ? `*happily barks/purrs and wags with joy!*`
                : messages.length > 0 && messages[messages.length - 1].sender === 'companion'
                ? messages[messages.length - 1].text.slice(0, 100) + '...'
                : `Nandito lang ako para sa'yo, kaibigan. Anong nasa isip mo?`}
            </p>
          </div>

          {/* ============================================================
              THE COMPANION, AT THE BOTTOM-LEFT OF THE SIDEBAR.
              No card, no panel, no emotion chip — the pet's face and
              drift carry the feeling, and it sits straight on the
              sanctuary background. shrink-0 + z-20 keep it from being
              squashed or hidden by the sidebar's flex/overflow.
              ============================================================ */}
          <div className="mt-auto pt-3 w-full flex flex-col items-center shrink-0 z-20">
            <motion.div
              onClick={handlePetMini}
              className="relative z-10 w-60 h-60 shrink-0 flex items-center justify-center cursor-pointer group"
              title={`Tap to gently pet ${companionName}!`}
            >
              {/* Soft light from above and a blurred contact shadow below, so the
                  mascot reads as a lit, grounded presence rather than a flat
                  sticker floating over the background. Both are warm neutrals:
                  a strong white haze here sat right behind the pet's head and
                  hat and flattened the contrast its cream muzzle and pale
                  accessories depend on in Light Mode. */}
              <div className="absolute inset-x-8 top-1 h-20 rounded-full bg-[#fff6e6]/40 dark:bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-6 rounded-full bg-[#3a2410]/25 dark:bg-[#0b1411]/40 blur-md pointer-events-none" />

              {/* A slow, continuous breathing drift — small enough to read as
                  "alive" rather than as an obvious loop. */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <CuteCompanion
                  species={species}
                  mood={petMood}
                  equipped={equipped}
                  size="lg"
                  interactive={true}
                  force2D
                />
              </motion.div>
              <div className="absolute bottom-1 z-20 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-[#0b1411]/70 px-2 py-0.5 rounded-full shadow-xs pointer-events-none">
                Tap to Pet 💚
              </div>
            </motion.div>
          </div>

          {/* Safety reassurance footnote — the purr control now lives only in
              the header above, so it isn't offered twice on desktop. */}
          <div className="w-full shrink-0 flex items-center justify-center gap-1.5 z-10 pt-3 mt-1 border-t border-emerald-100 dark:border-emerald-800/40 text-[10px] text-emerald-700 dark:text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>Safe &bull; Confidential &bull; Judgment-free</span>
          </div>
        </div>

        {/* ============================================================
            MAIN CHAT COLUMN (MESSAGES + INPUT)
            ============================================================ */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ============================================================
            TOP CHAT HEADER
            ============================================================ */}
        <div className="px-3.5 sm:px-5 py-3 bg-white dark:bg-[#13221b] border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between shrink-0 z-20">
          {/* Left: Back button & Companion Profile */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 cursor-pointer transition-colors shrink-0"
              title="Back to Sanctuary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div
              onClick={handlePetMini}
              className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-[#2d4d41] flex items-center justify-center text-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-xs shrink-0"
              title={`Tap to gently pet ${companionName}!`}
            >
              {species === 'dog' ? '🐶' : '🐱'}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 leading-tight truncate flex items-center gap-1.5">
                <span>{companionName}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                  AI Friend
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{liveStatus}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions with consistent h-8 heights */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Live Text-to-Speech Voice Toggle */}
            <button
              onClick={() => {
                const next = !isVoiceSpeechEnabled;
                setIsVoiceSpeechEnabled(next);
                if (!next && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isVoiceSpeechEnabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
              title={isVoiceSpeechEnabled ? 'Voice Aloud: ON' : 'Turn Voice Aloud ON'}
            >
              {isVoiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* 28Hz Feline Purr Somatic Calming Button */}

            {/* 24/7 Crisis Hotline Trigger — kept in an urgent color on purpose:
                a safety exit should stay visually distinct from the calm
                emerald/white theme everywhere else. */}
            {onTriggerCrisisSafety && (
              <button
                onClick={onTriggerCrisisSafety}
                className="h-8 px-2.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60 cursor-pointer shadow-xs flex items-center gap-1"
                title="24/7 Philippines Crisis Support (1553)"
              >
                <span>🆘</span>
                <span>1553</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/60 cursor-pointer text-emerald-600 dark:text-emerald-300 transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calm Mindful Atmosphere Banner */}
        <div className="px-4 py-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span>🌿</span>
            <span>Ligtas at pribadong espasyo para sa iyong damdamin</span>
          </div>
        </div>

        {/* ============================================================
            CHAT MESSAGES VIEWPORT
            Companion bubbles hug the LEFT, user bubbles hug the RIGHT.
            No per-message avatar — the 2D pet lives in the sidebar.
            ============================================================ */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 relative z-10 bg-white dark:bg-[#13221b]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                    : msg.isCrisis
                    ? 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-2 border-rose-300 dark:border-rose-700 rounded-bl-xs'
                    : 'bg-white dark:bg-[#182a22] text-emerald-950 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse rounded-xs" />
                  )}
                </p>
                <span
                  className={`block text-[10px] mt-1 text-right font-medium ${
                    msg.sender === 'user'
                      ? 'text-emerald-100'
                      : 'text-emerald-400/80'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </motion.div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ============================================================
            COMPACT COMPANION
            The left sidebar is `hidden md:flex`, so below the md
            breakpoint the mascot would vanish entirely. No card, no
            chip — just the same 2D pet sitting on the background.
            ============================================================ */}
        <div className="md:hidden shrink-0 z-20 flex items-center pl-3 -mt-1">
          <motion.div
            onClick={handlePetMini}
            className="relative z-10 w-24 h-24 shrink-0 flex items-center justify-center cursor-pointer"
            title={`Tap to gently pet ${companionName}!`}
          >
            {/* Same grounding shadow + gentle drift as the desktop mascot, scaled down */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full bg-emerald-950/20 dark:bg-[#0b1411]/35 blur-sm pointer-events-none" />
            <motion.div
              animate={{ y: [0, -2.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <CuteCompanion
                species={species}
                mood={petMood}
                equipped={equipped}
                size="sm"
                interactive={true}
                force2D
              />
            </motion.div>
          </motion.div>
          <span className="text-xs font-black text-emerald-800 dark:text-emerald-200 truncate">
            {companionName}
          </span>
        </div>

        {/* ============================================================
            QUICK CHAT — SUGGESTION PILLS
            ============================================================ */}
        <div className="bg-white dark:bg-[#13221b] z-20 shrink-0 border-t border-emerald-100 dark:border-emerald-900/40">
          <div className="px-3.5 pt-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-400/80">
            <Zap className="w-3 h-3" />
            <span>Quick Chat</span>
          </div>
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendText(p)}
                disabled={isStreaming}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-[#182a22] border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shrink-0 shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Live Mic Listening Notice Banner */}
        {isListeningMic && (
          <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border-t border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Listening to your voice... Speak now!</span>
            </span>
            <button
              onClick={toggleMicListening}
              className="text-[11px] underline cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* ============================================================
            BOTTOM CHAT INPUT BAR WITH LIVE MIC
            ============================================================ */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white dark:bg-[#13221b] border-t border-emerald-100 dark:border-emerald-800/60 flex items-center gap-2 shrink-0 z-20"
        >
          {/* Live Mic Speech-To-Text Button */}
          <button
            type="button"
            onClick={toggleMicListening}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListeningMic
                ? 'bg-emerald-600 text-white shadow-lg animate-pulse ring-2 ring-emerald-300'
                : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
            }`}
            title={isListeningMic ? 'Stop Listening' : 'Speak Live into Microphone 🎙️'}
          >
            {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListeningMic ? 'Listening...' : `Talk live with ${companionName}...`}
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-emerald-400 dark:placeholder:text-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            title="Send live message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        </div>
      </motion.div>
    </div>
  );
};