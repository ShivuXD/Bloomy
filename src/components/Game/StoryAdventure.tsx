import React, { useState, useEffect, useRef } from 'react';import { useNurture } from '../../contexts/NurtureContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BookOpen, Volume2, Sparkles, Check, HelpCircle, Heart, Star } from 'lucide-react';
import { ActivityChallengeView } from './ActivityChallengeView';

interface StoryStep {
  id: number;
  title: string;
  illustration: string;
  illustrationBg: string;
  themeColor: string;
  simpleSentence: string;
  highlightWord: string;
  question: string;
  audioPrompt: string;
  choices: {
    id: string;
    label: string;
    icon: string;
    color: string;
    isCorrect: boolean;
    cheer: string;
  }[];
}

const EASY_STORIES: StoryStep[] = [
  {
    id: 1,
    title: "The Garden Snack",
    illustration: "🌳 🍎 🐰",
    illustrationBg: "bg-gradient-to-b from-emerald-50 to-emerald-100 border-emerald-200",
    themeColor: "text-emerald-700",
    simpleSentence: "Peco found a big red apple under the green tree.",
    highlightWord: "apple",
    question: "What tasty fruit did Peco find?",
    audioPrompt: "Peco found a big red apple under the tree! What fruit did Peco find?",
    choices: [
      {
        id: 'apple',
        label: "Red Apple",
        icon: "🍎",
        color: "hover:border-red-400 border-slate-200 bg-white",
        isCorrect: true,
        cheer: "Yummy! You found the shiny red apple!",
      },
      {
        id: 'banana',
        label: "Yellow Banana",
        icon: "🍌",
        color: "hover:border-amber-400 border-slate-200 bg-white",
        isCorrect: false,
        cheer: "Bananas are sweet, but look for the red fruit!",
      },
    ],
  },
  {
    id: 2,
    title: "The Playful Friend",
    illustration: "🐶 🎾 🌼",
    illustrationBg: "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-200",
    themeColor: "text-amber-700",
    simpleSentence: "A happy puppy brings a bright yellow ball to play.",
    highlightWord: "puppy",
    question: "Who wants to play with Peco?",
    audioPrompt: "A happy puppy brings a bright ball to play! Who wants to play?",
    choices: [
      {
        id: 'puppy',
        label: "Happy Puppy",
        icon: "🐶",
        color: "hover:border-amber-400 border-slate-200 bg-white",
        isCorrect: true,
        cheer: "Woof woof! The happy puppy loves playing catch!",
      },
      {
        id: 'fish',
        label: "Blue Fish",
        icon: "🐠",
        color: "hover:border-blue-400 border-slate-200 bg-white",
        isCorrect: false,
        cheer: "Fish like swimming! Who is wagging their tail?",
      },
    ],
  },
  {
    id: 3,
    title: "The Night Star",
    illustration: "🌙 ⭐ ☁️",
    illustrationBg: "bg-gradient-to-b from-indigo-50 to-indigo-100 border-indigo-200",
    themeColor: "text-indigo-700",
    simpleSentence: "A cheerful yellow star twinkles gently in the cozy night sky.",
    highlightWord: "star",
    question: "What is shining in the cozy night sky?",
    audioPrompt: "A cheerful star twinkles in the sky! What is shining up high?",
    choices: [
      {
        id: 'star',
        label: "Yellow Star",
        icon: "⭐",
        color: "hover:border-yellow-400 border-slate-200 bg-white",
        isCorrect: true,
        cheer: "Sparkle sparkle! You spotted the glowing star!",
      },
      {
        id: 'car',
        label: "Red Car",
        icon: "🚗",
        color: "hover:border-rose-400 border-slate-200 bg-white",
        isCorrect: false,
        cheer: "Cars drive on roads! Look up in the night sky!",
      },
    ],
  },
];

const StoryAdventure: React.FC = () => {
  const {
    onCorrectAnswer,
    completeGameActivity,
    setCurrentScreen,
    triggerPecoEvent,
    accessibilitySettings,
    speak,
    stopSpeaking,
    isPecoSpeaking,
  } = useNurture();

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [showHintPulse, setShowHintPulse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const stepStartTimeRef = useRef<number>(Date.now());
  const current = EASY_STORIES[stepIndex];

  // Auto-read on step change if text-to-speech is enabled or on first render
    useEffect(() => {
    setSelectedId(null);
    setIsCorrect(null);
    setFeedback('');
    setShowHintPulse(false);

    triggerPecoEvent('NORMAL_STATE', `Story time! Listen: "${current.simpleSentence}"`);
    if (accessibilitySettings.textToSpeech) {
      speak(current.audioPrompt, 'talking', { force: true });
    }
  }, [stepIndex]);

  // Stop audio if navigating away
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleHearStory = () => {
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(current.audioPrompt, 'talking', { force: true });
    }
  };

  const handleHelpHint = () => {
    setShowHintPulse(true);
    const correctChoice = current.choices.find(c => c.isCorrect);
    if (correctChoice) {
      triggerPecoEvent('SHOW_HINT', `Look for the ${correctChoice.label}!`);
    }
    setTimeout(() => setShowHintPulse(false), 3000);
  };

    const handleChoose = async (choice: StoryStep['choices'][0]) => {
    setSelectedId(choice.id);

    if (choice.isCorrect) {
      setIsCorrect(true);
      setFeedback(choice.cheer);
      triggerPecoEvent('CORRECT_ANSWER', choice.cheer);

      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
      } catch {}

      const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;
      await onCorrectAnswer({
        accuracy,
        reaction_time: Date.now() - stepStartTimeRef.current,
        hesitation_count: 0,
        retries: wrongTries,
      }, 'STORY_ADVENTURE');

      setTimeout(() => {
        if (stepIndex + 1 < EASY_STORIES.length) {
          setStepIndex(prev => prev + 1);
        } else {
          // Completed all stories
          setIsCompleted(true);
          try {
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.55 } });
          } catch {}
        }
      }, 2000);
    } else {
      setIsCorrect(false);
      setFeedback(choice.cheer);
      setWiggleId(choice.id);
      setWrongTries((prev) => prev + 1);
      triggerPecoEvent('WRONG_ANSWER', choice.cheer);
      setTimeout(() => setWiggleId(null), 700);
    }
  };

  if (isCompleted) {
    return (
      <ActivityChallengeView
        activityId="STORY_ADVENTURE"
        activityTitle="Story Adventure"
        customPecoIntro="You've finished your story comprehension adventure! Ready to see your story skills in the real world?"
        onFinished={() => {
          completeGameActivity('dys-comp-1');
          setCurrentScreen('DAILY_QUEST');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto text-center select-none">
      {/* Top Header: Progress & Audio */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-purple-100 text-purple-900 font-extrabold rounded-full text-xs md:text-sm tracking-wide flex items-center gap-1.5 shadow-xs">
            <BookOpen size={16} />
            Story {stepIndex + 1} of {EASY_STORIES.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHelpHint}
            disabled={isCorrect === true}
            className="px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1 transition-transform active:scale-95"
            title="Ask for a gentle hint"
          >
            <HelpCircle size={15} />
            <span>Hint</span>
          </button>
          <button
            onClick={handleHearStory}
            className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
              isPecoSpeaking
                ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Volume2 size={16} />
            <span>{isPecoSpeaking ? 'Reading...' : 'Listen'}</span>
          </button>
        </div>
      </div>

      {/* Big Friendly Picture Card */}
      <motion.div
        key={current.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-3xl p-6 border-3 ${current.illustrationBg} shadow-sm mb-5 relative flex flex-col items-center`}
      >
        {/* Large, joyful emoji illustration */}
        <div className="text-6xl md:text-7xl my-2 tracking-widest drop-shadow-sm filter transition-transform hover:scale-105">
          {current.illustration}
        </div>

        {/* Short, friendly sentence with big easy-to-read text */}
        <div
          onClick={handleHearStory}
          className="mt-3 p-3 bg-white/90 rounded-2xl border border-white/80 shadow-xs cursor-pointer hover:bg-white transition-colors"
        >
          <p className="text-lg md:text-xl font-bold text-slate-800 leading-snug tracking-wide">
            {current.simpleSentence}
          </p>
        </div>

        <p className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1">
          <span>🔊 Tap anywhere on the card to hear it again</span>
        </p>
      </motion.div>

      {/* Simple Big Question */}
      <div className="w-full bg-white rounded-2xl p-4 border-2 border-slate-100 shadow-xs mb-4">
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-700 mb-1">
          <Sparkles size={15} />
          <span>Picture Question</span>
        </div>
        <h3 className="text-lg md:text-xl font-black text-slate-800">
          {current.question}
        </h3>
      </div>

      {/* 2 Big Picture Choices */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {current.choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const showCorrect = isSelected && isCorrect === true;
          const isHintTarget = showHintPulse && choice.isCorrect;

          return (
            <motion.button
              key={choice.id}
              disabled={isCorrect === true}
              onClick={() => handleChoose(choice)}
              animate={
                wiggleId === choice.id
                  ? { x: [-10, 10, -8, 8, 0] }
                  : isHintTarget
                  ? { scale: [1, 1.06, 1], boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }
                  : {}
              }
              whileHover={!isCorrect ? { scale: 1.04, y: -2 } : {}}
              whileTap={!isCorrect ? { scale: 0.96 } : {}}
              className={`min-h-[140px] md:min-h-[160px] p-4 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${
                showCorrect
                  ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                  : isHintTarget
                  ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-200'
                  : choice.color
              }`}
            >
              {/* Huge Icon */}
              <span className="text-5xl md:text-6xl drop-shadow-xs">
                {choice.icon}
              </span>

              {/* Clear Label */}
              <span className="text-base md:text-lg font-black text-slate-800 tracking-wide">
                {choice.label}
              </span>

              {showCorrect && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                  <Check size={14} /> Yes!
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Encouraging Praise Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`w-full mt-4 p-4 rounded-2xl border-2 text-base font-extrabold flex items-center justify-center gap-2 shadow-xs ${
              isCorrect
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
            <p>{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryAdventure;
