import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { pecoCompanion } from '../../services/pecoCompanion';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Volume2, Sparkles, Award, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActivityChallengeView } from './ActivityChallengeView';

interface SocialChoice {
  id: number;
  text: string;
  isCorrect: boolean;
  actionIcon?: string;
}

interface SocialSituation {
  id: number;
  title: string;
  tag: string;
  icons: string;
  scenario: string;
  spokenPrompt: string;
  choices: SocialChoice[];
  correctExplanation: string;
  incorrectExplanation: string;
}

const SOCIAL_SITUATIONS: SocialSituation[] = [
  {
    id: 1,
    title: 'Greeting a Teacher',
    tag: 'School Morning',
    icons: '🏫 🧑‍🏫',
    scenario: 'Teacher: "Good morning!"',
    spokenPrompt: 'Imagine your teacher says good morning! What would you do?',
    choices: [
      { id: 0, text: 'Ignore them and walk away', isCorrect: false, actionIcon: '🚶' },
      { id: 1, text: "Say 'Good morning!' back", isCorrect: true, actionIcon: '👋' },
      { id: 2, text: 'Run to your desk', isCorrect: false, actionIcon: '🏃' },
    ],
    correctExplanation: "Great choice! Saying good morning is a friendly way to respond.",
    incorrectExplanation: "That's okay! When someone says hello, it is kind to greet them back. Try again!",
  },
  {
    id: 2,
    title: 'Asking for Help',
    tag: 'Classroom Learning',
    icons: '📚 🙋',
    scenario: "You don't understand your homework. What could you say?",
    spokenPrompt: "You don't understand your homework. What could you say?",
    choices: [
      { id: 0, text: '"Can you please help me?"', isCorrect: true, actionIcon: '🙋' },
      { id: 1, text: 'Walk away without saying anything', isCorrect: false, actionIcon: '🚶' },
      { id: 2, text: 'Get angry', isCorrect: false, actionIcon: '😠' },
    ],
    correctExplanation: 'Wonderful! Asking politely for help is always a great choice.',
    incorrectExplanation: "No worries! When you need help, asking politely works best. Let's try again!",
  },
  {
    id: 3,
    title: 'Joining a Game',
    tag: 'Recess & Playtime',
    icons: '🎲 🤝',
    scenario: 'Some children are playing a game. You want to join.',
    spokenPrompt: 'Some children are playing a game. You want to join.',
    choices: [
      { id: 0, text: '"Can I play with you?"', isCorrect: true, actionIcon: '🎲' },
      { id: 1, text: 'Take the game away', isCorrect: false, actionIcon: '✋' },
      { id: 2, text: 'Leave without asking', isCorrect: false, actionIcon: '🚶' },
    ],
    correctExplanation: "Super job! Asking 'Can I play with you?' is friendly and polite.",
    incorrectExplanation: "Almost! Asking nicely before joining helps everyone play happily together. Give it another try!",
  },
  {
    id: 4,
    title: 'Someone Gives You Something',
    tag: 'Sharing & Kindness',
    icons: '✏️ 🎁',
    scenario: 'A friend gives you a pencil.',
    spokenPrompt: 'A friend gives you a pencil. What could you say?',
    choices: [
      { id: 0, text: '"Thank you!"', isCorrect: true, actionIcon: '😊' },
      { id: 1, text: 'Throw it away', isCorrect: false, actionIcon: '🗑️' },
      { id: 2, text: 'Say nothing and leave', isCorrect: false, actionIcon: '🚶' },
    ],
    correctExplanation: 'Awesome! Saying thank you shows appreciation to your friend.',
    incorrectExplanation: "That's okay! Saying 'Thank you' shows kindness when someone shares. Try again!",
  },
  {
    id: 5,
    title: 'Saying Sorry',
    tag: 'Everyday Empathy',
    icons: '🚶 ❤️',
    scenario: 'You accidentally bump into someone.',
    spokenPrompt: 'You accidentally bump into someone. What would you say?',
    choices: [
      { id: 0, text: '"I\'m sorry."', isCorrect: true, actionIcon: '❤️' },
      { id: 1, text: 'Laugh and walk away', isCorrect: false, actionIcon: '😆' },
      { id: 2, text: 'Blame them', isCorrect: false, actionIcon: '👉' },
    ],
    correctExplanation: 'Great heart! Saying sorry shows respect and care for others.',
    incorrectExplanation: "No worries! Accidental bumps happen, and saying 'I'm sorry' helps smooth things over. Try again!",
  },
  {
    id: 6,
    title: 'Asking Before Borrowing',
    tag: 'Respecting Others',
    icons: '🖍️ 🎨',
    scenario: "You want to use your friend's crayons.",
    spokenPrompt: "You want to use your friend's crayons. What could you do?",
    choices: [
      { id: 0, text: 'Take them without asking', isCorrect: false, actionIcon: '✋' },
      { id: 1, text: '"Can I borrow your crayons?"', isCorrect: true, actionIcon: '🎨' },
      { id: 2, text: 'Hide the crayons', isCorrect: false, actionIcon: '🙈' },
    ],
    correctExplanation: "Terrific! Asking before borrowing shows respect for your friend's things.",
    incorrectExplanation: "Almost! It's polite to ask before taking someone's items. Let's try again!",
  },
  {
    id: 7,
    title: 'Responding to a Friend',
    tag: 'Friendly Connections',
    icons: '🪑 💬',
    scenario: 'Your friend says: "Do you want to sit with me?"',
    spokenPrompt: 'Your friend says: "Do you want to sit with me?" What would you say?',
    choices: [
      { id: 0, text: '"Yes, thank you!"', isCorrect: true, actionIcon: '🪑' },
      { id: 1, text: '"Go away!"', isCorrect: false, actionIcon: '🚫' },
      { id: 2, text: 'Ignore them completely', isCorrect: false, actionIcon: '😶' },
    ],
    correctExplanation: 'Fantastic! Accepting a friendly invitation kindly makes friends feel valued.',
    incorrectExplanation: "That's okay! Responding kindly helps friends feel appreciated. Give it another try!",
  },
];

const WhatWouldYouDo: React.FC = () => {
  const {
    onCorrectAnswer,
    triggerPecoEvent,
    speak,
    stopSpeaking,
    isPecoSpeaking,
    completeGameActivity,
    recordExerciseProgress,
    setCurrentScreen,
  } = useNurture();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [wiggleId, setWiggleId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [showRealWorldChallenge, setShowRealWorldChallenge] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);

  const hasRecordedCompletionRef = useRef(false);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const situationStartTimeRef = useRef<number>(Date.now());

  const currentSituation = SOCIAL_SITUATIONS[currentIndex];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, [stopSpeaking]);

  // Introduce the situation via Peco's voice on situation change
  useEffect(() => {
    if (isActivityCompleted || showRealWorldChallenge) return;

    situationStartTimeRef.current = Date.now();

    const situation = SOCIAL_SITUATIONS[currentIndex];
    if (situation) {
      triggerPecoEvent('NORMAL_STATE', situation.spokenPrompt, 4000);
      speak(situation.spokenPrompt, 'happy', { priority: 'normal', force: true });
    }
  }, [currentIndex, isActivityCompleted, showRealWorldChallenge, triggerPecoEvent, speak]);

  const handleReplayPrompt = useCallback(() => {
    if (isProcessing) return;
    const situation = SOCIAL_SITUATIONS[currentIndex];
    if (situation) {
      speak(situation.spokenPrompt, 'happy', { priority: 'high', force: true });
    }
  }, [currentIndex, isProcessing, speak]);

  const handleChoice = useCallback(
    async (choice: SocialChoice, index: number) => {
      // Prevent double clicks or rapid-fire interaction
      if (isProcessing || feedbackState === 'correct') {
        return;
      }

      setIsProcessing(true);
      setSelectedChoiceId(choice.id);

      if (choice.isCorrect) {
        setFeedbackState('correct');
        setFeedbackText(currentSituation.correctExplanation);
        setWiggleId(null);

        triggerPecoEvent('CORRECT_ANSWER', currentSituation.correctExplanation);

        const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;
        await onCorrectAnswer({
          accuracy,
          reaction_time: Date.now() - situationStartTimeRef.current,
          hesitation_count: 0,
          retries: wrongTries,
        }, 'WHAT_WOULD_YOU_DO');

        // 1. Speak the complete compliment and WAIT for Inworld audio to finish completely
        try {
          await speak(currentSituation.correctExplanation, 'celebrating', {
            priority: 'high',
            force: true,
          });
        } catch (speechErr) {
          console.warn('[Social Pathways] Speech error during compliment:', speechErr);
        }

        // 2. Double-check that Peco is no longer speaking
        while (pecoCompanion.isCurrentlySpeaking) {
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        // 3. Gentle brief pause after speech ends for smooth cognitive transition
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 4. Only after Peco has finished speaking the complete sentence:
        if (currentIndex < SOCIAL_SITUATIONS.length - 1) {
          // Advance to next situation
          setCurrentIndex((prev) => prev + 1);
          setSelectedChoiceId(null);
          setFeedbackState('idle');
          setFeedbackText('');
          setWrongTries(0);
          setIsProcessing(false);
        } else {
          // Situation 7 of 7 Mastered!
          // ONLY NOW show the Social Pathways completion screen
          setIsActivityCompleted(true);
          setIsProcessing(false);

          // Trigger celebration confetti
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}

          // Complete once in system
          if (!hasRecordedCompletionRef.current) {
            hasRecordedCompletionRef.current = true;
            recordExerciseProgress('WHAT_WOULD_YOU_DO');
            completeGameActivity('WHAT_WOULD_YOU_DO', { silentCompanion: true });
          }

          const completionMsg =
            'You practiced some great ways to communicate with others!';
          triggerPecoEvent('LEVEL_COMPLETE', completionMsg, 5000);
          speak(completionMsg, 'celebrating', { priority: 'high', force: true });
        }
      } else {
        // Incorrect answer: gentle encouraging feedback, allow retry, no XP penalty
        setFeedbackState('incorrect');
        setFeedbackText(currentSituation.incorrectExplanation);
        setWiggleId(index);
        setWrongTries((prev) => prev + 1);

        // Brief tactile vibration animation (500ms)
        setTimeout(() => {
          setWiggleId(null);
        }, 500);

        triggerPecoEvent('WRONG_ANSWER', currentSituation.incorrectExplanation);

        // Wait for Peco's Inworld audio to completely finish speaking the explanation
        try {
          await speak(currentSituation.incorrectExplanation, 'encouraging', {
            priority: 'high',
            force: true,
          });
        } catch (speechErr) {
          console.warn('[Social Pathways] Speech error during incorrect explanation:', speechErr);
        }

        // Double-check that Peco is no longer speaking
        while (pecoCompanion.isCurrentlySpeaking) {
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        // Re-enable answer choices so the child can try again
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      feedbackState,
      currentSituation,
      currentIndex,
      wrongTries,
      onCorrectAnswer,
      triggerPecoEvent,
      speak,
      recordExerciseProgress,
      completeGameActivity,
    ]
  );

  const handleRestart = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setWiggleId(null);
    setIsProcessing(false);
    setFeedbackState('idle');
    setFeedbackText('');
    setWrongTries(0);
    setIsActivityCompleted(false);
    setShowRealWorldChallenge(false);
  }, []);

  // 1. If child chooses to take the Real-World Challenge linked directly to Social Pathways
  if (showRealWorldChallenge) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <ActivityChallengeView
          activityId="WHAT_WOULD_YOU_DO"
          activityTitle="Social Pathways"
          customPecoIntro="You completed all 7 Social Pathways situations! Ready to practice your communication skills in a real-world scenario?"
          onFinished={() => setCurrentScreen('DAILY_QUEST')}
        />
      </div>
    );
  }

  // 2. Final Completion Screen after finishing all 7 situations
  if (isActivityCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-6 mt-4 w-full max-w-lg bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-indigo-100 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
          🎉
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-200/60">
            <Sparkles size={13} />
            Activity Mastered
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
            Social Pathways Complete!
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 leading-relaxed">
            "You practiced some great ways to communicate with others!"
          </p>
        </div>

        {/* XP and Situations Breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full my-1">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-2xl font-black text-amber-700">+70 XP</span>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5">
              XP Earned
            </span>
          </div>

          <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-2xl font-black text-teal-700">7 of 7</span>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider mt-0.5">
              Situations Mastered
            </span>
          </div>
        </div>

        {/* Clear Action Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={() => setShowRealWorldChallenge(true)}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Award size={18} />
            <span>Try Real-World Challenge</span>
            <ArrowRight size={18} />
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Practice Again</span>
            </button>

            <button
              onClick={() => setCurrentScreen('DAILY_QUEST')}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
            >
              Back to Quests
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 3. Active 7-Situation Exercise
  return (
    <div className="flex flex-col items-center gap-4 mt-2 w-full max-w-lg">
      {/* Exact Social Pathways Internal Progress (Situation X of 7) */}
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 shadow-2xs">
          Situation {currentIndex + 1} of {SOCIAL_SITUATIONS.length}
        </span>
        <div className="flex items-center gap-1.5" aria-label="Progress">
          {SOCIAL_SITUATIONS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? 'w-5 bg-teal-500'
                  : i === currentIndex
                  ? 'w-7 bg-teal-600'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Situation Card */}
      <div className="w-full bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-[var(--color-bg)] text-center text-xl font-medium text-[var(--color-text)] relative">
        <div className="text-4xl mb-3">{currentSituation.icons}</div>
        <div className="text-lg md:text-xl font-semibold leading-snug">
          {currentSituation.scenario}
        </div>

        {/* Read prompt button */}
        <button
          onClick={handleReplayPrompt}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          title="Listen again"
          aria-label="Listen to situation prompt again"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Choices List */}
      <div className="flex flex-col gap-3 w-full">
        {currentSituation.choices.map((choice, idx) => {
          const isSelected = selectedChoiceId === choice.id;
          const isSelectedCorrect = isSelected && feedbackState === 'correct';
          const isSelectedWrong = isSelected && feedbackState === 'incorrect';

          return (
            <motion.button
              key={choice.id}
              onClick={() => handleChoice(choice, idx)}
              disabled={isProcessing || feedbackState === 'correct'}
              animate={wiggleId === idx ? { x: [-6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.35 }}
              className={`w-full py-4 px-5 rounded-2xl text-base md:text-lg font-bold transition-all text-left flex items-center justify-between border-2 shadow-sm ${
                isSelectedCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                  : isSelectedWrong
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-100 hover:border-[var(--color-accent)] text-[var(--color-text)]'
              } ${isProcessing && !isSelected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                {choice.actionIcon && (
                  <span className="text-xl shrink-0">{choice.actionIcon}</span>
                )}
                <span>{choice.text}</span>
              </div>

              {isSelectedCorrect && (
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`w-full p-4 rounded-2xl text-sm md:text-base font-medium flex items-center justify-between gap-3 border shadow-xs ${
              feedbackState === 'correct'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/95 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl shrink-0">
                {feedbackState === 'correct' ? '🎉' : '💡'}
              </span>
              <span className="leading-snug">{feedbackText}</span>
            </div>

            {isPecoSpeaking && (
              <span
                id="peco-speaking-badge"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200/80 animate-pulse whitespace-nowrap"
              >
                <Volume2 size={13} className="text-purple-600" />
                🔊 Peco Speaking...
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatWouldYouDo;