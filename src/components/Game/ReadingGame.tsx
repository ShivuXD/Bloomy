import React, { useState, useEffect, useCallback } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion } from 'framer-motion';
import { Volume2, CheckCircle2, AlertCircle } from 'lucide-react';
import { prepareAudioPlayback } from '../../services/inworldService';

export interface PhonicsChoice {
  id: string;
  word: string;
  isCorrect: boolean;
}

export interface PhonicsQuestionData {
  id: string;
  instruction: string;
  questionDisplay: string;
  questionSpeech: string;
  fullDisplay: string;
  fullSpeech: string;
  targetSoundDisplay: string;
  targetSoundSpeech: string;
  choices: PhonicsChoice[];
}

/**
 * Phonics Sound Match Question Model:
 * Explicit separation between Display Text (showing "B")
 * and Speech Text (spoken naturally as "B" by Peco, never "B slash").
 */
const PHONICS_QUESTION: PhonicsQuestionData = {
  id: 'phonics-sound-match-b',
  instruction: 'Listen carefully and choose the sound you hear.',
  questionDisplay: 'Which word starts with B?',
  questionSpeech: 'Which word starts with B?',
  fullDisplay: 'Listen carefully and choose the sound you hear. Which word starts with B?',
  fullSpeech: 'Listen carefully and choose the sound you hear. Which word starts with B?',
  targetSoundDisplay: 'B',
  targetSoundSpeech: 'B',
  choices: [
    { id: 'opt-bear', word: 'Bear', isCorrect: true },
    { id: 'opt-dog', word: 'Dog', isCorrect: false },
    { id: 'opt-cat', word: 'Cat', isCorrect: false },
  ],
};

const ReadingGame: React.FC = () => {
  const {
    onCorrectAnswer,
    onIncorrectAnswer,
    onHintNeeded,
    setCurrentMission,
    speak,
    isPecoSpeaking,
    isPecoLoadingAudio,
  } = useNurture();

  const [startTime] = useState(() => Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // STABLE OPTIONS: Initialized once so buttons NEVER reorder or jump across renders
  const [choices] = useState<PhonicsChoice[]>(() => PHONICS_QUESTION.choices);

  // Gentle hesitation hint throttle
  useEffect(() => {
    const timer = setTimeout(() => {
      setHesitationCount((prev) => prev + 1);
      onHintNeeded('READING');
    }, 12000);
    return () => clearTimeout(timer);
  }, [onHintNeeded]);

  // Replay question audio using Peco's Inworld voice with clean speech text (never browser TTS)
  const handleReplayQuestion = useCallback(() => {
    prepareAudioPlayback();
    speak(PHONICS_QUESTION.fullSpeech, 'thinking', {
      priority: 'high',
      force: true,
      displayText: PHONICS_QUESTION.fullDisplay,
      speechText: PHONICS_QUESTION.fullSpeech,
    });
  }, [speak]);

  const handleChoice = async (choice: PhonicsChoice) => {
    if (isAnswered) return;

    setSelectedId(choice.id);

    if (choice.isCorrect) {
      setIsAnswered(true);
      setFeedbackMessage('Great job! Bear starts with the sound B!');
      const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;

      await onCorrectAnswer({
        accuracy,
        reaction_time: Date.now() - startTime,
        hesitation_count: hesitationCount,
        retries: wrongTries,
        }, 'READING');

      // Smooth progression to next activity
      setTimeout(() => {
        setCurrentMission('SOCIAL');
      }, 1800);
    } else {
      const newWrongs = wrongTries + 1;
      setWrongTries(newWrongs);
      setWiggleId(choice.id);
      setFeedbackMessage('Almost! Listen for the sound B and try again.');

      onIncorrectAnswer(newWrongs);

      // Reset wiggle after brief tactile feedback; keep buttons stationary
      setTimeout(() => {
        setWiggleId(null);
        setSelectedId(null);
      }, 500);
    }
  };

  return (
    <div
      id="phonics-sound-match-card"
      className="w-full max-w-md mx-auto flex flex-col items-stretch"
    >
      {/* ========================================
          QUESTION AREA: Fixed / Stable Container
          ======================================== */}
      <div
        id="phonics-question-area"
        className="w-full min-h-[116px] bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-xs flex flex-col justify-between mb-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {PHONICS_QUESTION.instruction}
          </span>
          {/* Replay audio with Peco voice */}
          <button
            id="replay-phonics-sound-button"
            type="button"
            onClick={handleReplayQuestion}
            disabled={isPecoLoadingAudio}
            className={`shrink-0 p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold ${
              isPecoSpeaking
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
            title="Listen to question again"
            aria-label="Listen to question again"
          >
            <Volume2
              size={17}
              className={isPecoSpeaking ? 'animate-pulse text-purple-600' : ''}
            />
            <span className="hidden sm:inline">
              {isPecoSpeaking ? 'Playing...' : 'Listen'}
            </span>
          </button>
        </div>

        {/* Visual Question: B shown cleanly without slashes */}
        <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-snug mt-1">
          Which word starts with{' '}
          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
            {PHONICS_QUESTION.targetSoundDisplay}
          </span>
          ?
        </h2>
      </div>

      {/* ========================================
          ANSWER AREA: Completely Stable Positions
          Bear, Dog, Cat in fixed layout
          ======================================== */}
      <div
        id="phonics-answer-area"
        className="flex flex-col gap-3 w-full"
      >
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const isCorrect = isSelected && choice.isCorrect;
          const isIncorrect = isSelected && !choice.isCorrect;

          return (
            <motion.button
              id={`choice-${choice.id}`}
              key={choice.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleChoice(choice)}
              animate={wiggleId === choice.id ? { x: [-6, 6, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={`w-full h-16 px-6 bg-white shadow-xs rounded-2xl text-xl font-bold border-2 transition-colors cursor-pointer flex items-center justify-between text-left select-none ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                  : isIncorrect
                  ? 'border-rose-400 bg-rose-50 text-rose-900'
                  : 'border-slate-100 hover:border-indigo-400 text-slate-800 hover:bg-indigo-50/20'
              }`}
            >
              <span className="text-lg md:text-xl font-bold">{choice.word}</span>
              {isCorrect && (
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              )}
              {isIncorrect && (
                <AlertCircle size={22} className="text-rose-500 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ========================================
          FEEDBACK AREA: Pre-reserved space
          Prevents layout jumping when feedback appears
          ======================================== */}
      <div
        id="phonics-feedback-area"
        className="w-full min-h-[50px] mt-3 flex items-center justify-center text-center px-2"
      >
        {feedbackMessage ? (
          <p
            className={`text-sm md:text-base font-semibold transition-opacity duration-200 ${
              isAnswered ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {feedbackMessage}
          </p>
        ) : (
          <span className="text-xs text-slate-400">
            Choose the word that starts with the sound
          </span>
        )}
      </div>
    </div>
  );
};

export default ReadingGame;
