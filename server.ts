import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();
if (!process.env.INWORLD_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });
}

const PORT = 3000;
const DEFAULT_INWORLD_VOICE_ID = 'Abby';
const INWORLD_VOICE_ID = process.env.INWORLD_VOICE_ID || DEFAULT_INWORLD_VOICE_ID;
const INWORLD_MODEL_ID = process.env.INWORLD_MODEL_ID || 'inworld-tts-2';

// In-memory audio buffer cache to eliminate lag and prevent repeated synthesis hanging
const ttsCache = new Map<string, Buffer>();

function normalizePhonicsForSpeech(text: string): string {
  if (!text) return '';

  let result = text;
  // Replace phonetic slashes /X/ with letter (e.g., /B/ -> B, /C/ -> C)
  result = result.replace(/\/([A-Za-z0-9\-_]+)\//g, '$1');
  // Replace brackets / asterisks
  result = result.replace(/\[([A-Za-z0-9\-_]+)\]/g, '$1');
  result = result.replace(/\\([A-Za-z0-9\-_]+)\\/g, '$1');
  result = result.replace(/\*([A-Za-z0-9\-_]+)\*/g, '$1');
  result = result.replace(/\(([A-Za-z0-9\-_])\)/g, '$1');
  // Remove isolated slashes around letters
  result = result.replace(/(?:^|\s)\/([A-Za-z])(?:\s|[.,!?]|$)/g, (match, letter) => {
    return match.replace(`/${letter}`, letter);
  });
  result = result.replace(/(?:^|\s)\\([A-Za-z])(?:\s|[.,!?]|$)/g, (match, letter) => {
    return match.replace(`\\${letter}`, letter);
  });
  result = result.replace(/[*\\\/]/g, ' ');
  return result.replace(/\s+/g, ' ').trim();
}

function normalizeTextKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

async function synthesizeInworldAudio(
  textToSpeak: string,
  apiKey: string,
  targetVoiceId: string = INWORLD_VOICE_ID
): Promise<Buffer> {
  const inworldUrl = 'https://api.inworld.ai/tts/v1/voice:stream';
  const authHeader = apiKey.startsWith('Basic ') ? apiKey.trim() : `Basic ${apiKey.trim()}`;

  async function attemptRequest(voice: string, model: string): Promise<Response> {
    return fetch(inworldUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: textToSpeak,
        voice_id: voice,
        model_id: model,
        audio_config: {
          audio_encoding: 'MP3',
          speaking_rate: 1,
        },
        delivery_mode: 'BALANCED',
        language: 'AUTO',
      }),
    });
  }

  let response = await attemptRequest(targetVoiceId, INWORLD_MODEL_ID);

  // If the voice wasn't found (HTTP 404), gracefully fallback to Abby
  if (!response.ok && response.status === 404 && targetVoiceId !== DEFAULT_INWORLD_VOICE_ID) {
    console.warn(`[Inworld TTS] Voice "${targetVoiceId}" returned 404. Falling back to "${DEFAULT_INWORLD_VOICE_ID}"`);
    response = await attemptRequest(DEFAULT_INWORLD_VOICE_ID, INWORLD_MODEL_ID);
  }

  if (!response.ok) {
    let errorData: any;
    const rawText = await response.text();
    try {
      errorData = JSON.parse(rawText);
    } catch {
      errorData = { message: rawText };
    }

    const exactErrorMsg =
      errorData?.message ||
      errorData?.error?.message ||
      errorData?.error ||
      errorData?.details ||
      `Inworld API returned HTTP ${response.status} (${response.statusText})`;

    console.error('[Inworld TTS Error]', response.status, exactErrorMsg, errorData);
    const err = new Error(exactErrorMsg);
    (err as any).status = response.status;
    (err as any).details = errorData;
    throw err;
  }

  const rawText = await response.text();
  const lines = rawText.split('\n').filter((line) => line.trim().length > 0);
  const audioBuffers: Buffer[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.error) {
        const streamErrMsg = parsed.error.message || parsed.error.details || JSON.stringify(parsed.error);
        const err = new Error(streamErrMsg);
        (err as any).status = parsed.code || 400;
        throw err;
      }

      const base64Audio = parsed.result?.audioContent || parsed.audioContent;
      if (base64Audio) {
        audioBuffers.push(Buffer.from(base64Audio, 'base64'));
      }
    } catch (jsonErr: any) {
      if (jsonErr.message && !jsonErr.message.includes('JSON')) {
        throw jsonErr;
      }
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error('Inworld TTS returned no audio content');
  }

  return Buffer.concat(audioBuffers);
}

// Pre-warm initial essential companion dialogue phrases in background
function preWarmTTSCache(apiKey: string) {
  const commonPhrases = [
    "Hello! I am Peco! Let's learn together! I am your learning companion.",
    "Hello! I am Peco! Let's learn together!",
    "Hello! I am Peco! Let us learn together!",
    "Welcome back! Which quest shall we conquer today?",
    "Look at your wonderful skill map! Every mind learns in its own special way.",
    "Okay! Let's try this one together. Find and tap the bright yellow star!",
    "Listen carefully and choose the sound you hear. Which word starts with B?",
    "Riya was very excited about her ice cream. She was walking home when the ice cream slipped from her hand and fell on the ground. Riya looked at her melted ice cream and started to cry. How do you think Riya feels?",
    "That's right. Riya feels sad because she lost something she was excited about.",
    "Riya was excited at first, but she started to cry when her ice cream fell. She feels sad, not happy. Think about how she feels, and give it another try!",
    "Riya might feel upset, but crying shows she feels sad about losing her ice cream. Let's try again!",
    "Fast eyes ready! Tap only the blue stars as quick as you can.",
    "Stellar focus! You caught all the blue stars!",
    "You did a great job finding all the blue stars! Now let's use those focus skills in the real world.",
    "Look around your room and find 3 things that are blue.",
    "Look carefully at your desk, shelves, toys, or clothes.",
    "Fantastic! You used your eyes and attention to find three blue things.",
    "Patiently wait for the green light, then tap the button!",
    "Imagine your teacher says good morning! What would you do?",
    "You don't understand your homework. What could you say?",
    "Some children are playing a game. You want to join.",
    "A friend gives you a pencil. What could you say?",
    "You accidentally bump into someone. What would you say?",
    "You want to use your friend's crayons. What could you do?",
    "Your friend says: Do you want to sit with me? What would you say?",
    "Great choice! Saying good morning is a friendly way to respond.",
    "That's okay! When someone says hello, it is kind to greet them back. Try again!",
    "Wonderful! Asking politely for help is always a great choice.",
    "No worries! When you need help, asking politely works best. Let's try again!",
    "Super job! Asking 'Can I play with you?' is friendly and polite.",
    "Almost! Asking nicely before joining helps everyone play happily together. Give it another try!",
    "Awesome! Saying thank you shows appreciation to your friend.",
    "That's okay! Saying 'Thank you' shows kindness when someone shares. Try again!",
    "Great heart! Saying sorry shows respect and care for others.",
    "No worries! Accidental bumps happen, and saying 'I'm sorry' helps smooth things over. Try again!",
    "Terrific! Asking before borrowing shows respect for your friend's things.",
    "Almost! It's polite to ask before taking someone's items. Let's try again!",
    "Fantastic! Accepting a friendly invitation kindly makes friends feel valued.",
    "That's okay! Responding kindly helps friends feel appreciated. Give it another try!",
    "You practiced some great ways to communicate with others!",
    "Let's build a word together! Tap the letters in order to spell CAT.",
    "Watch the sequence carefully! When the cards hide, tap them in the exact order you saw!",
    "Let's practice friendly greetings! Choose the best response to say hello or goodbye.",
    "Look at the picture with Peco! Tap 'Read to Me' or choose the matching picture!",
    "You finished the digital activity! Here is your real-world challenge.",
    "Yes! You got it!",
    "Awesome! Let's keep going!",
    "Great job!",
    "That's right!",
    "That's okay! Let's try it again.",
    "Almost! Have another look.",
    "No worries. I'll give you a little hint.",
    "Yay! You finished it!",
    "Great work! You're getting better!",
    "Nice job! Ready for the next one?",
    "Ready for the next challenge?",
    "Let's try something new!",
    "Okay, let's see what we have here.",
    "Let's take a slow, gentle breath together.",
    "Low Sensory Mode is on. I'll stay soft and calm for you.",
    "Standard visual mode active! Let's explore.",
  ];

  (async () => {
    for (const phrase of commonPhrases) {
      const key = normalizeTextKey(`${INWORLD_VOICE_ID}:${phrase}`);
      if (!ttsCache.has(key)) {
        try {
          const audio = await synthesizeInworldAudio(phrase, apiKey, INWORLD_VOICE_ID);
          ttsCache.set(key, audio);
        } catch (e) {
          // Non-blocking background warm
        }
      }
    }
  })();
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      inworldConfigured: Boolean(process.env.INWORLD_API_KEY),
      cachedPhrases: ttsCache.size,
      voiceId: INWORLD_VOICE_ID,
      modelId: INWORLD_MODEL_ID,
    });
  });

  // Secure server-side Inworld Text-to-Speech proxy
  app.post('/api/tts/peco', async (req, res) => {
    const apiKey = process.env.INWORLD_API_KEY;

    if (!apiKey) {
      console.error('[Inworld TTS] Missing INWORLD_API_KEY environment variable');
      return res.status(500).json({
        error: 'INWORLD_API_KEY secret is missing on the server. Please ensure the secret is configured.',
        status: 500,
        code: 'missing_api_key',
      });
    }

    const rawText = req.body?.text || "Hello! I am Peco! Let's learn together!";
    const textToSpeak = normalizePhonicsForSpeech(rawText);
    const voiceToUse = req.body?.voice_id || INWORLD_VOICE_ID;
    const cacheKey = normalizeTextKey(`${voiceToUse}:${textToSpeak}`);

    // Serve cached audio instantly if available
    if (ttsCache.has(cacheKey)) {
      const cachedAudio = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', cachedAudio.byteLength.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('X-Cache', 'HIT');
      return res.end(cachedAudio);
    }

    try {
      const completeAudio = await synthesizeInworldAudio(textToSpeak, apiKey, voiceToUse);
      ttsCache.set(cacheKey, completeAudio);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', completeAudio.byteLength.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(completeAudio);
    } catch (err: any) {
      console.error('[Inworld Server Error]', err);
      return res.status(err.status || 500).json({
        error: err.message || 'Internal server error during Inworld audio generation',
        status: err.status || 500,
        details: String(err),
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Prewarming can issue many paid TTS requests. Enable it explicitly only
    // when the provider account has capacity and the cache benefit is desired.
    if (process.env.INWORLD_API_KEY && process.env.PREWARM_TTS_CACHE === 'true') {
      preWarmTTSCache(process.env.INWORLD_API_KEY);
    }
  });
}

startServer();
