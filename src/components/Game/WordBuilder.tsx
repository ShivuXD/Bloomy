import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  RotateCcw,
  Delete,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ActivityChallengeView } from './ActivityChallengeView';

interface WordExercise {
  word: string;
  emoji: string;
  clue: string;
  pecoCheer: string;
}

const WORD_EXERCISES: WordExercise[] = [
  {
    word: 'CAT',
    emoji: '🐱',
    clue: 'A furry pet that purrs softly.',
    pecoCheer: 'Awesome! You spelled CAT! Purr-fect job!',
  },
  {
    word: 'DOG',
    emoji: '🐶',
    clue: 'A friendly pet that wags its tail and barks.',
    pecoCheer: 'Look at that! DOG! You are a word detective!',
  },
  {
    word: 'SUN',
    emoji: '☀️',
    clue: 'Shines bright and warm in the daytime sky.',
    pecoCheer: 'Bright and sunny! SUN is spelled so nicely!',
  },
  {
    word: 'FISH',
    emoji: '🐟',
    clue: 'Swims gracefully in ponds, lakes, and oceans.',
    pecoCheer: 'Splendid swimming! You blended the sounds for FISH!',
  },
  {
    word: 'TREE',
    emoji: '🌳',
    clue: 'Has tall branches and leafy green shade.',
    pecoCheer: 'Super job! TREE has two Es and tall branches!',
  },
  {
    word: 'BOOK',
    emoji: '📖',
    clue: 'Filled with wonderful stories, pictures, and adventures.',
    pecoCheer: 'Wonderful reading! You formed the word BOOK!',
  },
  {
    word: 'STAR',
    emoji: '⭐',
    clue: 'Twinkles high above in the night sky.',
    pecoCheer: 'Stellar work! STAR makes the night sky sparkle!',
  },
];

interface LetterTile {
  id: number;
  char: string;
  isUsed: boolean;
}

const WordBuilder: React.FC = () => {
  const {
    onCorrectAnswer,
    triggerPecoEvent,
    speak,
    stopSpeaking,
    isPecoSpeaking,
    setCurrentScreen,
    completeGameActivity,
    recordExerciseProgress,
  } = useNurture();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState<LetterTile[]>([]);
  const [placedIndices, setPlacedIndices] = useState<number[]>([]); // indexes of letters placed
  const [isWordComplete, setIsWordComplete] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [isAllWordsComplete, setIsAllWordsComplete] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);

  const currentExercise = WORD_EXERCISES[currentWordIndex];
  const targetWord = currentExercise.word;
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordStartTimeRef = useRef<number>(Date.now());

  // Initialize or reset letters for the current word
  const setupWord = useCallback((index: number) => {
    const exercise = WORD_EXERCISES[index];
    const chars = exercise.word.split('');
    
    // Deterministic or pseudo-random scramble that guarantees not matching the word immediately
    const scrambled = [...chars].sort(() => Math.random() - 0.5);
    // If scramble equals original and length > 1, swap first two
    if (scrambled.join('') === exercise.word && scrambled.length > 1) {
      const tmp = scrambled[0];
      scrambled[0] = scrambled[1];
      scrambled[1] = tmp;
    }

    setLetters(
      scrambled.map((char, i) => ({
        id: i,
        char,
        isUsed: false,
      }))
    );
    setPlacedIndices([]);
    setIsWordComplete(false);
    setWrongTries(0);
    wordStartTimeRef.current = Date.now();

    // Speak introduction for the word
    const prompt = `Word ${index + 1} of ${WORD_EXERCISES.length}: Let's spell ${exercise.word}! ${exercise.clue}`;
    triggerPecoEvent('NORMAL_STATE', `Word ${index + 1}: Spell ${exercise.word}!`, 3500);
    speak(prompt, 'idle', { priority: 'normal', force: true });
  }, [triggerPecoEvent, speak]);

  // Load first word on mount
  useEffect(() => {
    setupWord(0);
    return () => {
      stopSpeaking();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // What has been spelled so far based on placedIndices
  const currentSpelled = placedIndices.map((idx) => letters[idx]?.char || '').join('');

  // Handle clicking a letter tile to place it
  const handleTileClick = async (tileIndex: number) => {
    if (isWordComplete) return;
    const tile = letters[tileIndex];
    if (tile.isUsed) return;

    const nextCharIndex = placedIndices.length;
    const expectedChar = targetWord[nextCharIndex];

    if (tile.char === expectedChar) {
      // Correct letter placement
      const newPlaced = [...placedIndices, tileIndex];
      setPlacedIndices(newPlaced);
      setLetters((prev) =>
        prev.map((l, i) => (i === tileIndex ? { ...l, isUsed: true } : l))
      );

      const newSpelled = currentSpelled + tile.char;

      if (newSpelled === targetWord) {
        // Word is finished!
        setIsWordComplete(true);
        recordExerciseProgress('WORD_BUILDER');
        triggerPecoEvent('CORRECT_ANSWER', currentExercise.pecoCheer);
        speak(currentExercise.pecoCheer, 'celebrating', { priority: 'high', force: true });

        const accuracy = (targetWord.length / (targetWord.length + wrongTries)) * 100 || 100;
        await onCorrectAnswer({
          accuracy,
          reaction_time: Date.now() - wordStartTimeRef.current,
          hesitation_count: 0,
          retries: wrongTries,
        }, 'WORD_BUILDER');

        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch {}

        // Auto-advance or wait for user to click next
        advanceTimerRef.current = setTimeout(() => {
          handleNextWord();
        }, 2200);
      } else {
        triggerPecoEvent('CORRECT_ANSWER', `Nice! Next letter for ${targetWord}!`, 2000);
      }
    } else {
      // Incorrect letter placement
      setWiggle(true);
      setWrongTries((prev) => prev + 1);
      const gentleCorrection = `Try sounding out the next letter of ${targetWord}!`;
      triggerPecoEvent('WRONG_ANSWER', gentleCorrection, 2000);
      speak(gentleCorrection, 'comforting', { priority: 'high', force: true });
      setTimeout(() => setWiggle(false), 500);
    }
  };

  // Backspace / Remove last placed letter
  const handleBackspace = () => {
    if (placedIndices.length === 0 || isWordComplete) return;
    const lastIndex = placedIndices[placedIndices.length - 1];
    setPlacedIndices((prev) => prev.slice(0, -1));
    setLetters((prev) =>
      prev.map((l, i) => (i === lastIndex ? { ...l, isUsed: false } : l))
    );
  };

  // Reset current word to try again
  const handleResetWord = () => {
    if (isWordComplete) return;
    setPlacedIndices([]);
    setLetters((prev) => prev.map((l) => ({ ...l, isUsed: false })));
  };

  // Move to next word or complete activity
  const handleNextWord = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    if (currentWordIndex + 1 < WORD_EXERCISES.length) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setupWord(nextIndex);
    } else {
      // Completed all 7 words!
      setIsAllWordsComplete(true);
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.55 },
        });
      } catch {}
    }
  };

  const handleHearClue = () => {
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(`Spell ${currentExercise.word}. ${currentExercise.clue}`, 'talking', { force: true });
    }
  };

  // If all 7 words are complete, render the contextual Real-World Challenge view
  if (isAllWordsComplete) {
    return (
      <ActivityChallengeView
        activityId="WORD_BUILDER"
        activityTitle="Word Explorer"
        customPecoIntro="You've been exploring lots of new words! Now let's see how you can use your word skills in the real world."
        onFinished={() => {
          completeGameActivity('WORD_BUILDER');
          setCurrentScreen('DAILY_QUEST');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Activity Progress Header */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold rounded-full text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} />
            Word {currentWordIndex + 1} of {WORD_EXERCISES.length}
          </span>
        </div>

        <button
          onClick={handleHearClue}
          className={`px-3 py-1.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-colors ${
            isPecoSpeaking
              ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
              : 'border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800'
          }`}
          title="Hear clue read aloud with Peco's voice"
        >
          <Volume2 size={14} />
          <span>{isPecoSpeaking ? 'Reading...' : 'Hear Clue'}</span>
        </button>
      </div>

      {/* Visual Step Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-5 overflow-hidden">
        <div
          className="bg-purple-600 h-full rounded-full transition-all duration-300"
          style={{
            width: `${((currentWordIndex + (isWordComplete ? 1 : 0)) / WORD_EXERCISES.length) * 100}%`,
          }}
        />
      </div>

      {/* Clue Card */}
      <motion.div
        key={currentExercise.word}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-6 text-center relative overflow-hidden"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl md:text-6xl drop-shadow-xs">
            {currentExercise.emoji}
          </span>
          <p className="text-slate-700 font-semibold text-sm md:text-base max-w-sm mt-1">
            "{currentExercise.clue}"
          </p>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Spell the word: {currentExercise.word.length} letters
          </span>
        </div>
      </motion.div>

      {/* Target Word Slots */}
      <motion.div
        animate={wiggle ? { x: [-8, 8, -6, 6, 0] } : {}}
        className="flex gap-2.5 sm:gap-3.5 mb-6 justify-center"
      >
        {Array.from({ length: targetWord.length }).map((_, i) => {
          const char = currentSpelled[i] || '';
          const isFilled = Boolean(char);
          const isNextSlot = i === placedIndices.length;

          return (
            <div
              key={i}
              className={`w-14 h-18 sm:w-18 sm:h-22 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-extrabold uppercase transition-all shadow-sm ${
                isWordComplete
                  ? 'bg-emerald-50 border-3 border-emerald-500 text-emerald-800'
                  : isFilled
                  ? 'bg-purple-50 border-3 border-purple-500 text-purple-900 shadow-md'
                  : isNextSlot
                  ? 'bg-white border-3 border-dashed border-indigo-400 text-slate-300 animate-pulse'
                  : 'bg-white border-2 border-slate-200 text-slate-300'
              }`}
            >
              {char}
            </div>
          );
        })}
      </motion.div>

      {/* Interactive Jumbled Letter Tiles */}
      <div className="flex flex-wrap gap-3 justify-center mb-6 max-w-md">
        {letters.map((tile, idx) => {
          return (
            <motion.button
              key={tile.id}
              disabled={tile.isUsed || isWordComplete}
              onClick={() => handleTileClick(idx)}
              whileHover={!tile.isUsed && !isWordComplete ? { scale: 1.08 } : {}}
              whileTap={!tile.isUsed && !isWordComplete ? { scale: 0.94 } : {}}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-2xl sm:text-3xl font-black uppercase transition-all flex items-center justify-center shadow-sm ${
                tile.isUsed
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'
                  : 'bg-white text-slate-800 hover:text-purple-700 hover:border-purple-400 active:bg-purple-50 border-2 border-slate-200 shadow-md cursor-pointer'
              }`}
            >
              {tile.char}
            </motion.button>
          );
        })}
      </div>

      {/* Letter Control Action Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBackspace}
          disabled={placedIndices.length === 0 || isWordComplete}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Delete size={15} />
          <span>Backspace</span>
        </button>

        <button
          onClick={handleResetWord}
          disabled={placedIndices.length === 0 || isWordComplete}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={15} />
          <span>Clear</span>
        </button>

        {isWordComplete && (
          <button
            onClick={handleNextWord}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-transform shadow-md"
          >
            <span>Next Word</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Completion Banner */}
      <AnimatePresence>
        {isWordComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm md:text-base font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{currentExercise.pecoCheer}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordBuilder;