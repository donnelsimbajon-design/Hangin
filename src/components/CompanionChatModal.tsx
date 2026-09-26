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

  // LIVE STREAMING SEND HANDLER
  const handleSendText = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    }

    const userText = text.trim();
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
      const fallback = `*gently rests a warm paw in your hand and breathes calmly with you* I hear you. Take a soft breath. What part of this feels within your control today, and what can we gently set aside for now?`;

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      {/* RESPONSIVE SANCTUARY CHAT CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl h-[720px] max-h-[94vh] rounded-3xl bg-gradient-to-b from-white via-white to-emerald-50/30 dark:from-[#0d1c13] dark:via-[#09150e] dark:to-[#060e0a] border border-emerald-200/80 dark:border-emerald-700/50 shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
      >
        {/* ============================================================
            SIDE ANIMAL STAGE (Client requirement: Animal of choice at the side with chat bubble)
            ============================================================ */}
        <div className="hidden md:flex flex-col items-center justify-between w-72 bg-gradient-to-b from-emerald-100/60 via-emerald-50/40 to-white dark:from-[#0b1a12] dark:via-[#08150e] dark:to-[#050e09] p-5 border-r border-emerald-100 dark:border-emerald-800/50 shrink-0 relative overflow-hidden">
          {/* Ambient glow behind pet */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Pet Badge */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/60 shadow-xs">
              <span className="text-xs">{species === 'dog' ? '🐶' : '🐱'}</span>
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-100">{companionName}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 capitalize">
              {companionMood}
            </span>
          </div>

          {/* 3D / Animated Mascot Stage */}
          <div className="my-auto w-full flex flex-col items-center z-10">
            <div
              onClick={handlePetMini}
              className="w-48 h-48 cursor-pointer relative group flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title={`Tap to gently pet ${companionName}!`}
            >
              <CuteCompanion
                species={species}
                mood={companionMood}
                size="md"
                interactive={true}
              />
              <div className="absolute bottom-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/70 px-2 py-0.5 rounded-full shadow-xs">
                Tap to Pet 💖
              </div>
            </div>

            {/* Companion Live Talking Speech Bubble */}
            <div className="relative mt-2 p-3 bg-white/95 dark:bg-[#12241a]/95 rounded-2xl border border-emerald-200/90 dark:border-emerald-700/70 shadow-md text-xs text-emerald-950 dark:text-emerald-50 w-full text-center font-medium leading-relaxed">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white dark:border-b-[#12241a]" />
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
          </div>

          {/* Calming Action Buttons */}
          <div className="w-full flex flex-col gap-2 z-10 pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
            <button
              onClick={togglePurr}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isPurring
                  ? 'bg-amber-100 text-amber-900 border border-amber-400 dark:bg-amber-950 dark:text-amber-200 animate-pulse'
                  : 'bg-white/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>{isPurring ? '🐾 28Hz Purr On' : '🐾 Play 28Hz Purr'}</span>
            </button>
            <div className="text-[10px] text-center text-emerald-700 dark:text-emerald-400">
              Safe &bull; Confidential &bull; Judgment-free
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN CHAT COLUMN (MESSAGES + INPUT)
            ============================================================ */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ============================================================
            TOP CHAT HEADER
            ============================================================ */}
        {/* ============================================================
            TOP CHAT HEADER (POLISHED & PROPORTIONATE - IMAGE 1 FIX)
            ============================================================ */}
        <div className="px-3.5 sm:px-5 py-3 bg-white/95 dark:bg-[#102218]/95 backdrop-blur-md border-b border-emerald-100/80 dark:border-emerald-800/60 flex items-center justify-between shrink-0 z-20">
          {/* Left: Back button & Companion Profile */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-emerald-900/60 text-slate-600 dark:text-emerald-200 cursor-pointer transition-colors shrink-0"
              title="Back to Sanctuary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div
              onClick={handlePetMini}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-900/80 dark:to-teal-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-xs shrink-0"
              title={`Tap to gently pet ${companionName}!`}
            >
              {species === 'dog' ? '🐶' : '🐱'}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-emerald-50 leading-tight truncate flex items-center gap-1.5">
                <span>{companionName}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
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
          <div className="flex items-center gap-1.5 shrink-0">
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
                  ? 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 shadow-xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
              title={isVoiceSpeechEnabled ? 'Voice Aloud: ON' : 'Turn Voice Aloud ON'}
            >
              {isVoiceSpeechEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* 28Hz Feline Purr Somatic Calming Button */}
            <button
              onClick={togglePurr}
              className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isPurring
                  ? 'bg-amber-100 text-amber-900 border border-amber-400 dark:bg-amber-950 dark:text-amber-300 animate-pulse shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-200'
              }`}
              title="Toggle 28Hz Purr Somatic Calming"
            >
              <span>🐾</span>
              <span className="hidden sm:inline">Purr</span>
            </button>

            {/* 24/7 Crisis Hotline Trigger */}
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
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-emerald-900/60 cursor-pointer text-slate-500 dark:text-emerald-300 transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calm Mindful Atmosphere Banner */}
        <div className="px-4 py-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span>🌿</span>
            <span>Ligtas at pribadong espasyo para sa iyong damdamin</span>
          </div>
          <button
            onClick={handlePetMini}
            className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-300 hover:underline cursor-pointer"
          >
            <Heart className="w-3 h-3 fill-current text-rose-500" />
            <span>Himasin si {companionName}</span>
          </button>
        </div>

        {/* ============================================================
            CHAT MESSAGES VIEWPORT (CLEAN, SCROLLABLE, ZERO OVERLAP)
            ============================================================ */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 relative z-10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'companion' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-sm shrink-0 mb-1 shadow-2xs">
                  {species === 'dog' ? '🐶' : '🐱'}
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#58cc02] text-white rounded-br-xs font-medium'
                    : msg.isCrisis
                    ? 'bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-2 border-rose-300 dark:border-rose-700 rounded-bl-xs'
                    : 'bg-white dark:bg-[#152a1e] text-slate-800 dark:text-emerald-100 border border-slate-200/90 dark:border-emerald-800/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#58cc02] animate-pulse rounded-xs" />
                  )}
                </p>
                <span
                  className={`block text-[10px] mt-1 text-right font-medium ${
                    msg.sender === 'user'
                      ? 'text-emerald-100'
                      : 'text-slate-400 dark:text-emerald-400/80'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ============================================================
            QUICK SUGGESTION PILLS
            ============================================================ */}
        <div className="px-3 py-1.5 bg-white/70 dark:bg-[#11231a]/70 backdrop-blur-xs flex gap-1.5 overflow-x-auto z-20 shrink-0 border-t border-slate-100 dark:border-emerald-900/40">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSendText(p)}
              disabled={isStreaming}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-[#152a1e] border border-emerald-300/80 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shrink-0 shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Live Mic Listening Notice Banner */}
        {isListeningMic && (
          <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-950/80 border-t border-rose-200 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
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
          className="p-3 bg-white dark:bg-[#11231a] border-t border-emerald-100 dark:border-emerald-800/60 flex items-center gap-2 shrink-0 z-20"
        >
          {/* Live Mic Speech-To-Text Button */}
          <button
            type="button"
            onClick={toggleMicListening}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListeningMic
                ? 'bg-rose-500 text-white shadow-lg animate-pulse ring-2 ring-rose-400'
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
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-100 text-xs sm:text-sm focus:ring-2 focus:ring-[#58cc02] focus:outline-none placeholder:text-slate-400 dark:placeholder:text-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="w-10 h-10 rounded-2xl bg-[#58cc02] hover:bg-[#46a302] disabled:opacity-40 text-white flex items-center justify-center shadow-md active:translate-y-0.5 transition-all cursor-pointer shrink-0"
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
