import { normalizePhonicsForSpeech } from '../utils/phonicsUtils';

export const INWORLD_VOICE_ID = 'Abby';
export const INWORLD_MODEL_ID = 'inworld-tts-2';
export const PECO_TEST_SENTENCE = "Hello! I am Peco! Let's learn together!";

export interface InworldErrorPayload {
  error: string;
  status?: number;
  type?: string;
  code?: string;
  details?: any;
}

// Global Web Audio Context & reusable audio element handles
let sharedAudioContext: AudioContext | null = null;
let activeSourceNode: AudioBufferSourceNode | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let currentSessionId = 0;

// Client-side in-memory arrayBuffer cache and in-flight request deduplication
const clientAudioCache = new Map<string, ArrayBuffer>();
const inFlightRequests = new Map<string, Promise<ArrayBuffer>>();
const decodedBufferCache = new Map<string, AudioBuffer>();

function normalizeTextKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Pre-warm critical UI phrases in background idle time
 */
export function preWarmClientAudioCache(): void {
  const commonPhrases = [
    PECO_TEST_SENTENCE,
    "Welcome back! Which quest shall we conquer today?",
    "Look at your wonderful skill map! Every mind learns in its own special way.",
    "Okay! Let's try this one together. Find and tap the bright yellow star!",
    "Listen carefully and choose the sound you hear. Which word starts with B?",
    "Let's look at this story together. How do you think she feels?",
    "Yes! You got it!",
    "Great job!",
    "That's right!",
    "Awesome! Let's keep going!",
    "That's okay! Let's try it again.",
    "Almost! Have another look.",
    "Yay! You finished it!",
    "Let's take a slow, gentle breath together.",
  ];

  const warm = () => {
    commonPhrases.forEach((phrase) => {
      generatePecoSpeechArrayBuffer(phrase).catch(() => {});
    });
  };

  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(warm, { timeout: 2000 });
    } else {
      setTimeout(warm, 1000);
    }
  }
}

// Auto-trigger client pre-warm
if (typeof window !== 'undefined') {
  preWarmClientAudioCache();
}

/**
 * Synchronously prepare and unlock browser audio in the user gesture event handler
 * to satisfy browser autoplay security policies in iframes and mobile browsers.
 */
export function prepareAudioPlayback(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioContextClass();
      }
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }
    }
  } catch (e) {
    console.warn('[Inworld TTS] AudioContext initialization notice:', e);
  }

  try {
    if (!activeAudioElement && typeof document !== 'undefined') {
      activeAudioElement = document.createElement('audio');
      activeAudioElement.setAttribute('playsinline', 'true');
      activeAudioElement.setAttribute('webkit-playsinline', 'true');
      activeAudioElement.style.position = 'fixed';
      activeAudioElement.style.opacity = '0';
      activeAudioElement.style.pointerEvents = 'none';
      document.body.appendChild(activeAudioElement);
    }
    if (activeAudioElement) {
      activeAudioElement.load();
    }
  } catch (e) {
    console.warn('[Inworld TTS] HTMLAudioElement setup notice:', e);
  }
}

/**
 * Stop any ongoing audio playback immediately and cancel pending callbacks
 */
export function stopPecoAudio(): void {
  currentSessionId++;

  if (activeSourceNode) {
    try {
      activeSourceNode.onended = null;
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch {}
    activeSourceNode = null;
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.onended = null;
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {}
  }
}

/**
 * Generate speech audio from server-side Inworld TTS endpoint and return raw ArrayBuffer
 */
export async function generatePecoSpeechArrayBuffer(
  text: string = PECO_TEST_SENTENCE
): Promise<ArrayBuffer> {
  const speechText = normalizePhonicsForSpeech(text);
  const cacheKey = normalizeTextKey(speechText);

  if (clientAudioCache.has(cacheKey)) {
    return clientAudioCache.get(cacheKey)!.slice(0);
  }

  // Deduplicate simultaneous requests for the same phrase
  if (inFlightRequests.has(cacheKey)) {
    const buffer = await inFlightRequests.get(cacheKey)!;
    return buffer.slice(0);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch('/api/tts/peco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: speechText }),
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          const textErr = await response.text();
          errorData = { error: textErr };
        }

        const errorMsg =
          errorData?.error ||
          errorData?.details?.message ||
          errorData?.message ||
          `Inworld TTS API request failed with HTTP ${response.status}`;

        const error = new Error(errorMsg);
        (error as any).status = response.status;
        (error as any).details = errorData;
        throw error;
      }

      const arrayBuffer = await response.arrayBuffer();
      clientAudioCache.set(cacheKey, arrayBuffer.slice(0));
      return arrayBuffer;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  const result = await fetchPromise;
  return result.slice(0);
}

/**
 * Backward-compatible blob generator
 */
export async function generatePecoSpeech(text: string = PECO_TEST_SENTENCE): Promise<Blob> {
  const arrayBuffer = await generatePecoSpeechArrayBuffer(text);
  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}

export function isAutoplayBlockedError(err: any): boolean {
  if (!err) return false;
  if (err.name === 'NotAllowedError') return true;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes('autoplay') ||
    msg.includes('user gesture') ||
    msg.includes('interact') ||
    msg.includes('notallowederror') ||
    msg === 'autoplay_blocked'
  );
}

/**
 * Plays Peco Inworld TTS audio reliably using Web Audio API (primary) with HTMLAudioElement fallback
 */
export async function playPecoAudio(
  text: string = PECO_TEST_SENTENCE,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<void> {
  const sessionId = ++currentSessionId;
  const speechText = normalizePhonicsForSpeech(text);
  const cacheKey = normalizeTextKey(speechText);

  // Fetch or retrieve from cache
  const arrayBuffer = await generatePecoSpeechArrayBuffer(speechText);

  // If a newer playback or stop was requested while fetching audio, abandon this stale playback
  if (sessionId !== currentSessionId) {
    return;
  }

  // Stop previous playback right before starting the new sound
  if (activeSourceNode) {
    try {
      activeSourceNode.onended = null;
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch {}
    activeSourceNode = null;
  }
  if (activeAudioElement) {
    try {
      activeAudioElement.onended = null;
      activeAudioElement.pause();
    } catch {}
  }

  let playedViaWebAudio = false;

  // 1. Attempt playback via Web Audio API
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioContextClass();
      }

      if (sharedAudioContext.state === 'suspended') {
        try {
          await sharedAudioContext.resume();
        } catch {}
      }

      // If still suspended without user interaction, browser blocked autoplay
      if (sharedAudioContext.state === 'suspended') {
        const autoplayErr = new Error('AUTOPLAY_BLOCKED');
        (autoplayErr as any).name = 'NotAllowedError';
        throw autoplayErr;
      }

      // Use cached decoded AudioBuffer if available to eliminate decoding latency
      let audioBuffer = decodedBufferCache.get(cacheKey);
      if (!audioBuffer) {
        audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer.slice(0));
        decodedBufferCache.set(cacheKey, audioBuffer);
      }

      // Re-check session ID after async decoding
      if (sessionId !== currentSessionId) {
        return;
      }

      const source = sharedAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(sharedAudioContext.destination);

      activeSourceNode = source;

      const durationMs = Math.ceil(audioBuffer.duration * 1000);
      let hasEnded = false;
      let safetyTimer: NodeJS.Timeout | null = null;

      return await new Promise<void>((resolve) => {
        const finishWebAudio = () => {
          if (hasEnded) return;
          hasEnded = true;
          if (safetyTimer) {
            clearTimeout(safetyTimer);
            safetyTimer = null;
          }
          if (sessionId === currentSessionId) {
            activeSourceNode = null;
            callbacks?.onEnd?.();
          }
          resolve();
        };

        source.onended = () => {
          finishWebAudio();
        };

        callbacks?.onStart?.();
        source.start(0);
        playedViaWebAudio = true;
        safetyTimer = setTimeout(finishWebAudio, durationMs + 300);
      });
    }
  } catch (webAudioErr: any) {
    if (isAutoplayBlockedError(webAudioErr)) {
      callbacks?.onError?.(webAudioErr);
      throw webAudioErr;
    }
    console.warn('[Inworld TTS] Web Audio playback failed, trying HTMLAudio fallback:', webAudioErr);
  }

  if (playedViaWebAudio) {
    return;
  }

  // 2. Fallback to HTMLAudioElement
  return new Promise<void>((resolve, reject) => {
    try {
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = activeAudioElement || new Audio();
      activeAudioElement = audio;

      audio.src = audioUrl;
      audio.volume = 1.0;

      let htmlAudioEnded = false;
      let htmlSafetyTimer: NodeJS.Timeout | null = null;

      const finishHtmlAudio = () => {
        if (htmlAudioEnded) return;
        htmlAudioEnded = true;
        if (htmlSafetyTimer) {
          clearTimeout(htmlSafetyTimer);
          htmlSafetyTimer = null;
        }
        URL.revokeObjectURL(audioUrl);
        if (sessionId === currentSessionId) {
          callbacks?.onEnd?.();
          resolve();
        }
      };

      audio.onplay = () => {
        if (sessionId === currentSessionId) {
          callbacks?.onStart?.();
          const expectedMs = audio.duration && !isNaN(audio.duration) && audio.duration > 0
            ? Math.ceil(audio.duration * 1000 + 400)
            : 8000;
          htmlSafetyTimer = setTimeout(finishHtmlAudio, expectedMs);
        }
      };

      audio.onended = () => {
        finishHtmlAudio();
      };

      audio.onerror = () => {
        if (htmlSafetyTimer) clearTimeout(htmlSafetyTimer);
        URL.revokeObjectURL(audioUrl);
        if (sessionId === currentSessionId) {
          const err = new Error(audio.error?.message || 'Browser HTMLAudio playback failed');
          callbacks?.onError?.(err);
          reject(err);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          URL.revokeObjectURL(audioUrl);
          if (sessionId === currentSessionId) {
            callbacks?.onError?.(err);
            reject(err);
          }
        });
      }
    } catch (fallbackErr) {
      if (sessionId === currentSessionId) {
        callbacks?.onError?.(fallbackErr);
        reject(fallbackErr);
      }
    }
  });
}
