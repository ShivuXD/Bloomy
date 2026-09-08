import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNurture } from '../../contexts/NurtureContext';
import Peco from '../Peco/Peco';
import { Wind, Sparkles, X, Heart } from 'lucide-react';
import CalmMusicPlayer from './CalmMusicPlayer';

const CalmSpaceModal: React.FC = () => {
  const { isCalmSpaceOpen, setIsCalmSpaceOpen, triggerPecoEvent, accessibilitySettings } = useNurture();
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [cycleCount, setCycleCount] = useState(0);

  // Trigger speech once when modal opens
  useEffect(() => {
    if (isCalmSpaceOpen) {
      triggerPecoEvent('CALM_SPACE', "Let's take a slow, gentle breath together.");
    }
  }, [isCalmSpaceOpen]);

  // Support ESC key to close Calm Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCalmSpaceOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalmSpaceOpen]);

  // Breathing animation cycle timer
  useEffect(() => {
    if (!isCalmSpaceOpen) return;

    const delay = breathPhase === 'Hold' ? 2000 : 4000;
    const timer = setTimeout(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        setCycleCount(c => c + 1);
        return 'Inhale';
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isCalmSpaceOpen, breathPhase]);

  if (!isCalmSpaceOpen) return null;

  const handleClose = () => {
    setIsCalmSpaceOpen(false);
    triggerPecoEvent('NORMAL_STATE', "I'm so glad we took a mindful moment! Whenever you're ready, let's keep playing.");
  };

  return (
    <AnimatePresence>
      <div 
        id="calm-space-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          id="calm-space-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto bg-gradient-to-b from-indigo-50/95 via-purple-50/95 to-sky-50/95 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-indigo-100/80 flex flex-col items-center text-center"
        >
          {/* Close button */}
          <button
            id="close-calm-space-btn"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            aria-label="Close Calm Space"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-semibold tracking-wide text-xs sm:text-sm uppercase">
            <Wind size={17} className="text-indigo-500" />
            <span>Peco's Calm Space</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            Gentle Breathing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mb-4">
            There is no rush and no right or wrong. Follow Peco's gentle breathing rhythm.
          </p>

          {/* Breathing Visualizer with Peco in the center */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-4 shrink-0">
            {/* Soft pulsing breathing rings */}
            <motion.div
              className="absolute rounded-full bg-indigo-200/40"
              animate={accessibilitySettings.lowSensoryMode ? {} : {
                scale: breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.85,
                opacity: breathPhase === 'Inhale' ? 0.6 : breathPhase === 'Hold' ? 0.5 : 0.3,
              }}
              transition={{ duration: breathPhase === 'Hold' ? 0.5 : 3.8, ease: "easeInOut" }}
              style={{ width: '190px', height: '190px' }}
            />
            <motion.div
              className="absolute rounded-full bg-purple-300/30"
              animate={accessibilitySettings.lowSensoryMode ? {} : {
                scale: breathPhase === 'Inhale' ? 1.18 : breathPhase === 'Hold' ? 1.18 : 0.92,
                opacity: breathPhase === 'Inhale' ? 0.7 : breathPhase === 'Hold' ? 0.6 : 0.4,
              }}
              transition={{ duration: breathPhase === 'Hold' ? 0.5 : 3.8, ease: "easeInOut" }}
              style={{ width: '150px', height: '150px' }}
            />

            {/* Peco Mascot in Calm expression */}
            <div className="relative z-10 scale-85 sm:scale-90">
              <Peco expression="calm" size="md" showSpeechBubble={false} />
            </div>
          </div>

          {/* Breathing Instruction text */}
          <motion.div
            key={breathPhase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/90 shadow-sm border border-indigo-100 text-indigo-900 font-bold text-base sm:text-lg">
              {breathPhase === 'Inhale' && <span>🌬️ Breathe In slowly...</span>}
              {breathPhase === 'Hold' && <span>✨ Softly hold...</span>}
              {breathPhase === 'Exhale' && <span>🍃 Breathe Out gently...</span>}
            </div>
            {cycleCount > 0 && (
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Completed {cycleCount} mindful {cycleCount === 1 ? 'breath' : 'breaths'} with Peco
              </p>
            )}
          </motion.div>

          {/* Optional Calm Background Music Player */}
          <div className="w-full mb-5 flex justify-center">
            <CalmMusicPlayer />
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="return-to-quest-btn"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Heart size={18} />
              <span>I feel ready to return</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CalmSpaceModal;
