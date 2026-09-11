import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion } from 'framer-motion';
import { Star, Circle, Square, Triangle } from 'lucide-react';

const TOTAL_ROUNDS = 3;

const FocusGame: React.FC = () => {
  const {
    difficultyLevel,
    onCorrectAnswer,
    onIncorrectAnswer,
    onHintNeeded,
    setCurrentMission,
  } = useNurture();

  const [round, setRound] = useState(1);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [wiggleIndex, setWiggleIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start time for the CURRENT round
  const roundStartTimeRef = useRef<number>(Date.now());

  // Keep the transition timer under control so it can be cleaned up on unmount.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  /*
   * Difficulty controls the number of choices.
   *
   * 1-3  → 3 choices
   * 4-6  → 4 choices
   * 7-10 → 6 choices
   */
  const numChoices = Math.min(
    6,
    Math.max(3, 2 + Math.floor(difficultyLevel / 2))
  );

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const clearWiggleTimer = useCallback(() => {
    if (wiggleTimerRef.current) {
      clearTimeout(wiggleTimerRef.current);
      wiggleTimerRef.current = null;
    }
  }, []);

  // Reset round timer whenever a new round begins
  useEffect(() => {
    roundStartTimeRef.current = Date.now();
    setHesitationCount(0);
    setWrongTries(0);
    setWiggleIndex(null);
    setIsProcessing(false);
  }, [round]);

  // Track hesitation and offer a gentle hint
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMountedRef.current || isProcessing) return;

      setHesitationCount((prev) => prev + 1);
      onHintNeeded('FOCUS');
    }, 10000);

    return () => clearTimeout(timer);
  }, [round, onHintNeeded, isProcessing]);

  // Clean up timers when the activity unmounts.
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearAdvanceTimer();
      clearWiggleTimer();
    };
  }, [clearAdvanceTimer, clearWiggleTimer]);

  /*
   * Generate the choices for the CURRENT round.
   *
   * The round is part of the dependency so a new set of
   * choices is generated for every round.
   */
  const choices = useMemo(() => {
    const icons = [
      <Circle size={64} />,
      <Square size={64} />,
      <Triangle size={64} />,
      <Circle size={64} />,
      <Square size={64} />,
    ];

    return Array.from({ length: numChoices })
      .map((_, i) => ({
        id: i,
        isCorrect: i === 0,
        icon:
          i === 0 ? (
            <Star fill="#FACC15" color="#FACC15" size={64} />
          ) : (
            icons[i - 1]
          ),
      }))
      .sort(() => Math.random() - 0.5);
  }, [numChoices, round]);

  const handleChoice = useCallback(
    (isCorrect: boolean, index: number) => {
      if (isProcessing || !isMountedRef.current) return;

      if (isCorrect) {
        /*
         * Lock the interaction immediately so repeated taps cannot
         * submit multiple answers while the round is advancing.
         */
        setIsProcessing(true);

        const accuracy =
          ((1 - wrongTries / (wrongTries + 1)) * 100) || 100;

        const reactionTime =
          Math.max(0, Date.now() - roundStartTimeRef.current);

        /*
         * Send THIS round's behavioral data in the background.
         * Gameplay must not wait for the backend/ML response.
         */
        void onCorrectAnswer(
          {
            accuracy,
            reaction_time: reactionTime,
            hesitation_count: hesitationCount,
            retries: wrongTries,
          },
          'FOCUS'
        ).catch((error) => {
          console.error('[FocusGame] Failed to submit telemetry:', error);
        });

        /*
         * Give the child a short visual pause after the correct choice,
         * then immediately advance. No backend wait.
         */
        clearAdvanceTimer();

        advanceTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;

          if (round < TOTAL_ROUNDS) {
            setRound((prev) => prev + 1);
          } else {
            // Focus activity is complete
            setCurrentMission('READING');
            setIsProcessing(false);
          }

          advanceTimerRef.current = null;
        }, 300);
      } else {
        const newWrongs = wrongTries + 1;

        setWrongTries(newWrongs);
        setWiggleIndex(index);

        onIncorrectAnswer(newWrongs);

        clearWiggleTimer();
        wiggleTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setWiggleIndex(null);
          wiggleTimerRef.current = null;
        }, 500);
      }
    },
    [
      clearAdvanceTimer,
      clearWiggleTimer,
      hesitationCount,
      isProcessing,
      onCorrectAnswer,
      onIncorrectAnswer,
      round,
      setCurrentMission,
      wrongTries,
    ]
  );

  return (
    <div className="w-full flex flex-col items-center gap-5 mt-4">
      {/* Round indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-600">
          Focus Challenge
        </span>

        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
          Round {round} / {TOTAL_ROUNDS}
        </span>
      </div>

      {/* Difficulty indicator - useful during prototype/demo */}
      <div className="text-xs text-slate-400">
        Challenge level: {difficultyLevel}
      </div>

      {/* Choices */}
      <div className="flex flex-wrap justify-center gap-6">
        {choices.map((choice, idx) => (
          <motion.button
            key={`${round}-${choice.id}`}
            onClick={() => handleChoice(choice.isCorrect, idx)}
            animate={
              wiggleIndex === idx
                ? { x: [-5, 5, -5, 5, 0] }
                : {}
            }
            transition={{ duration: 0.4 }}
            disabled={isProcessing}
            className="w-32 h-32 md:w-36 md:h-36
              bg-slate-50
              shadow-sm
              rounded-3xl
              flex items-center justify-center
              border-4 border-slate-100
              hover:border-indigo-400
              hover:bg-white
              transition-all
              text-slate-400
              cursor-pointer
              disabled:opacity-70"
          >
            {choice.icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FocusGame;
