import { PecoState, MissionType, ScreenState } from '../types/nurture';
import {
  playPecoAudio,
  stopPecoAudio,
  prepareAudioPlayback,
  isAutoplayBlockedError,
} from './inworldService';
import { normalizePhonicsForSpeech } from '../utils/phonicsUtils';

export { normalizePhonicsForSpeech };

export const PECO_DIALOGUE = {
  INTRO:
    "Hello! I am Peco! Let's learn together! I am your learning companion.",

  ACTIVITY_EXPLANATIONS: {
    FOCUS:
      "Okay! Let's try this one together. Find and tap the bright yellow star!",
    READING:
      "Listen carefully and choose the sound you hear. Which word starts with B?",
    READING_SPEECH:
      "Listen carefully and choose the sound you hear. Which word starts with B?",
    SOCIAL:
      "Riya was very excited about her ice cream. She was walking home when the ice cream slipped from her hand and fell on the ground. Riya looked at her melted ice cream and started to cry. How do you think Riya feels?",
    ROCKET_FOCUS:
      "Fast eyes ready! Tap only the blue stars as quick as you can.",
    STOP_THINK_GO:
      "Patiently wait for the green light, then tap the button!",
    WHAT_WOULD_YOU_DO:
      "Imagine your teacher says good morning! What would you do?",
    WORD_BUILDER:
      "Let's build a word together! Tap the letters in order to spell CAT.",
    MEMORY_MISSION:
      "Watch the sequence carefully! When the cards hide, tap them in the exact order you saw!",
    'adhd-memory-1':
      "Watch the sequence carefully! When the cards hide, tap them in the exact order you saw!",
    GREETING_MASTER:
      "Let's practice friendly greetings! Choose the best response to say hello or goodbye.",
    'asd-comm-3':
      "Let's practice friendly greetings! Choose the best response to say hello or goodbye.",
    STORY_ADVENTURE:
      "Look at the picture with Peco! Tap 'Read to Me' or choose the matching picture!",
    'dys-comp-1':
      "Look at the picture with Peco! Tap 'Read to Me' or choose the matching picture!",
    REAL_WORLD_MISSION:
      "Welcome to your Real World Mission! Practice real-life skills and confidence with me.",
  } as Record<string, string>,

  CORRECT_VARIATIONS: [
    "Yes! You got it!",
    "Great job!",
    "That's right!",
    "Awesome! Let's keep going!",
  ],

  INCORRECT_VARIATIONS: [
    "That's okay! Let's try it again.",
    "Almost! Have another look.",
    "No worries. I'll give you a little hint.",
  ],

  HINT_VARIATIONS: [
    "Need a little hint?",
    "Take your time. Look at the pictures carefully.",
    "I can help you with this one.",
  ],

  COMPLETION_VARIATIONS: [
    "Yay! You finished it!",
    "Great work! You're getting better!",
    "Nice job! Ready for the next one?",
  ],

  TRANSITION_VARIATIONS: [
    "Ready for the next challenge?",
    "Let's try something new!",
    "Okay, let's see what we have here.",
  ],

  CONTEXTUAL_HELP: {
    FOCUS:
      "Look closely at the shapes. The bright yellow star is the one we're searching for!",
    READING:
      "Of course! Listen carefully to the sound B, like Bear, and choose the matching word.",
    SOCIAL:
      "Think about Riya walking home with her ice cream. When it slipped and she started crying, how do you think she feels?",
    ROCKET_FOCUS:
      "Keep your focus sharp! Tap only the blue stars and let the others go.",
    STOP_THINK_GO:
      "Remember: stop when it's red, and tap as fast as you can when it turns green!",
    WHAT_WOULD_YOU_DO:
      "Think about what you would say or do to be friendly and kind.",
    WORD_BUILDER:
      "We want to spell CAT! Find C first, then A, and then T.",
    MEMORY_MISSION:
      "Picture the order in your mind: look for which item appeared first, second, and third!",
    'adhd-memory-1':
      "Picture the order in your mind: look for which item appeared first, second, and third!",
    GREETING_MASTER:
      "Think about what would make a friend feel acknowledged and welcome when you say hello!",
    'asd-comm-3':
      "Think about what would make a friend feel acknowledged and welcome when you say hello!",
    STORY_ADVENTURE:
      "Look at the picture closely! Notice what friendly thing Peco found!",
    'dys-comp-1':
      "Look at the picture closely! Notice what friendly thing Peco found!",
    REAL_WORLD_MISSION:
      "Think about what choice is respectful, calm, and helpful in everyday situations!",
    DAILY_QUEST:
      "Pick any quest you want to explore today. I'll be right beside you the whole way!",
    HOLISTIC_MAP:
      "This map shows all the unique learning strengths you have. You're doing wonderful!",
    ONBOARDING:
      "I'm Peco, your learning companion! Tap 'Let's Learn Together' whenever you're ready to start.",
    CALM_SPACE:
      "Take a slow, deep breath in with me... and gently let it out.",
  } as Record<string, string>,
};

// Memory of last selected variants to ensure natural variation
const lastVariantIndices: Record<string, number> = {};

export function getNaturalVariant(key: string, list: string[]): string {
  if (!list.length) return '';
  if (list.length === 1) return list[0];

  const lastIndex = lastVariantIndices[key] ?? -1;
  let nextIndex: number;
  let attempts = 0;
  do {
    nextIndex = Math.floor(Math.random() * list.length);
    attempts++;
  } while (nextIndex === lastIndex && attempts < 10);

  lastVariantIndices[key] = nextIndex;
  return list[nextIndex];
}

export interface SpeechRequestOptions {
  priority?: 'low' | 'normal' | 'high';
  delayMs?: number;
  force?: boolean;
  skipIfLowSensory?: boolean;
  displayText?: string;
  speechText?: string;
  onStarted?: () => void;
  onFinished?: () => void;
  onError?: (err: any) => void;
}

export interface PecoSpeechCallbacks {
  setState: (state: PecoState) => void;
  setMessage: (msg: string) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (err: { message: string; status?: number } | null) => void;
}

class PecoCompanionSpeechManager {
  private activeText: string | null = null;
  private isSpeaking = false;
  private isGenerating = false;
  private lastSpokenText = '';
  private lastSpokenTime = 0;
  private lastHintTime = 0;
  private pendingTimer: NodeJS.Timeout | null = null;
  private watchdogTimer: NodeJS.Timeout | null = null;
  private pendingAutoplayIntro: { text: string; expression: PecoState } | null = null;
  private nextQueuedSpeech: {
    text: string;
    expression: PecoState;
    options: SpeechRequestOptions;
    isLowSensory: boolean;
  } | null = null;
  private autoplayListenerRegistered = false;
  private callbacks: PecoSpeechCallbacks | null = null;
  private hasIntroPlayedThisSession = false;

  public registerCallbacks(callbacks: PecoSpeechCallbacks) {
    this.callbacks = callbacks;
  }

  public setIntroPlayed(played: boolean) {
    this.hasIntroPlayedThisSession = played;
  }

  public get hasIntroPlayed(): boolean {
    return this.hasIntroPlayedThisSession;
  }

  /**
   * Speak a designated sentence with synchronized expression, queue safety, and autoplay recovery.
   */
  public async speak(
    text: string,
    expression: PecoState,
    options: SpeechRequestOptions = {},
    isLowSensory = false
  ): Promise<void> {
    if (!text) return;

    // In Low Sensory Mode, skip optional cheerleading or non-essential messages
    if (isLowSensory && options.skipIfLowSensory) {
      if (this.callbacks) {
        this.callbacks.setMessage(text);
        this.callbacks.setState(expression);
      }
      return;
    }

    const now = Date.now();

    // Prevent duplicate speech of the exact same sentence if already active or spoken in the last 5 seconds
    if (!options.force) {
      if (text === this.activeText) {
        return;
      }
      if (text === this.lastSpokenText && now - this.lastSpokenTime < 5000) {
        return;
      }
    }

    // Clear any queued delayed speech
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }

    if (options.delayMs && options.delayMs > 0) {
      this.pendingTimer = setTimeout(() => {
        this.pendingTimer = null;
        this.executeSpeech(text, expression, options, isLowSensory);
      }, options.delayMs);
      return;
    }

    await this.executeSpeech(text, expression, options, isLowSensory);
  }

  private async executeSpeech(
    text: string,
    expression: PecoState,
    options: SpeechRequestOptions,
    isLowSensory: boolean
  ): Promise<void> {
    // If currently speaking or generating:
    // If not forced and not high priority, do NOT cut off speech mid-sentence; queue it!
    if (!options.force && (this.isSpeaking || this.isGenerating)) {
      if (options.priority !== 'high') {
        // Never queue identical speech that is already playing or just spoken
        if (text === this.activeText || text === this.lastSpokenText) {
          return;
        }
        this.nextQueuedSpeech = { text, expression, options, isLowSensory };
        return;
      }
    }

    // Clear any previously queued speech when high priority or forced speech runs
    this.nextQueuedSpeech = null;

    // High or forced interrupts previous audio
    if (this.isSpeaking || this.isGenerating) {
      this.stop();
    }

    const textToDisplay = options.displayText || text;
    const textToSpeak = options.speechText || normalizePhonicsForSpeech(text);

    this.activeText = textToDisplay;
    this.lastSpokenText = text;
    this.lastSpokenTime = Date.now();

    if (this.callbacks) {
      this.callbacks.setError(null);
      this.callbacks.setMessage(textToDisplay);
      this.callbacks.setState(expression);
      this.callbacks.setIsLoading(true);
    }

    this.isGenerating = true;

    try {
      await playPecoAudio(textToSpeak, {
        onStart: () => {
          this.isGenerating = false;
          this.isSpeaking = true;
          if (this.callbacks) {
            this.callbacks.setIsLoading(false);
            this.callbacks.setIsSpeaking(true);
            this.callbacks.setMessage(textToDisplay);
            this.callbacks.setState(expression);
          }
          options.onStarted?.();

          if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
          }
          const maxAllowedMs = Math.max(6000, Math.ceil((textToSpeak.length / 8) * 1000) + 4000);
          this.watchdogTimer = setTimeout(() => {
            if (this.isSpeaking && this.activeText === textToDisplay) {
              this.isSpeaking = false;
              this.activeText = null;
              if (this.callbacks) {
                this.callbacks.setIsSpeaking(false);
                this.callbacks.setIsLoading(false);
                this.callbacks.setState(isLowSensory ? 'calm' : 'idle');
              }
              options.onFinished?.();
            }
          }, maxAllowedMs);
        },
        onEnd: () => {
          if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
          }
          this.isSpeaking = false;
          this.activeText = null;
          options.onFinished?.();

          // If a distinct subsequent activity or dialogue was queued, play it after a brief comfortable pause
          if (this.nextQueuedSpeech) {
            const next = this.nextQueuedSpeech;
            this.nextQueuedSpeech = null;
            if (next.text !== this.lastSpokenText) {
              setTimeout(() => {
                this.speak(next.text, next.expression, next.options, next.isLowSensory);
              }, 300);
            }
            return;
          }

          if (this.callbacks) {
            this.callbacks.setIsSpeaking(false);
            // Return gently to calm/idle baseline after a brief pause
            setTimeout(() => {
              if (!this.isSpeaking && this.callbacks) {
                this.callbacks.setState(isLowSensory ? 'calm' : 'idle');
              }
            }, 600);
          }
        },
        onError: (err) => {
          this.isGenerating = false;
          this.isSpeaking = false;
          this.activeText = null;

          // Check if error was caused by browser autoplay restriction
          if (isAutoplayBlockedError(err)) {
            console.info('[Peco Companion] Autoplay deferred until first user interaction');
            this.queueForFirstInteraction(text, expression);
            if (this.callbacks) {
              this.callbacks.setIsLoading(false);
              this.callbacks.setIsSpeaking(false);
            }
            return;
          }

          if (this.callbacks) {
            this.callbacks.setIsLoading(false);
            this.callbacks.setIsSpeaking(false);
            this.callbacks.setError({
              message: err.message || String(err),
              status: err.status,
            });
          }
          options.onError?.(err);
        },
      });
    } catch (err: any) {
      this.isGenerating = false;
      this.isSpeaking = false;
      this.activeText = null;

      if (isAutoplayBlockedError(err)) {
        console.info('[Peco Companion] Autoplay deferred until first user interaction');
        this.queueForFirstInteraction(text, expression);
        if (this.callbacks) {
          this.callbacks.setIsLoading(false);
          this.callbacks.setIsSpeaking(false);
        }
        return;
      }

      if (this.callbacks) {
        this.callbacks.setIsLoading(false);
        this.callbacks.setIsSpeaking(false);
        this.callbacks.setError({
          message: err.message || String(err),
          status: err.status,
        });
      }
      options.onError?.(err);
    }
  }

  /**
   * Graceful Autoplay Queue:
   * Waits for first user interaction (click, tap, key) anywhere in the window
   * then plays queued speech with unlocked audio pipeline.
   */
  private queueForFirstInteraction(text: string, expression: PecoState) {
    this.pendingAutoplayIntro = { text, expression };

    if (this.autoplayListenerRegistered || typeof window === 'undefined') return;

    this.autoplayListenerRegistered = true;

    const handleFirstGesture = () => {
      // Synchronously unlock browser audio pipeline in this gesture
      prepareAudioPlayback();

      // Remove listeners immediately
      window.removeEventListener('click', handleFirstGesture, true);
      window.removeEventListener('pointerdown', handleFirstGesture, true);
      window.removeEventListener('keydown', handleFirstGesture, true);
      this.autoplayListenerRegistered = false;

      if (this.pendingAutoplayIntro) {
        const item = this.pendingAutoplayIntro;
        this.pendingAutoplayIntro = null;
        // Small 100ms delay for seamless audio node connection
        setTimeout(() => {
          this.speak(item.text, item.expression, { force: true });
        }, 100);
      }
    };

    window.addEventListener('click', handleFirstGesture, { capture: true, once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { capture: true, once: true });
    window.addEventListener('keydown', handleFirstGesture, { capture: true, once: true });
  }

  public get isCurrentlySpeaking(): boolean {
    return this.isSpeaking || this.isGenerating;
  }

  public stop(): void {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    this.nextQueuedSpeech = null;
    stopPecoAudio();
    this.isSpeaking = false;
    this.isGenerating = false;
    this.activeText = null;
    if (this.callbacks) {
      this.callbacks.setIsLoading(false);
      this.callbacks.setIsSpeaking(false);
    }
  }

  // --- Contextual Event Triggers ---

  public onAppStart(isLowSensory = false) {
    if (this.hasIntroPlayedThisSession) return;
    this.hasIntroPlayedThisSession = true;
    this.speak(
      PECO_DIALOGUE.INTRO,
      'happy',
      { priority: 'high', delayMs: 100, force: true },
      isLowSensory
    );
  }

  public onActivityEnter(mission: MissionType, isLowSensory = false) {
    if (mission === 'READING') {
      const displayText =
        PECO_DIALOGUE.ACTIVITY_EXPLANATIONS.READING ||
        "Listen carefully and choose the sound you hear. Which word starts with B?";
      const speechText =
        PECO_DIALOGUE.ACTIVITY_EXPLANATIONS.READING_SPEECH ||
        normalizePhonicsForSpeech(displayText);

      this.speak(
        displayText,
        'thinking',
        { priority: 'normal', delayMs: 0, displayText, speechText },
        isLowSensory
      );
      return;
    }

    if (mission === 'SOCIAL') {
      const storySpeech =
        PECO_DIALOGUE.ACTIVITY_EXPLANATIONS.SOCIAL ||
        "Riya was very excited about her ice cream. She was walking home when the ice cream slipped from her hand and fell on the ground. Riya looked at her melted ice cream and started to cry. How do you think Riya feels?";

      this.speak(
        storySpeech,
        'thinking',
        { priority: 'high', delayMs: 100, force: true },
        isLowSensory
      );
      return;
    }

    const explanation =
      PECO_DIALOGUE.ACTIVITY_EXPLANATIONS[mission] ||
      "Okay! Let's try this activity together!";

    this.speak(
      explanation,
      'thinking',
      { priority: 'normal', delayMs: 0 },
      isLowSensory
    );
  }

  public onCorrectAnswer(isLowSensory = false) {
    const reaction = getNaturalVariant('correct', PECO_DIALOGUE.CORRECT_VARIATIONS);
    this.speak(
      reaction,
      'happy',
      { priority: 'high', delayMs: 0, skipIfLowSensory: false },
      isLowSensory
    );
  }

  public onIncorrectAnswer(attempt = 1, isLowSensory = false) {
    const reaction = getNaturalVariant('incorrect', PECO_DIALOGUE.INCORRECT_VARIATIONS);
    this.speak(
      reaction,
      'comforting',
      { priority: 'high', delayMs: 0, skipIfLowSensory: false },
      isLowSensory
    );
  }

  public onHintNeeded(mission?: MissionType, customHint?: string, isLowSensory = false) {
    const now = Date.now();
    // Throttle hints so Peco doesn't interrupt too frequently (minimum 12s between automatic hints)
    if (now - this.lastHintTime < 12000) {
      return;
    }
    this.lastHintTime = now;

    let hintText = customHint;
    if (!hintText && mission && PECO_DIALOGUE.CONTEXTUAL_HELP[mission]) {
      hintText = PECO_DIALOGUE.CONTEXTUAL_HELP[mission];
    }
    if (!hintText) {
      hintText = getNaturalVariant('hint', PECO_DIALOGUE.HINT_VARIATIONS);
    }

    this.speak(
      hintText,
      'thinking',
      { priority: 'low', delayMs: 0, skipIfLowSensory: true },
      isLowSensory
    );
  }

  public onActivityComplete(mission?: MissionType, isLowSensory = false) {
    const celebration = getNaturalVariant('completion', PECO_DIALOGUE.COMPLETION_VARIATIONS);
    this.speak(
      celebration,
      'celebrating',
      { priority: 'high', delayMs: 0, skipIfLowSensory: false },
      isLowSensory
    );
  }

  public onSectionChange(section: ScreenState, isLowSensory = false) {
    const transition = getNaturalVariant('transition', PECO_DIALOGUE.TRANSITION_VARIATIONS);
    this.speak(
      transition,
      'happy',
      { priority: 'normal', delayMs: 0, skipIfLowSensory: true },
      isLowSensory
    );
  }

  public onAskPecoHelp(
    currentMission: MissionType,
    currentScreen: ScreenState,
    isLowSensory = false
  ) {
    // If currently speaking, toggle off
    if (this.isSpeaking || this.isGenerating) {
      this.stop();
      if (this.callbacks) {
        this.callbacks.setState('idle');
      }
      return;
    }

    prepareAudioPlayback();

    let helpText: string | undefined;

    if (currentScreen === 'ASSESSMENT') {
      if (currentMission === 'READING') {
        const displayText =
          PECO_DIALOGUE.CONTEXTUAL_HELP.READING ||
          "Of course! Listen carefully to the sound B, like Bear, and choose the matching word.";
        const speechText =
          "Of course! Listen carefully to the sound B, like Bear, and choose the matching word.";
        this.speak(
          displayText,
          'encouraging',
          { priority: 'high', force: true, displayText, speechText },
          isLowSensory
        );
        return;
      }
      if (currentMission === 'SOCIAL') {
        const helpText =
          PECO_DIALOGUE.CONTEXTUAL_HELP.SOCIAL ||
          "Think about Riya walking home with her ice cream. When it slipped and she started crying, how do you think she feels?";
        this.speak(
          helpText,
          'encouraging',
          { priority: 'high', force: true },
          isLowSensory
        );
        return;
      }
      helpText = PECO_DIALOGUE.CONTEXTUAL_HELP[currentMission];
    } else if (currentScreen === 'DAILY_QUEST') {
      helpText = PECO_DIALOGUE.CONTEXTUAL_HELP.DAILY_QUEST;
    } else if (currentScreen === 'HOLISTIC_MAP') {
      helpText = PECO_DIALOGUE.CONTEXTUAL_HELP.HOLISTIC_MAP;
    } else if (currentScreen === 'ONBOARDING') {
      helpText = PECO_DIALOGUE.CONTEXTUAL_HELP.ONBOARDING;
    }

    if (!helpText) {
      helpText = PECO_DIALOGUE.CONTEXTUAL_HELP[currentMission] ||
        "I'm right here with you! Take your time, listen carefully, and have fun.";
    }

    this.speak(
      helpText,
      'encouraging',
      { priority: 'high', force: true },
      isLowSensory
    );
  }
}

export const pecoCompanion = new PecoCompanionSpeechManager();
