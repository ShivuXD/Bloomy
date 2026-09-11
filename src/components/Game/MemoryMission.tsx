import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, HelpCircle, Check, ArrowRight, Volume2 } from 'lucide-react';
import { ActivityChallengeView } from './ActivityChallengeView';

interface MemoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
}

const ALL_ITEMS: MemoryItem[] = [
  { id: 'star', name: 'Golden Star', icon: '⭐', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  { id: 'rocket', name: 'Rocket', icon: '🚀', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  { id: 'apple', name: 'Red Apple', icon: '🍎', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  { id: 'balloon', name: 'Balloon', icon: '🎈', color: 'text-pink-500', bg: 'bg-pink-50 border-pink-200' },
  { id: 'bell', name: 'Bell', icon: '🔔', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { id: 'gem', name: 'Diamond Gem', icon: '💎', color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-200' },
  { id: 'heart', name: 'Heart', icon: '💖', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' },
  { id: 'clover', name: 'Clover', icon: '🍀', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
];

const MemoryMission: React.FC = () => {
  const {
  difficultyLevel,
  onCorrectAnswer,
  completeGameActivity,
  setCurrentScreen,
  triggerPecoEvent,
  accessibilitySettings,
  speak,
  stopSpeaking,
  isPecoSpeaking,
} = useNurture();

const memoryConfig = useMemo(() => {
  if (difficultyLevel <= 3) {
    return {
      length: 3,
      displayDurationMs: 1600,
      title: 'Warm Up',
    };
  }

  if (difficultyLevel <= 6) {
    return {
      length: 4,
      displayDurationMs: 1300,
      title: 'Step Up',
    };
  }

  return {
    length: 5,
    displayDurationMs: 1000,
    title: 'Master',
  };
}, [difficultyLevel]);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [phase, setPhase] = useState<'SHOWING' | 'RECALL' | 'ROUND_SUCCESS' | 'COMPLETE'>('SHOWING');
  const [targetSequence, setTargetSequence] = useState<MemoryItem[]>([]);
  const [candidatePool, setCandidatePool] = useState<MemoryItem[]>([]);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(-1);
  const [userInputs, setUserInputs] = useState<MemoryItem[]>([]);
  const [wiggleKey, setWiggleKey] = useState<number | null>(null);
  const [showHintPulse, setShowHintPulse] = useState(false);
  const [wrongTaps, setWrongTaps] = useState(0);

  const sequenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wiggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const recallStartTimeRef = useRef<number>(Date.now());


  const currentRound = {
  round: currentRoundIndex + 1,
  ...memoryConfig,
};

  // Clean up audio and all activity timers when navigating away.
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopSpeaking();

      if (sequenceTimerRef.current) {
        clearInterval(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }

      if (wiggleTimerRef.current) {
        clearTimeout(wiggleTimerRef.current);
        wiggleTimerRef.current = null;
      }

      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }

      if (roundAdvanceTimerRef.current) {
        clearTimeout(roundAdvanceTimerRef.current);
        roundAdvanceTimerRef.current = null;
      }
    };
  }, [stopSpeaking]);

  // Start a new memory round.
  const setupRound = useCallback((roundIdx: number) => {
    if (sequenceTimerRef.current) {
      clearInterval(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }

    const cfg = memoryConfig;

    // Randomize sequence of unique items.
    const shuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5);
    const chosenSeq = shuffled.slice(0, cfg.length);

    // Candidates are the chosen items plus 3 distractors.
    const remaining = shuffled.slice(cfg.length);
    const pool = [...chosenSeq, ...remaining.slice(0, 3)].sort(
      () => Math.random() - 0.5
    );

    setTargetSequence(chosenSeq);
    setCandidatePool(pool);
    setUserInputs([]);
    setPhase('SHOWING');
    setActiveHighlightIndex(0);
    setWrongTaps(0);
    setShowHintPulse(false);

    // One automatic speech source for the round intro.
    triggerPecoEvent(
      'NORMAL_STATE',
      `Round ${cfg.round}! Watch the items carefully.`
    );

    // Flash items one by one.
    let step = 0;

    sequenceTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      step += 1;

      if (step < chosenSeq.length) {
        setActiveHighlightIndex(step);
      } else {
        clearInterval(sequenceTimerRef.current!);
        sequenceTimerRef.current = null;

        setActiveHighlightIndex(-1);
        setPhase('RECALL');
        recallStartTimeRef.current = Date.now();

        // One automatic speech source for the recall instruction.
        triggerPecoEvent(
          'NORMAL_STATE',
          'Now tap the cards in the order you saw them!'
        );
      }
    }, cfg.displayDurationMs);
  }, [memoryConfig, triggerPecoEvent]);

  useEffect(() => {
    setupRound(currentRoundIndex);

    return () => {
      if (sequenceTimerRef.current) {
        clearInterval(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
    };
  }, [currentRoundIndex, setupRound]);

  const handleReplaySequence = () => {
    if (phase !== 'RECALL') return;

    if (sequenceTimerRef.current) {
      clearInterval(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }

    setUserInputs([]);
    setPhase('SHOWING');
    setActiveHighlightIndex(0);

    triggerPecoEvent(
      'NORMAL_STATE',
      "Let's watch the sequence one more time!"
    );

    const cfg = currentRound;
    let step = 0;

    sequenceTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      step += 1;

      if (step < targetSequence.length) {
        setActiveHighlightIndex(step);
      } else {
        clearInterval(sequenceTimerRef.current!);
        sequenceTimerRef.current = null;

        setActiveHighlightIndex(-1);
        setPhase('RECALL');
        recallStartTimeRef.current = Date.now();
        triggerPecoEvent(
          'NORMAL_STATE',
          'Now tap the cards in the order you saw them!'
        );
      }
    }, cfg.displayDurationMs);
  };

  const handleProvideHint = () => {
    if (
      phase !== 'RECALL' ||
      !targetSequence.length ||
      userInputs.length >= targetSequence.length
    ) {
      return;
    }

    setShowHintPulse(true);

    const nextExpected = targetSequence[userInputs.length];

    if (nextExpected) {
      // Hint has a single automatic speech source.
      triggerPecoEvent(
        'SHOW_HINT',
        `The next item is ${nextExpected.name}!`
      );
    }

    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    hintTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowHintPulse(false);
      hintTimerRef.current = null;
    }, 2000);
  };

  const handleCardClick = useCallback(
    (item: MemoryItem, poolIdx: number) => {
      if (!isMountedRef.current || phase !== 'RECALL') return;

      const nextExpected = targetSequence[userInputs.length];

      if (!nextExpected) return;

      if (item.id === nextExpected.id) {
        const updated = [...userInputs, item];
        setUserInputs(updated);

        if (updated.length === targetSequence.length) {
          // Round finished.
          triggerPecoEvent(
            'CORRECT_ANSWER',
            'Spot on! You remembered the whole pattern!'
          );

          const accuracy =
            (targetSequence.length /
              (targetSequence.length + wrongTaps)) *
              100 || 100;

          // Telemetry must never block the game.
          void onCorrectAnswer(
            {
              accuracy,
              reaction_time:
                Date.now() - recallStartTimeRef.current,
              hesitation_count: 0,
              retries: wrongTaps,
            },
            'MEMORY_MISSION'
          ).catch((error) => {
            console.error(
              '[MemoryMission] Failed to submit telemetry:',
              error
            );
          });

          if (currentRoundIndex + 1 < 3) {
            setPhase('ROUND_SUCCESS');

            try {
              confetti({
                particleCount: 35,
                spread: 60,
                origin: { y: 0.65 },
              });
            } catch {}

            if (roundAdvanceTimerRef.current) {
              clearTimeout(roundAdvanceTimerRef.current);
            }

            roundAdvanceTimerRef.current = setTimeout(() => {
              if (!isMountedRef.current) return;

              setCurrentRoundIndex((prev) => prev + 1);
              roundAdvanceTimerRef.current = null;
            }, 1500);
          } else {
            // Entire game completed.
            setPhase('COMPLETE');

            try {
              confetti({
                particleCount: 80,
                spread: 100,
                origin: { y: 0.55 },
              });
            } catch {}
          }
        }
      } else {
        // Mistake.
        setWiggleKey(poolIdx);
        setWrongTaps((prev) => prev + 1);

        triggerPecoEvent(
          'WRONG_ANSWER',
          "That's okay! Try that card again or tap Hint."
        );

        if (wiggleTimerRef.current) {
          clearTimeout(wiggleTimerRef.current);
        }

        wiggleTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setWiggleKey(null);
          wiggleTimerRef.current = null;
        }, 600);
      }
    },
    [
      currentRoundIndex,
      onCorrectAnswer,
      phase,
      setCurrentRoundIndex,
      targetSequence,
      triggerPecoEvent,
      userInputs,
      wrongTaps,
    ]
  );

  if (phase === 'COMPLETE') {
    return (
      <ActivityChallengeView
        activityId="MEMORY_MISSION"
        activityTitle="Memory Mission"
        customPecoIntro="You've trained your memory and sequence focus! Ready to see how you use your memory skills in everyday life?"
        onFinished={() => {
          completeGameActivity('adhd-memory-1');
          setCurrentScreen('DAILY_QUEST');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto text-center">
      {/* Top Round & Header Info */}
      <div className="flex items-center justify-between w-full mb-5 px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} />
            Round {currentRound.round} of 3
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {targetSequence.length} Steps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplaySequence}
            disabled={phase !== 'RECALL'}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1 disabled:opacity-40 transition-colors"
            title="Watch the sequence again"
          >
            <RotateCcw size={14} />
            <span>Replay</span>
          </button>
          <button
            onClick={handleProvideHint}
            disabled={phase === 'SHOWING' || phase === 'ROUND_SUCCESS' || phase === 'COMPLETE'}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1 disabled:opacity-40 transition-colors"
            title="Ask Peco for a hint"
          >
            <HelpCircle size={14} />
            <span>Hint</span>
          </button>
        </div>
      </div>

      {/* Target Memory Sequence Display Area */}
      <div className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="text-sm font-semibold text-slate-500 mb-3 flex items-center justify-center gap-2">
          {phase === 'SHOWING' ? (
            <span className="text-amber-600 font-bold animate-pulse flex items-center gap-1.5">
              👀 Memorize the sequence! Item {activeHighlightIndex + 1} of {targetSequence.length}
            </span>
          ) : phase === 'ROUND_SUCCESS' ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <Check size={16} /> Round Complete! Fantastic job!
            </span>
          ) : phase === 'COMPLETE' ? (
            <span className="text-purple-600 font-bold flex items-center gap-1.5">
              🌟 All Sequences Mastered!
            </span>
          ) : (
            <span className="text-slate-600">
              Tap the items in order ({userInputs.length} of {targetSequence.length})
            </span>
          )}
        </div>

        {/* The Sequence Slots */}
        <div className="flex justify-center items-center gap-2 md:gap-3 flex-wrap min-h-[96px]">
          {targetSequence.map((item, idx) => {
            const isFilled = userInputs.length > idx;
            const filledItem = userInputs[idx];
            const isCurrentlyShown = phase === 'SHOWING' && activeHighlightIndex === idx;

            return (
              <motion.div
                key={idx}
                animate={
                  isCurrentlyShown
                    ? { scale: [1, 1.15, 1], y: -4 }
                    : isFilled
                    ? { scale: [0.85, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                className={`w-16 h-20 md:w-20 md:h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                  isCurrentlyShown
                    ? 'border-amber-400 bg-amber-50 shadow-md ring-4 ring-amber-200'
                    : isFilled
                    ? 'border-emerald-300 bg-emerald-50 shadow-xs'
                    : 'border-dashed border-slate-200 bg-slate-50/70'
                }`}
              >
                {isCurrentlyShown ? (
                  <>
                    <span className="text-3xl md:text-4xl select-none">{item.icon}</span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-700 mt-1 truncate max-w-[64px]">
                      {item.name}
                    </span>
                  </>
                ) : isFilled ? (
                  <>
                    <span className="text-3xl md:text-4xl select-none">{filledItem.icon}</span>
                    <span className="text-[10px] md:text-xs font-bold text-emerald-700 mt-1 truncate max-w-[64px]">
                      {filledItem.name}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300 font-bold text-lg md:text-xl select-none">
                    {idx + 1}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interactive Item Pick Grid (Recall Phase) */}
      <div className="w-full">
        <p className="text-xs md:text-sm font-semibold text-slate-500 mb-3 text-left">
          {phase === 'SHOWING' ? 'Preparing cards below...' : 'Select next item in sequence:'}
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
          {candidatePool.map((candidate, idx) => {
            const nextExpected = targetSequence[userInputs.length];
            const isHintTarget = showHintPulse && nextExpected?.id === candidate.id;

            return (
              <motion.button
                key={candidate.id + idx}
                disabled={phase !== 'RECALL'}
                onClick={() => handleCardClick(candidate, idx)}
                animate={
                  wiggleKey === idx
                    ? { x: [-8, 8, -6, 6, 0] }
                    : isHintTarget
                    ? { scale: [1, 1.08, 1], boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }
                    : {}
                }
                whileHover={phase === 'RECALL' ? { scale: 1.04 } : {}}
                whileTap={phase === 'RECALL' ? { scale: 0.96 } : {}}
                className={`py-3.5 px-2 bg-white rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all ${
                  phase !== 'RECALL'
                    ? 'opacity-40 cursor-not-allowed border-slate-100'
                    : isHintTarget
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                    : 'border-slate-100 hover:border-amber-400 active:bg-amber-50/50'
                }`}
              >
                <span className="text-3xl md:text-4xl select-none">{candidate.icon}</span>
                <span className="text-xs md:text-sm font-bold text-[var(--color-text)] truncate max-w-full">
                  {candidate.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Audio pronunciation helper button */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            const next = targetSequence[userInputs.length];
            if (next) {
              if (isPecoSpeaking) {
                stopSpeaking();
              } else {
                speak(`Looking for ${next.name}`, 'thinking', { force: true });
              }
            }
          }}
          className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
            isPecoSpeaking
              ? 'bg-indigo-100 text-indigo-700 font-semibold animate-pulse'
              : 'text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50'
          }`}
        >
          <Volume2 size={14} />
          <span>{isPecoSpeaking ? 'Peco speaking...' : 'Tap to hear instructions'}</span>
        </button>
      </div>
    </div>
  );
};

export default MemoryMission;