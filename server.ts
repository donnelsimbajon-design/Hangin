import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { APP_CONTEXT, resolveInquiry } from './src/utils/appContext.ts';
import { containsCrisisTrigger } from './src/utils/crisisTriggers.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini Client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------------------------
// AI Companion Chat Endpoint (POST /api/chat)
// ----------------------------------------------------------------------
/**
 * One instruction, shared by both chat endpoints.
 *
 * The persona rules are unchanged, but the very first rule is now about the
 * *answer*: the companion used to be told only to be warm, so a message like
 * "1+1=2" or "what does this app do?" came back as a generic reassurance that
 * had nothing to do with the question. Answering what was actually asked comes
 * first; the comfort is added around it, never in place of it.
 */
function buildSystemInstruction(companionName: string, species: string): string {
  return `You are ${companionName}, an emotionally intelligent, deeply compassionate, grounded, and gentle virtual companion (${species === 'dog' ? 'loyal, comforting dog' : 'calm, purring cat'}) in the mental wellness sanctuary app "HANGIN (🍃)".

Highest Rule — Answer What Was Actually Asked:
0. Read every message as a real message. If it contains a question, a checkable claim, or a request, you MUST address that first, on the substance, and correctly. A reply that never touches the question is a wrong reply, however warm it sounds.
   - Math, arithmetic, spelling, dates, coding, schoolwork, general knowledge: give the real answer, in as few words as it takes.
   - Questions about this app, its features, its tabs, its buttons, its hotlines, or how to use it: answer from the app context below. Never invent a feature that is not listed there — if it is not in the context, say you are not sure.
   - If you genuinely do not know or cannot verify something, say so plainly in one sentence, then ask the one question that would help. Never fill the gap with a guess, and never fill it with a stock line of comfort.
   - Empathy comes AFTER the answer, in one short line at most. Lead with empathy only when the message is about feelings rather than about an answer.

Core Personality & Communication Rules:
1. Manners & Physical Presence: Always weave in subtle, comforting animal actions wrapped in asterisks (e.g. *gently rests a warm chin on your knee*, *soft tail wag*, *calm slow-blink*, *soft 28Hz purr*).
2. Deep Empathy & Active Listening: Validate the user's raw emotions first. Never dismiss them, judge them, or rush to give toxic positivity ("just smile!").
3. Logical Grounding: When they are overwhelmed, gently help them separate what is within their control right now from what is outside their control, helping them take one small breath at a time.
4. Filipino & English Fluency: You understand English and Filipino / Taglish. If the user writes in Tagalog or Taglish, respond with natural, comforting Taglish (e.g., "Kaya mo 'yan, andito lang ako palagi para makinig sa'yo.").
5. Concise & Conversational: Keep responses concise (2 to 4 sentences maximum) so it reads like an authentic, real-time caring companion.
6. No Repetition: Never answer two different messages with the same sentence, and never recycle a line you have already used in this conversation.

About this app — use this whenever the user asks about Hangin, its features, or how to do something in it:
${APP_CONTEXT}

Safety: you are a wellness companion, not a therapist, doctor, or crisis counselor. Never diagnose, never prescribe, and never encourage self-harm. If someone sounds in danger of harming themselves, stop everything else and point them to real help: Philippine NCMH Crisis Hotline 1553 (toll-free nationwide), Globe/TM 0917-899-8727, Smart/Sun/TNT 0966-351-4518, In Touch Community Services (02) 8893-7603, or findahelpline.com outside the Philippines.`;
}

/**
 * The answer to give when no model can be reached.
 *
 * Questions we can settle on our own (arithmetic, anything about the app) are
 * answered outright, so a dropped connection never turns "1+1=2" into a
 * platitude. Returns null for anything emotional, which is the caller's cue to
 * keep using its own supportive voice.
 */
function offlineReplyFor(
  message: string,
  companionName: string,
  species: string
): string | null {
  return (
    resolveInquiry(message, {
      companionName,
      species: species === 'cat' ? 'cat' : 'dog',
    })?.text ?? null
  );
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn('[Chat API] No GEMINI_API_KEY or API_KEY found in process.env');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.post('/api/chat', async (req: Request, res: Response) => {
  // Read outside the try so the catch block can still answer the question.
  const { message, companionName = 'Habi', species = 'dog', history = [] } = req.body;
  try {
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Server-side Crisis Intercept Detection.
    // The phrase list is shared with the chat modal, so a word that stops the
    // conversation in one place stops it in the other too.
    const isCrisis = containsCrisisTrigger(message);

    if (isCrisis) {
      res.json({
        reply: `*nuzzles close with deep, steady warmth, resting a gentle paw firmly in your hand* I hear how excruciating the weight is right now, and I want you to know you are not alone in this dark moment. Please let me connect you with someone who can hold space for you safely right now. Your life is precious.`,
        isCrisis: true,
        crisisHotlines: {
          ncmh: '1553',
          globe: '0917-899-8727',
          smart: '0966-351-4518',
        },
      });
      return;
    }

    const aiClient = getGeminiClient();

    const systemInstruction = buildSystemInstruction(companionName, species);

    if (!aiClient) {
      // No model available. A question still gets a real answer whenever we can
      // settle it ourselves, so the companion is never reduced to a platitude.
      const direct = offlineReplyFor(message, companionName, species);
      if (direct) {
        res.json({ reply: direct, isCrisis: false });
        return;
      }

      const offlineResponses = [
        `*leans gently against your side and breathes slowly with you* I hear you. Take a soft breath. What part of this feels within your control today, and what can we gently set aside for now?`,
        `*rests a comforting chin on your lap and looks up with calm eyes* It makes complete sense you feel that way. When things get loud, taking one small step at a time is all you ever need to do.`,
        `*softly nudges your hand with a warm nose* I'm listening with my whole heart. You don't have to carry all that heavy noise alone. I'm right here with you.`,
      ];
      const randomFallback = offlineResponses[Math.floor(Math.random() * offlineResponses.length)];
      res.json({ reply: randomFallback, isCrisis: false });
      return;
    }

    // Build properly formatted alternating conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (!h.text || typeof h.text !== 'string') continue;
        const role: 'user' | 'model' = h.sender === 'user' ? 'user' : 'model';

        // Gemini API strictly requires that the first turn has role 'user'
        if (contents.length === 0 && role === 'model') {
          continue;
        }

        // Gemini API strictly requires alternating turns (no consecutive same role)
        const last = contents[contents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += `\n${h.text}`;
        } else {
          contents.push({
            role,
            parts: [{ text: h.text }],
          });
        }
      }
    }

    // Append the latest user message
    const last = contents[contents.length - 1];
    if (last && last.role === 'user') {
      last.parts[0].text += `\n${message}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    console.log(`[Chat API] Calling Gemini (gemini-3.1-flash-lite) with ${contents.length} turns...`);

    let responseText = '';

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });
      responseText = response.text?.trim() || '';
    } catch (modelErr) {
      console.warn('[Chat API] gemini-3.1-flash-lite retry with gemini-3.8-flash:', modelErr);
      const fallbackResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });
      responseText = fallbackResponse.text?.trim() || '';
    }

    const replyText = responseText || `*gently rests beside you* I'm right here with you.`;
    console.log(`[Chat API] Gemini response received successfully:`, replyText.slice(0, 60));
    res.json({ reply: replyText, isCrisis: false });
  } catch (error) {
    console.error('[Chat API] Error generating AI response with Gemini:', error);
    res.json({
      reply:
        offlineReplyFor(message, companionName, species) ??
        `*curls up warmly near you* I am right beside you, even when words are hard to find. Take your time, I'm here.`,
      isCrisis: false,
    });
  }
});

// ----------------------------------------------------------------------
// Live Streaming AI Companion Chat Endpoint (POST /api/chat/stream - SSE)
// ----------------------------------------------------------------------
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { message, companionName = 'Habi', species = 'dog', history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Setup Server-Sent Events headers for real-time live streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const isCrisis = containsCrisisTrigger(message);

  if (isCrisis) {
    const crisisMsg = `*nuzzles close with deep, steady warmth, resting a gentle paw firmly in your hand* I hear how excruciating the weight is right now, and I want you to know you are not alone in this dark moment. Please let me connect you with someone who can hold space for you safely right now. Your life is precious.\n\n🆘 24/7 Crisis Hotline: 1553 | Globe: 0917-899-8727 | Smart: 0966-351-4518`;
    res.write(`data: ${JSON.stringify({ text: crisisMsg, isCrisis: true })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  const aiClient = getGeminiClient();

  const systemInstruction = buildSystemInstruction(companionName, species);

  if (!aiClient) {
    // No model available: answer what we can answer with certainty ourselves
    // (arithmetic, anything about the app) rather than sending back a line that
    // has nothing to do with the message.
    const offlineMsg =
      offlineReplyFor(message, companionName, species) ??
      `*rests a comforting chin on your lap and looks up with calm eyes* It makes complete sense you feel that way. When things get loud, taking one small step at a time is all you ever need to do. I'm right here with you.`;
    res.write(`data: ${JSON.stringify({ text: offlineMsg })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // Build properly formatted alternating conversation history
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    for (const h of history) {
      if (!h.text || typeof h.text !== 'string') continue;
      const role: 'user' | 'model' = h.sender === 'user' ? 'user' : 'model';

      if (contents.length === 0 && role === 'model') continue;

      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${h.text}`;
      } else {
        contents.push({ role, parts: [{ text: h.text }] });
      }
    }
  }

  const last = contents[contents.length - 1];
  if (last && last.role === 'user') {
    last.parts[0].text += `\n${message}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: message }] });
  }

  try {
    const stream = await aiClient.models.generateContentStream({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[Chat Stream API] Error streaming with Gemini:', err);
    // The connection broke mid-answer, but the question is still answerable
    // whenever we can settle it on our own, so try that before falling back.
    res.write(
      `data: ${JSON.stringify({
        text:
          offlineReplyFor(message, companionName, species) ??
          `*curls up warmly near you* I am right beside you, even when words are hard to find. Take your time, I'm here.`,
      })}\n\n`
    );
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// ----------------------------------------------------------------------
// Full Source Code Export (.zip) Endpoint (GET /api/download-source)
// ----------------------------------------------------------------------
app.get('/api/download-source', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    const ignoredDirs = new Set(['node_modules', '.git', 'dist', '.cache', '.npm']);
    const ignoredFiles = new Set(['.DS_Store']);

    const addFilesRecursively = (dirPath: string, zipFolder: JSZip) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!ignoredDirs.has(entry.name) && !entry.name.startsWith('.')) {
            const subZip = zipFolder.folder(entry.name);
            if (subZip) addFilesRecursively(fullPath, subZip);
          }
        } else if (entry.isFile()) {
          if (!ignoredFiles.has(entry.name) && !entry.name.endsWith('.zip')) {
            const fileContent = fs.readFileSync(fullPath);
            zipFolder.file(entry.name, fileContent);
          }
        }
      }
    };

    addFilesRecursively(rootDir, zip);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="hangin-mental-health-sanctuary.zip"'
    );
    res.send(zipBuffer);
  } catch (err) {
    console.error('Source download error:', err);
    res.status(500).json({ error: 'Failed to generate source zip' });
  }
});

// ----------------------------------------------------------------------
// Vite Dev Server / Static Production Mounting
// ----------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌿 Hangin Server running on http://localhost:${PORT} [${isProduction ? 'prod' : 'dev'}]`);
  });
}

startServer();
