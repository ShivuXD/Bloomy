import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion } from 'framer-motion';

const STOP_THINK_GO_TARGET = 3;

const StopThinkGo: React.FC = () => {
  const {
    onCorrectAnswer,
    onIncorrectAnswer,
    completeGameActivity,
  } = useNurture();

  const [light, setLight] = useState<'RED' | 'GREEN'>('RED');
  const [successes, setSuccesses] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const greenStartTimeRef = useRef<number>(0);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearCycleTimer = useCallback(() => {
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const startCycle = useCallback(() => {
    clearCycleTimer();

    setLight('RED');
    greenStartTimeRef.current = 0;

    const delay = Math.random() * 2000 + 1500;

    cycleTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      setLight('GREEN');
      greenStartTimeRef.current = Date.now();
      cycleTimerRef.current = null;
    }, delay);
  }, [clearCycleTimer]);

  useEffect(() => {
    isMountedRef.current = true;
    startCycle();

    return () => {
      isMountedRef.current = false;

      clearCycleTimer();

      if (wiggleTimerRef.current) {
        clearTimeout(wiggleTimerRef.current);
        wiggleTimerRef.current = null;
      }

      if (endGameTimerRef.current) {
        clearTimeout(endGameTimerRef.current);
        endGameTimerRef.current = null;
      }
    };
  }, [clearCycleTimer, startCycle]);

  const finishGame = useCallback(() => {
    if (endGameTimerRef.current) {
      clearTimeout(endGameTimerRef.current);
    }

    endGameTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      completeGameActivity('STOP_THINK_GO');
      endGameTimerRef.current = null;
    }, 500);
  }, [completeGameActivity]);

  const handleTap = useCallback(() => {
    if (isProcessing) return;

    if (light === 'GREEN') {
      const newSuccesses = successes + 1;
      const reactionTime = Math.max(0, Date.now() - greenStartTimeRef.current);
      const accuracy =
        (newSuccesses / (newSuccesses + wrongTaps)) * 100 || 100;

      setIsProcessing(true);
      setSuccesses(newSuccesses);
      setLight('RED');
      clearCycleTimer();

      // Send telemetry without blocking the reaction-time interaction.
      void onCorrectAnswer(
        {
          accuracy,
          reaction_time: reactionTime,
          hesitation_count: 0,
          retries: wrongTaps,
        },
        'STOP_THINK_GO'
      ).catch((error) => {
        console.error('[Stop Think Go] Failed to submit telemetry:', error);
      });

      if (newSuccesses >= STOP_THINK_GO_TARGET) {
        finishGame();
        return;
      }

      // Give the child an immediate visual reset, then start the next round.
      setIsProcessing(false);
      startCycle();
      return;
    }

    // Red light: incorrect tap.
    setWiggle(true);
    setWrongTaps((prev) => prev + 1);
    onIncorrectAnswer();

    if (wiggleTimerRef.current) {
      clearTimeout(wiggleTimerRef.current);
    }

    wiggleTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setWiggle(false);
      wiggleTimerRef.current = null;
    }, 500);
  }, [
    clearCycleTimer,
    finishGame,
    isProcessing,
    light,
    onCorrectAnswer,
    onIncorrectAnswer,
    startCycle,
    successes,
    wrongTaps,
  ]);

  return (
    <div className="flex flex-col items-center gap-8 mt-8">
      <div className="bg-slate-800 p-6 rounded-full flex flex-col gap-4 border-4 border-slate-700 shadow-xl">
        <div
          className={`w-24 h-24 rounded-full transition-colors duration-300 ${
            light === 'RED'
              ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : 'bg-red-900'
          }`}
        />
        <div
          className={`w-24 h-24 rounded-full transition-colors duration-300 ${
            light === 'GREEN' ? 'bg-green-500' : 'bg-green-900'
          }`}
        />
      </div>

      <motion.button
        animate={wiggle ? { x: [-5, 5, -5, 5, 0] } : {}}
        onClick={handleTap}
        disabled={isProcessing}
        className="w-full max-w-xs py-6 bg-[var(--color-accent)] text-white text-2xl font-bold rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
      >
        TAP TO GO!
      </motion.button>
    </div>
  );
};

export default StopThinkGo;
