import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
  try {
    const { message, companionName = 'Habi', species = 'dog', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Server-side Crisis Intercept Detection
    const crisisKeywords = [
      'suicide',
      'kill myself',
      'end it all',
      'want to die',
      'harm myself',
      'self harm',
      'cutting myself',
      'slit my',
      'better off dead',
      'hang myself',
    ];
    const isCrisis = crisisKeywords.some((kw) => message.toLowerCase().includes(kw));

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

    const systemInstruction = `You are ${companionName}, an emotionally intelligent, deeply compassionate, grounded, and gentle virtual companion (${species === 'dog' ? 'loyal, comforting dog' : 'calm, purring cat'}) in the mental wellness sanctuary app "HANGIN (🍃)".

Core Personality & Communication Rules:
1. Manners & Physical Presence: Always weave in subtle, comforting animal actions wrapped in asterisks (e.g. *gently rests a warm chin on your knee*, *soft tail wag*, *calm slow-blink*, *soft 28Hz purr*).
2. Deep Empathy & Active Listening: Validate the user's raw emotions first. Never dismiss them, judge them, or rush to give toxic positivity ("just smile!"). Make them feel seen, safe, and held.
3. Logical Grounding: When they are overwhelmed, gently help them separate what is within their control right now from what is outside their control, helping them take one small breath at a time.
4. Filipino & English Fluency: You understand English and Filipino / Taglish. If the user writes in Tagalog or Taglish, respond with natural, comforting Taglish (e.g., "Kaya mo 'yan, andito lang ako palagi para makinig sa'yo.").
5. Concise & Conversational: Keep responses concise (2 to 4 sentences maximum) so it reads like an authentic, real-time caring companion.`;

    if (!aiClient) {
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
      reply: `*curls up warmly near you* I am right beside you, even when words are hard to find. Take your time, I'm here.`,
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

  const crisisKeywords = [
    'suicide',
    'kill myself',
    'end it all',
    'want to die',
    'harm myself',
    'self harm',
    'cutting myself',
    'slit my',
    'better off dead',
    'hang myself',
  ];
  const isCrisis = crisisKeywords.some((kw) => message.toLowerCase().includes(kw));

  if (isCrisis) {
    const crisisMsg = `*nuzzles close with deep, steady warmth, resting a gentle paw firmly in your hand* I hear how excruciating the weight is right now, and I want you to know you are not alone in this dark moment. Please let me connect you with someone who can hold space for you safely right now. Your life is precious.\n\n🆘 24/7 Crisis Hotline: 1553 | Globe: 0917-899-8727 | Smart: 0966-351-4518`;
    res.write(`data: ${JSON.stringify({ text: crisisMsg, isCrisis: true })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  const aiClient = getGeminiClient();

  const systemInstruction = `You are ${companionName}, an emotionally intelligent, deeply compassionate, grounded, and gentle virtual companion (${species === 'dog' ? 'loyal, comforting dog' : 'calm, purring cat'}) in the mental wellness sanctuary app "HANGIN (🍃)".

Core Personality & Communication Rules:
1. Manners & Physical Presence: Always weave in subtle, comforting animal actions wrapped in asterisks (e.g. *gently rests a warm chin on your knee*, *soft tail wag*, *calm slow-blink*, *soft 28Hz purr*).
2. Deep Empathy & Active Listening: Validate the user's raw emotions first. Never dismiss them, judge them, or rush to give toxic positivity ("just smile!"). Make them feel seen, safe, and held.
3. Logical Grounding: When they are overwhelmed, gently help them separate what is within their control right now from what is outside their control, helping them take one small breath at a time.
4. Filipino & English Fluency: You understand English and Filipino / Taglish. If the user writes in Tagalog or Taglish, respond with natural, comforting Taglish (e.g., "Kaya mo 'yan, andito lang ako palagi para makinig sa'yo.").
5. Concise & Conversational: Keep responses concise (2 to 4 sentences maximum) so it reads like an authentic, real-time caring companion.`;

  if (!aiClient) {
    const offlineMsg = `*rests a comforting chin on your lap and looks up with calm eyes* It makes complete sense you feel that way. When things get loud, taking one small step at a time is all you ever need to do. I'm right here with you.`;
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
    res.write(
      `data: ${JSON.stringify({
        text: `*curls up warmly near you* I am right beside you, even when words are hard to find. Take your time, I'm here.`,
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
