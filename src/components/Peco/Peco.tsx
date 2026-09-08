import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNurture, hasWelcomedThisSession, markWelcomedThisSession } from '../../contexts/NurtureContext';
import { PecoState } from '../../types/nurture';
import { Volume2, Mic, MicOff, Wind, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import pecoMasterImage from '../../assets/images/peco.png';
import {
  prepareAudioPlayback,
  playPecoAudio,
  stopPecoAudio,
  PECO_TEST_SENTENCE,
} from '../../services/inworldService';

export interface PecoProps {
  /** Main state / animation controller */
  state?: PecoState | 'talking' | 'correct';
  /** Backwards compatibility alias for state */
  expression?: PecoState;
  message?: string;
  hint?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  bubblePosition?: 'top' | 'right' | 'bottom' | 'left';
  interactive?: boolean;
  onTap?: () => void;
  className?: string;
  enableVoiceInput?: boolean;
}

export const Peco: React.FC<PecoProps> = ({
  state: propState,
  expression: propExpression,
  message: propMessage,
  hint: propHint,
  size = 'md',
  showSpeechBubble = false,
  bubblePosition = 'top',
  interactive = true,
  onTap,
  className = '',
  enableVoiceInput = false,
}) => {
  const {
    pecoState: contextState,
    pecoMessage: contextMessage,
    pecoHint: contextHint,
    accessibilitySettings,
    triggerPecoEvent,
    setIsCalmSpaceOpen,
    setPecoState,
    setPecoMessage,
    isPecoSpeaking,
    isPecoLoadingAudio,
    inworldError: contextInworldError,
    setInworldError: setContextInworldError,
    onAskPecoHelp,
    onAppStart,
    speak,
    stopSpeaking,
  } = useNurture();

  // Proactively start introduction right on app launch
  useEffect(() => {
    if (!propState && !propExpression) {
      onAppStart();
    }
  }, [onAppStart, propState, propExpression]);

  // Normalize active state
  const rawState = propState || propExpression || contextState || 'idle';
  const activeState: PecoState | 'talking' =
    isPecoSpeaking ? 'talking' :
    rawState === 'correct' ? 'celebrating' :
    rawState === 'curious' ? 'thinking' :
    rawState === 'silly' ? 'excited' :
    rawState;

  const message = propMessage !== undefined ? propMessage : contextMessage;
  const hint = propHint !== undefined ? propHint : contextHint;
  const activeText = hint || message;

  const [isInteracting, setIsInteracting] = useState(false);
  const isSpeaking = isPecoSpeaking;
  const isListeningActive = isPecoLoadingAudio;
  const inworldError = contextInworldError;
  const setInworldError = setContextInworldError;

  // Handle Inworld Voice Generation / Talk to Peco
  const handleToggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    prepareAudioPlayback();
    onAskPecoHelp();
  };

  // Text to Speech using Inworld voice (no browser speechSynthesis fallback)
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    prepareAudioPlayback();
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(activeText, (activeState as PecoState) || 'idle', { force: true });
    }
  };

  // Click / Tap friendly interaction
  const handlePecoClick = () => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 600);

    if (onTap) {
      onTap();
      return;
    }
    if (!interactive) return;

    if (activeState === 'calm') {
      setIsCalmSpaceOpen(true);
    } else if (activeState === 'encouraging' || activeState === 'comforting') {
      triggerPecoEvent('COMFORTING', "I'm right beside you. We can take all the time we need!");
    } else {
      triggerPecoEvent('HAPPY', "I love learning with you! Let's do this!", 2500);
    }
  };

  // Size dimensions (transparent container, no bounding cards)
  const sizeMap = {
    sm: { container: 'w-20 h-20 md:w-24 md:h-24' },
    md: { container: 'w-28 h-28 md:w-36 md:h-36' },
    lg: { container: 'w-40 h-40 md:w-48 md:h-48' },
    xl: { container: 'w-52 h-52 md:w-64 md:h-64' },
  };

  const { container } = sizeMap[size];

  // Subtle animations: Original Peco moves with gentle natural lifelike motion
  const getMotionAnimation = () => {
    // Accessibility: Low sensory mode keeps motion strictly minimal and non-distracting
    if (accessibilitySettings.lowSensoryMode) {
      return { y: 0, scale: 1, rotate: 0 };
    }

    // 1. Transient friendly tap / click reaction ("Yes! I'm listening to you!")
    if (isInteracting) {
      return {
        y: [0, -6, 0],
        scale: [1, 1.05, 1],
        rotate: [0, -1.5, 0],
        transition: { duration: 0.55, ease: 'easeOut' },
      };
    }

    // 2. Talking animation (synchronized with active TTS audio)
    if (isSpeaking || activeState === 'talking') {
      return {
        y: [0, -3, 1, -4, 0],
        scale: [1, 1.025, 0.99, 1.02, 1],
        rotate: [0, -1, 1, -0.5, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
      };
    }

    // 3. State-based subtle animations
    switch (activeState) {
      case 'happy':
      case 'celebrating':
        // Cheerful celebratory bounce for correct answers and wins
        return {
          y: [0, -9, 0, -4, 0],
          scale: [1, 1.035, 1, 1.018, 1],
          rotate: [0, -1.5, 1.5, 0],
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'encouraging':
      case 'comforting':
        // Gentle reassuring lean toward the child for incorrect answers: supportive, never sad
        return {
          y: [0, 3, 0],
          rotate: [0, -2, 0],
          scale: [1, 1.02, 1],
          transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'listening':
        // Attentive tilt when child speaks to Peco
        return {
          y: [0, -3, 0],
          rotate: [-2.5, -2.5],
          scale: [1, 1.015, 1],
          transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'calm':
        // Calm Space: slow, peaceful breathing-like floating
        return {
          y: [0, -2, 0],
          scale: [0.985, 1.025, 0.985],
          transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'thinking':
        // Curious head tilt when hints or puzzles appear
        return {
          y: [0, -2, 0],
          rotate: [0, 2.5, 2.5, 0],
          scale: [1, 1.015, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'proud':
        // Confident gentle lift
        return {
          y: [0, -5, 0],
          scale: [1, 1.03, 1],
          transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' },
        };

      case 'excited':
        // Joyful energetic bounce
        return {
          y: [0, -8, 0],
          scale: [1, 1.035, 1],
          transition: { duration: 1.0, repeat: Infinity, ease: 'easeOut' },
        };

      case 'idle':
      default:
        // Idle: Very subtle up-and-down floating motion, tiny natural sway & gentle breathing
        return {
          y: [0, -4, 0],
          rotate: [0, 0.8, 0, -0.8, 0],
          scale: [1, 1.015, 1],
          transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
        };
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeechBubble && activeText && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={`absolute z-30 ${
              bubblePosition === 'top'
                ? '-top-28 left-1/2 -translate-x-1/2'
                : bubblePosition === 'bottom'
                ? '-bottom-28 left-1/2 -translate-x-1/2'
                : bubblePosition === 'right'
                ? 'top-1/2 -translate-y-1/2 left-full ml-4'
                : 'top-1/2 -translate-y-1/2 right-full mr-4'
            } w-64 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg border border-purple-100 text-slate-800 text-xs md:text-sm`}
          >
            <p className="font-semibold leading-relaxed mb-2">{activeText}</p>
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSpeak}
                className="p-1 rounded-full text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Read aloud"
              >
                <Volume2 size={14} />
              </button>

              {enableVoiceInput && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isListeningActive
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-800'
                  }`}
                  title="Talk with Peco"
                >
                  {isListeningActive ? <Loader2 size={13} className="animate-spin text-purple-700" /> : <Mic size={13} />}
                  <span>{isListeningActive ? 'Connecting...' : 'Talk with Peco'}</span>
                </button>
              )}

              {(activeState === 'comforting' || activeState === 'calm') && (
                <button
                  type="button"
                  onClick={() => setIsCalmSpaceOpen(true)}
                  className="px-2 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open Calm Space"
                >
                  <Wind size={13} />
                  <span>Calm Space</span>
                </button>
              )}
            </div>

            {inworldError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-800 flex items-start gap-1 text-left">
                <AlertCircle size={13} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold">Inworld Error {inworldError.status ? `(HTTP ${inworldError.status})` : ''}</p>
                  <p className="font-mono text-[10px] break-words text-red-700">{inworldError.message}</p>
                </div>
                <button onClick={() => setInworldError(null)} className="text-red-400 hover:text-red-700 font-bold px-1">✕</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Peco Mascot Body Container - 100% Transparent, No Card, No Square Box */}
      <motion.div
        id={`peco-mascot-${activeState}`}
        onClick={handlePecoClick}
        animate={getMotionAnimation()}
        className={`relative ${container} flex items-center justify-center ${
          interactive ? 'cursor-pointer' : ''
        } select-none`}
        title={`Peco (${activeState})`}
      >
        {/* The Original Peco Character Image with Transparent Background */}
        <img
          src={pecoMasterImage}
          alt="Peco"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/peco/peco.png';
          }}
        />

        {/* Optional gentle floating celebration sparkles (respects low sensory mode) */}
        {!accessibilitySettings.lowSensoryMode &&
          (activeState === 'celebrating' || activeState === 'happy') && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.7], y: [-2, -12, -18] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                className="absolute -top-1 left-2 text-amber-400"
              >
                <Sparkles size={16} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: [0, 0.85, 0], scale: [0.5, 1.1, 0.6], y: [0, -10, -16] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -top-2 right-3 text-sky-400"
              >
                <Sparkles size={14} />
              </motion.div>
            </div>
          )}

        {/* Subtle listening pulse indicator when listening mode is active */}
        {(isListeningActive || activeState === 'listening') && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default Peco;
