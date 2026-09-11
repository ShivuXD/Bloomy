import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import {
  RealWorldMissionItem,
  RealWorldOption,
  ACTIVITY_CHALLENGE_CONFIGS,
  getActivityChallenge,
} from '../../data/realWorldMissionsData';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Award,
} from 'lucide-react';
import Peco from '../Peco/Peco';

interface ActivityChallengeViewProps {
  activityId: string;
  activityTitle: string;
  onFinished: () => void;
  customPecoIntro?: string;
}

type ChallengeStage = 'UNLOCK_TRANSITION' | 'ACTIVE_CHALLENGE' | 'COMPLETED';

export const ActivityChallengeView: React.FC<ActivityChallengeViewProps> = ({
  activityId,
  activityTitle,
  onFinished,
  customPecoIntro,
}) => {
  const {
    onCorrectAnswer,
    completedRealWorldMissionIds,
    recordRealWorldMissionCompletion,
    triggerPecoEvent,
    speak,
    stopSpeaking,
    isPecoSpeaking,
  } = useNurture();

  const config =
    ACTIVITY_CHALLENGE_CONFIGS[activityId] ||
    ACTIVITY_CHALLENGE_CONFIGS['WORD_BUILDER'];

  // Select an uncompleted challenge or cycle to first
  const challenge: RealWorldMissionItem = React.useMemo(() => {
    return getActivityChallenge(activityId, completedRealWorldMissionIds);
  }, [activityId, completedRealWorldMissionIds]);

  const [stage, setStage] = useState<ChallengeStage>('UNLOCK_TRANSITION');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const hasAwardedXpRef = useRef(false);
  const challengeStartTimeRef = useRef<number>(Date.now());

  // Transition announcement when reaching the completion screen
  useEffect(() => {
    if (stage === 'UNLOCK_TRANSITION') {
      const speech =
        customPecoIntro ||
        config.completionPecoMessage ||
        `You've been exploring lots of new words! Now let's see how you can use your word skills in the real world.`;

       triggerPecoEvent('PROUD', speech, 5000);
    }
  }, [stage, config, customPecoIntro, triggerPecoEvent]);

  const handleAcceptChallenge = useCallback(() => {
    stopSpeaking();
    setStage('ACTIVE_CHALLENGE');
    setSelectedOptionId(null);
    setIsCorrect(null);
    setFeedbackText('');
    setShowHint(false);
    setWrongTries(0);
    challengeStartTimeRef.current = Date.now();

    const introSpeech = `Here is your challenge: "${challenge.title}"! ${challenge.scenario} ${challenge.challenge}`;
    triggerPecoEvent('NORMAL_STATE', introSpeech, 4000);
  }, [challenge, stopSpeaking, triggerPecoEvent]);

  const handleAskHint = useCallback(() => {
  setShowHint(true);
  triggerPecoEvent('SHOW_HINT', challenge.hint, 5000);
}, [challenge, triggerPecoEvent]);

  const handleOptionClick = async (option: RealWorldOption) => {
    if (isCorrect === true) return;
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setIsCorrect(true);
      setFeedbackText(option.feedback);

      // Award XP once
      if (!hasAwardedXpRef.current) {
        hasAwardedXpRef.current = true;
        recordRealWorldMissionCompletion(challenge.id, challenge.xpReward || 20);
      }

      triggerPecoEvent('CORRECT_ANSWER', challenge.pecoCheer);

// Report telemetry in the background.
// The child-facing interaction should not wait for the ML backend.
const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;

void onCorrectAnswer(
  {
    accuracy,
    reaction_time: Date.now() - challengeStartTimeRef.current,
    hesitation_count: 0,
    retries: wrongTries,
  },
  activityId
).catch((error) => {
  console.error('Failed to submit challenge telemetry:', error);
});

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      setIsCorrect(false);
      setFeedbackText(option.feedback);
      setWiggleId(option.id);
      setWrongTries((prev) => prev + 1);
      triggerPecoEvent('WRONG_ANSWER', option.feedback);
      setTimeout(() => setWiggleId(null), 600);
    }
  };

  const handleHearScenario = () => {
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(`${challenge.scenario} ${challenge.challenge}`, 'talking', { force: true });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* 1. TRANSITION: ACTIVITY COMPLETE & CHALLENGE UNLOCKED    */}
        {/* ======================================================== */}
        {stage === 'UNLOCK_TRANSITION' && (
          <motion.div
            key="unlock-transition"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-slate-100"
          >
            {/* Top Celebration Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs md:text-sm font-black uppercase tracking-wider mb-4">
              <Sparkles size={16} />
              🎉 {activityTitle.toUpperCase()} COMPLETE!
            </div>

            {/* Peco Companion Avatar & Speech */}
            <div className="my-2">
              <Peco size="sm" interactive={false} />
            </div>

            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 my-4 max-w-md">
              <p className="text-slate-800 font-semibold text-sm md:text-base">
                "{customPecoIntro || config.completionPecoMessage}"
              </p>
            </div>

            {/* Real-World Challenge Unlocked Card */}
            <div className="w-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300 my-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
                <Trophy size={14} /> 🌎 REAL-WORLD CHALLENGE UNLOCKED
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {challenge.title}
              </h2>

              <p className="text-amber-100 text-sm md:text-base mt-2 max-w-md mx-auto">
                {challenge.scenario}
              </p>

              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-black/15 rounded-xl text-xs font-bold text-amber-100">
                <span>Skill: {challenge.skill}</span>
                <span>•</span>
                <span>Reward: +{challenge.xpReward || 20} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-5">
              <button
                onClick={handleAcceptChallenge}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 transition-transform"
              >
                <span>Accept Challenge</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={onFinished}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-colors"
              >
                Back to Quests
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* 2. ACTIVE CHALLENGE                                      */}
        {/* ======================================================== */}
        {stage === 'ACTIVE_CHALLENGE' && (
          <motion.div
            key="active-challenge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center w-full"
          >
            {/* Challenge Header */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} />
                Real-World Challenge: {challenge.title}
              </span>

              <button
                onClick={handleHearScenario}
                className={`px-3 py-1.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-colors ${
                  isPecoSpeaking
                    ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                    : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                }`}
                title="Hear challenge read aloud"
              >
                <Volume2 size={14} />
                <span>{isPecoSpeaking ? 'Reading...' : 'Read Aloud'}</span>
              </button>
            </div>

            {/* Scenario Card */}
            <div className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-4 text-left relative">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl shrink-0">
                  {challenge.badgeIcon || '🌟'}
                </div>

                <div className="flex-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Everyday Situation
                  </span>
                  <p className="text-slate-800 font-medium text-sm md:text-base mt-1">
                    {challenge.scenario}
                  </p>
                  <p className="text-[var(--color-text)] font-extrabold text-base md:text-lg mt-2">
                    {challenge.challenge}
                  </p>
                </div>
              </div>
            </div>

            {/* Hint Button & Hint Display */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Choose the best answer:
              </p>

              <button
                onClick={handleAskHint}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Lightbulb size={14} />
                <span>Ask Peco for a Hint</span>
              </button>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mb-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-left text-xs md:text-sm text-indigo-900 flex items-start gap-2"
                >
                  <Lightbulb size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peco's Hint: </span>
                    <span>{challenge.hint}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options List */}
            <div className="flex flex-col gap-3 w-full">
              {challenge.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isThisCorrect = isSelected && isCorrect === true;
                const isThisIncorrect = isSelected && isCorrect === false;

                return (
                  <motion.button
                    key={opt.id}
                    disabled={isCorrect === true}
                    onClick={() => handleOptionClick(opt)}
                    animate={wiggleId === opt.id ? { x: [-8, 8, -6, 6, 0] } : {}}
                    whileHover={!isCorrect ? { scale: 1.015 } : {}}
                    whileTap={!isCorrect ? { scale: 0.985 } : {}}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all shadow-xs ${
                      isThisCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-200'
                        : isThisIncorrect
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/20 text-[var(--color-text)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isThisCorrect
                            ? 'bg-emerald-600 text-white'
                            : isThisIncorrect
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="font-bold text-sm md:text-base leading-snug">
                        {opt.text}
                      </span>
                    </div>

                    {isThisCorrect && (
                      <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanatory Feedback Banner */}
            <AnimatePresence>
              {feedbackText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`w-full mt-4 p-4 rounded-2xl border text-sm md:text-base font-medium text-left ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0">{isCorrect ? '🌟' : '💡'}</span>
                    <div className="flex-1">
                      <p className="font-bold">{isCorrect ? 'Spot On!' : 'Let\'s think about it:'}</p>
                      <p className="mt-0.5">{feedbackText}</p>
                      {isCorrect && challenge.learningPoint && (
                        <p className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-100/60 p-2 rounded-xl">
                          ✨ Learning Point: {challenge.learningPoint}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Finish & Continue Button (Appears on Correct Answer) */}
            {isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
              >
                <button
                  onClick={onFinished}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 transition-transform"
                >
                  <Award size={20} />
                  <span>Challenge Complete! Return to Quests</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};