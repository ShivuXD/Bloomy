import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNurture } from '../../contexts/NurtureContext';
import { Volume2, Mic, AlertCircle, Loader2, Wind } from 'lucide-react';
import {
  prepareAudioPlayback,
  playPecoAudio,
  stopPecoAudio,
  PECO_TEST_SENTENCE,
} from '../../services/inworldService';

const SpeechBubble: React.FC = () => {
  const {
    pecoMessage,
    pecoHint,
    pecoState,
    accessibilitySettings,
    setIsCalmSpaceOpen,
    isPecoSpeaking,
    isPecoLoadingAudio,
    inworldError,
    setInworldError,
    onAskPecoHelp,
    speak,
    stopSpeaking,
  } = useNurture();

  const activeText = pecoHint || pecoMessage;

  // Handle Talk with Peco button: acts as proactive contextual helper
  const handleTalkWithPeco = (e: React.MouseEvent) => {
    e.stopPropagation();
    prepareAudioPlayback();
    onAskPecoHelp();
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    prepareAudioPlayback();
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(activeText, pecoState, { force: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: accessibilitySettings.lowSensoryMode ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: accessibilitySettings.lowSensoryMode ? 0.15 : 0.25 }}
      className="relative bg-white p-4 md:p-5 rounded-2xl shadow-sm border-2 border-indigo-100 max-w-sm w-full mx-auto text-center z-10"
    >
      {/* Tail */}
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b-2 border-r-2 border-indigo-100 rotate-45" />
      
      <div className="min-h-[56px] flex items-center justify-center">
        <p className="text-base md:text-lg font-semibold text-slate-800 mb-2 leading-relaxed">
          {activeText}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
        {/* Read aloud button (speaks with Inworld voice) */}
        <button
          onClick={handleAudio}
          disabled={isPecoLoadingAudio}
          className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
            isPecoSpeaking
              ? 'bg-purple-100 text-purple-700'
              : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
          title="Read aloud with Peco's voice"
          aria-label="Read message aloud"
        >
          {isPecoSpeaking ? (
            <Volume2 size={18} className="text-purple-600 animate-pulse" />
          ) : (
            <Volume2 size={18} />
          )}
        </button>

        {/* Connected Inworld "Talk with Peco" button */}
        <button
          id="talk-with-peco-button"
          onClick={handleTalkWithPeco}
          disabled={isPecoLoadingAudio}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isPecoSpeaking
              ? 'bg-purple-600 text-white shadow-sm'
              : isPecoLoadingAudio
              ? 'bg-purple-100 text-purple-800 cursor-wait'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
          }`}
          title="Talk with Peco"
          aria-label="Talk with Peco"
        >
          {isPecoLoadingAudio ? (
            <Loader2 size={15} className="animate-spin text-purple-700" />
          ) : isPecoSpeaking ? (
            <Volume2 size={15} className="text-white animate-pulse" />
          ) : (
            <Mic size={15} />
          )}
          <span>
            {isPecoLoadingAudio
              ? 'Connecting voice...'
              : isPecoSpeaking
              ? 'Peco Speaking...'
              : 'Talk with Peco'}
          </span>
        </button>

        {/* Calm space link if comforting or calm */}
        {(pecoState === 'comforting' || pecoState === 'calm') && (
          <button
            onClick={() => setIsCalmSpaceOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-colors"
            title="Open Calm Space"
            aria-label="Open Calm Space"
          >
            <Wind size={15} />
            <span>Calm Space</span>
          </button>
        )}
      </div>

      {/* Inworld TTS API Error Display - Never silently hidden */}
      {inworldError && (
        <div
          id="inworld-error-alert"
          className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-red-800">
                  Inworld Error {inworldError.status ? `(HTTP ${inworldError.status})` : ''}
                </p>
                <p className="mt-0.5 font-mono text-[11px] leading-relaxed break-words text-red-700">
                  {inworldError.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInworldError(null);
              }}
              className="text-red-400 hover:text-red-700 p-0.5 rounded text-sm leading-none font-bold shrink-0"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SpeechBubble;

