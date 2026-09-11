import React, { useEffect, useRef, useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { prepareAudioPlayback } from '../../services/inworldService';
import { motion } from 'framer-motion';
import { Volume2, BookOpen, CheckCircle2 } from 'lucide-react';

const STORY_TEXT =
  "Riya was very excited about her ice cream. She was walking home when the ice cream slipped from her hand and fell on the ground. Riya looked at her melted ice cream and started to cry.";

const QUESTION_TEXT = "How do you think Riya feels?";

const FULL_STORY_SPEECH = `${STORY_TEXT} ${QUESTION_TEXT}`;

interface Choice {
  id: number;
  label: string;
  isCorrect: boolean;
  emoji: string;
}

const CHOICES: Choice[] = [
  { id: 1, label: 'Sad', isCorrect: true, emoji: '😢' },
  { id: 2, label: 'Happy', isCorrect: false, emoji: '😊' },
  { id: 3, label: 'Angry', isCorrect: false, emoji: '😠' },
];

const SocialGame: React.FC = () => {
  const {
    onCorrectAnswer,
    isPecoSpeaking,
    speak,
    completeGameActivity,
    setCurrentScreen,
  } = useNurture();

  const [startTime] = useState(Date.now());
  const [hesitationCount] = useState(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [wiggleIndex, setWiggleIndex] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);

  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }

      if (wiggleTimerRef.current) {
        clearTimeout(wiggleTimerRef.current);
        wiggleTimerRef.current = null;
      }
    };
  }, []);

  const handleReadStory = () => {
    if (isPecoSpeaking || isProcessing || isCompleted) return;
    prepareAudioPlayback();
    speak(FULL_STORY_SPEECH, 'thinking', {
      priority: 'high',
      force: true,
    });
  };

  const handleChoice = async (choice: Choice, index: number) => {
    if (isPecoSpeaking || isProcessing || isCompleted) return;

    prepareAudioPlayback();
    setSelectedChoice(choice);
    setIsProcessing(true);

    if (choice.isCorrect) {
      // 1. Highlight Sad as correct
      setFeedbackType('correct');
      setFeedbackMessage(
        "That's right! Riya feels sad because she lost something she was excited about."
      );

      // 2. Peco says the COMPLETE sentence using Inworld voice
      const pecoSpeech =
        "That's right. Riya feels sad because she lost something she was excited about.";

      try {
        await speak(pecoSpeech, 'celebrating', {
          priority: 'high',
          force: true,
        });
      } catch (err) {
        console.warn('Peco speech ended or encountered an issue:', err);
      }

      // Wait for Peco's feedback to finish, then complete the activity.
      setIsCompleted(true);
      completeGameActivity('SOCIAL', { silentCompanion: true });

      // ML telemetry runs in the background so navigation is not blocked by the backend.
      const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;
      void onCorrectAnswer({
        accuracy,
        reaction_time: Date.now() - startTime,
        hesitation_count: hesitationCount,
        retries: wrongTries,
      }, 'SOCIAL').catch((error) => {
        console.error('[SocialGame] Failed to submit telemetry:', error);
      });

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      navigationTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setCurrentScreen('HOLISTIC_MAP');
        navigationTimerRef.current = null;
      }, 1000);
    } else {
      // Incorrect answer: Happy or Angry
      const newWrongs = wrongTries + 1;
      setWrongTries(newWrongs);
      setWiggleIndex(index);
      setFeedbackType('incorrect');

      let explanationText = '';
      let onScreenFeedback = '';

      if (choice.label === 'Happy') {
        onScreenFeedback =
          "Almost! Riya was excited at first, but she started to cry when her ice cream fell. She feels sad, not happy.";
        explanationText =
          "Riya was excited at first, but she started to cry when her ice cream fell. She feels sad, not happy. Think about how she feels, and give it another try!";
      } else {
        // Angry
        onScreenFeedback =
          "Riya might feel upset, but crying shows she feels sad about losing her ice cream.";
        explanationText =
          "Riya might feel upset, but crying shows she feels sad about losing her ice cream. Let's try again!";
      }

      setFeedbackMessage(onScreenFeedback);

      try {
        // Peco explains why Sad is the best answer
        await speak(explanationText, 'comforting', {
          priority: 'high',
          force: true,
        });
      } catch (err) {
        console.warn('Peco explanation ended or encountered an issue:', err);
      }

      // Keep the child locked until Peco's correction finishes, then allow another try.
      if (isMountedRef.current) {
        setWiggleIndex(null);
        setSelectedChoice(null);
        setIsProcessing(false);
      }
      // Do not move forward after an incorrect answer.
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg">
      {/* 1. Ice-Cream Story Box */}
      <div className="w-full bg-white rounded-2xl p-4 md:p-5 border-2 border-slate-100 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Story
            </span>
          </div>
          <button
            type="button"
            onClick={handleReadStory}
            disabled={isPecoSpeaking || isProcessing || isCompleted}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isPecoSpeaking
                ? 'bg-purple-100 text-purple-700 opacity-90'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer'
            }`}
            title="Listen to Peco read the story"
          >
            <Volume2 size={14} className={isPecoSpeaking ? 'animate-pulse text-purple-600' : ''} />
            <span>{isPecoSpeaking ? 'Peco is reading...' : 'Read to Me'}</span>
          </button>
        </div>
        <p className="text-base md:text-lg text-slate-800 leading-relaxed font-medium">
          {STORY_TEXT}
        </p>
      </div>

      {/* 2. Existing Visual / Image */}
      <div className="text-6xl md:text-7xl p-5 md:p-6 bg-white rounded-3xl shadow-xs border-2 border-slate-100 flex items-center justify-center gap-4">
        <span>🍦</span>
        <span>😭</span>
      </div>

      {/* 3. Question */}
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-bold text-slate-800">
          {QUESTION_TEXT}
        </h2>
      </div>

      {/* 4. Emotion Choices: Sad / Happy / Angry */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        {CHOICES.map((choice, idx) => {
          const isSelected = selectedChoice?.id === choice.id;
          const isCorrectChoice = isSelected && choice.isCorrect;
          const isWrongChoice = isSelected && !choice.isCorrect;

          return (
            <motion.button
              key={choice.id}
              disabled={isPecoSpeaking || isProcessing || isCompleted}
              onClick={() => handleChoice(choice, idx)}
              animate={wiggleIndex === idx ? { x: [-6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`flex-1 min-w-[110px] py-4 px-3 rounded-2xl text-lg font-bold border-2 transition-all flex flex-col items-center gap-1.5 select-none ${
                isCorrectChoice
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-300/60'
                  : isWrongChoice
                  ? 'border-rose-400 bg-rose-50 text-rose-900'
                  : isPecoSpeaking || isProcessing
                  ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-80'
                  : 'bg-white shadow-xs text-[var(--color-text)] border-slate-100 hover:border-indigo-400 cursor-pointer hover:bg-indigo-50/20'
              }`}
            >
              <span className="text-3xl">{choice.emoji}</span>
              <span className="flex items-center gap-1">
                {choice.label}
                {isCorrectChoice && <CheckCircle2 size={16} className="text-emerald-600" />}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* 5. Fixed-Height Feedback Area */}
      <div className="w-full min-h-[48px] flex items-center justify-center text-center px-3">
        {feedbackMessage ? (
          <p
            className={`text-sm md:text-base font-semibold leading-relaxed ${
              feedbackType === 'correct' ? 'text-emerald-700' : 'text-amber-800'
            }`}
          >
            {feedbackMessage}
          </p>
        ) : isPecoSpeaking ? (
          <p className="text-xs text-purple-600 font-medium animate-pulse">
            🔊 Listen to Peco read the story...
          </p>
        ) : (
          <p className="text-xs text-slate-400 font-medium">
            Tap how you think Riya feels
          </p>
        )}
      </div>
    </div>
  );
};

export default SocialGame;
