import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import {
  REAL_WORLD_MISSIONS,
  PRACTICED_SKILLS,
  RealWorldMissionItem,
  RealWorldOption,
} from '../../data/realWorldMissionsData';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  Compass,
  Star,
  ShieldCheck,
  Check,
  Award,
} from 'lucide-react';

type MissionStage = 'INTRODUCTION' | 'ACTIVE_MISSION' | 'COMPLETION';
type AnswerState = 'UNANSWERED' | 'CORRECT' | 'INCORRECT';

const STORAGE_KEY = 'nurture_real_world_progress_v1';

interface SavedProgress {
  completedIds: string[];
  totalXp: number;
}

const RealWorldMission: React.FC = () => {
  const {
    onCorrectAnswer,
    activeRealWorldMission,
    recordRealWorldMissionCompletion,
    isRealWorldMissionUnlocked,
    realWorldChallenge,
    setCurrentScreen,
    onActivityComplete,
    triggerPecoEvent,
    accessibilitySettings,
    speak,
    stopSpeaking,
    isPecoSpeaking,
  } = useNurture();

  // Load persistent progress from storage
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedProgress = JSON.parse(saved);
        return Array.isArray(parsed.completedIds) ? parsed.completedIds : [];
      }
    } catch {}
    return [];
  });

  const [sessionXp, setSessionXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedProgress = JSON.parse(saved);
        return typeof parsed.totalXp === 'number' ? parsed.totalXp : 0;
      }
    } catch {}
    return 0;
  });

  const [stage, setStage] = useState<MissionStage>('INTRODUCTION');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answerState, setAnswerState] = useState<AnswerState>('UNANSWERED');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isHintVisible, setIsHintVisible] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [wiggleOptionId, setWiggleOptionId] = useState<string | null>(null);
  const [wrongTries, setWrongTries] = useState<number>(0);

  const missionStartTimeRef = useRef<number>(Date.now());

  // Dynamic contextual mission playlist: active contextual mission first!
  const missionPlaylist = useMemo(() => {
    if (!activeRealWorldMission) return REAL_WORLD_MISSIONS;
    const others = REAL_WORLD_MISSIONS.filter((m) => m.id !== activeRealWorldMission.id);
    return [activeRealWorldMission, ...others];
  }, [activeRealWorldMission]);

  const currentMission: RealWorldMissionItem =
    missionPlaylist[currentStepIndex] || missionPlaylist[0];

  // Stop audio playback when unmounting component
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Save progress safely whenever it updates
  useEffect(() => {
    try {
      const payload: SavedProgress = {
        completedIds: completedMissions,
        totalXp: sessionXp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [completedMissions, sessionXp]);

  // Introduction welcome speech on mount
  useEffect(() => {
    if (stage === 'INTRODUCTION') {
      const introMessage = activeRealWorldMission
        ? `You completed your practice! Ready for your contextual real-world challenge: "${activeRealWorldMission.title}"?`
        : realWorldChallenge
        ? `Great job! Ready for your real-world practice: "${realWorldChallenge.title}"?`
        : "Hey! Ready for a real-world challenge? Let's see what you can do!";

      triggerPecoEvent('PROUD', introMessage, 4000);
    }
  }, [stage, activeRealWorldMission, realWorldChallenge]);

  // 1. PRIMARY FIX: "I Accept the Real-Time Challenge" handler
  const handleAcceptChallenge = useCallback(() => {
    stopSpeaking();

    // Transition state from INTRODUCTION to ACTIVE_MISSION immediately
    setStage('ACTIVE_MISSION');
    setCurrentStepIndex(0);
    setAnswerState('UNANSWERED');
    setSelectedOptionId(null);
    setIsHintVisible(false);
    setIsProcessingAction(false);
    setWrongTries(0);
    missionStartTimeRef.current = Date.now();

    const startSpeech = `Here is your mission: ${currentMission.title}! Take your time, read the situation, and choose what feels right.`;
    triggerPecoEvent('NORMAL_STATE', startSpeech, 4000);
  }, [currentMission, stopSpeaking, triggerPecoEvent]);

  // Move to the next mission step
  const handleNextMission = () => {
    if (isProcessingAction) return;
    setIsProcessingAction(true);
    stopSpeaking();

    if (currentStepIndex + 1 < missionPlaylist.length) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setAnswerState('UNANSWERED');
      setSelectedOptionId(null);
      setIsHintVisible(false);
      setWrongTries(0);
      missionStartTimeRef.current = Date.now();

      const nextMission = missionPlaylist[nextIndex];
      const stepPrompt =
  `Here's your next mission: ${nextMission.title}! ${nextMission.scenario} ${nextMission.challenge}`;
  triggerPecoEvent('NORMAL_STATE', stepPrompt, 5000);
    } else {
      // All missions in playlist completed!
      setStage('COMPLETION');
      const bonusXp = 50;
      setSessionXp((prev) => prev + bonusXp);

      const completionMessage =
        "You did it! You completed today's Real World Mission! You practiced wonderful everyday skills.";
      triggerPecoEvent('LEVEL_COMPLETE', completionMessage, 6000);

      onActivityComplete('REAL_WORLD_MISSION');

      if (!accessibilitySettings.lowSensoryMode) {
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }

    setTimeout(() => {
      setIsProcessingAction(false);
    }, 300);
  };

  // Option selection logic
  const handleSelectOption = async (option: RealWorldOption) => {
    if (answerState === 'CORRECT' || isProcessingAction) return;

    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setAnswerState('CORRECT');

      // Record completion in local state and in NurtureContext
      if (!completedMissions.includes(currentMission.id)) {
        setCompletedMissions((prev) => [...prev, currentMission.id]);
        setSessionXp((prev) => prev + currentMission.xpReward);
      }
      recordRealWorldMissionCompletion(currentMission.id, currentMission.xpReward);

      triggerPecoEvent('CORRECT_ANSWER', currentMission.pecoCheer, 4500);

      // Report telemetry back to the AI model.
      // NOTE: using a fixed 'REAL_WORLD_MISSION' activity ID since this flow
      // isn't tied to one specific game. Confirm the skill tags added to
      // ACTIVITY_SKILL_TAGS in HolisticMap.tsx match what PRACTICED_SKILLS /
      // currentMission.skill actually represent in realWorldMissionsData.ts.
      const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;
      await onCorrectAnswer(
        {
          accuracy,
          reaction_time: Date.now() - missionStartTimeRef.current,
          hesitation_count: 0,
          retries: wrongTries,
        },
        'REAL_WORLD_MISSION'
      );

      // Trigger celebratory confetti if low-sensory mode is off
      if (!accessibilitySettings.lowSensoryMode) {
        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.65 },
          });
        } catch {}
      }
    } else {
      setAnswerState('INCORRECT');
      setWiggleOptionId(option.id);
      setWrongTries((prev) => prev + 1);

      const feedbackToSpeak = `${option.feedback} That's okay! Let's think about what might work better in this situation.`;
      triggerPecoEvent('WRONG_ANSWER', feedbackToSpeak, 5000);

      setTimeout(() => {
        setWiggleOptionId(null);
      }, 600);
    }
  };

  // Supportive "Try Again"
  const handleTryAgain = () => {
    stopSpeaking();
    setAnswerState('UNANSWERED');
    setSelectedOptionId(null);
    setWiggleOptionId(null);

    const retryMessage = "Take your time! Let's look at the situation together.";
    triggerPecoEvent('ENCOURAGING', retryMessage, 3000);
  };

  // Hint handling
  const handleAskHint = () => {
  setIsHintVisible(true);
  triggerPecoEvent('SHOW_HINT', currentMission.hint, 5000);
};

  // Audio narrator for scenario
  const handleReadScenarioAloud = () => {
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      const fullTextToRead = `Scenario: ${currentMission.scenario}. Challenge: ${currentMission.challenge}`;
      speak(fullTextToRead, 'talking', { force: true });
    }
  };

  // Reset missions to replay
  const handleReplayAll = () => {
    stopSpeaking();
    setStage('ACTIVE_MISSION');
    setCurrentStepIndex(0);
    setAnswerState('UNANSWERED');
    setSelectedOptionId(null);
    setIsHintVisible(false);
    setWrongTries(0);
    missionStartTimeRef.current = Date.now();

    const restartMsg = "Let's practice again! Repetition helps our confidence shine.";
    triggerPecoEvent('NORMAL_STATE', restartMsg, 3500);
  };

  // Return back to daily quests / main app
  const handleFinishAndReturn = () => {
    stopSpeaking();
    setCurrentScreen('DAILY_QUEST');
  };

  // -------------------------------------------------------------
  // RENDER 1: INTRODUCTION SCREEN (Contextual Mission Unlocked)
  // -------------------------------------------------------------
  if (stage === 'INTRODUCTION') {
    return (
      <div id="real-world-mission-intro" className="w-full max-w-xl mx-auto py-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-amber-300 relative overflow-hidden text-center"
        >
          {/* Subtle background trophy watermark */}
          <div className="absolute -top-6 -right-6 text-amber-100/60 pointer-events-none select-none">
            <Trophy size={140} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Mission Hero Badge */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-100 via-orange-50 to-amber-200 text-amber-600 border-2 border-amber-300 flex items-center justify-center mb-4 shadow-sm text-4xl">
              <span>{currentMission.badgeIcon || '🌟'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-600" />
              <span>Real-World Application Unlocked!</span>
            </div>

            <h1
              id="intro-mission-title"
              className="text-2xl md:text-3xl font-black text-slate-800 mb-2 leading-tight"
            >
              {currentMission.title}
            </h1>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold mb-4 border border-indigo-100">
              <span>Practiced Skill:</span>
              <span className="font-extrabold text-indigo-900">{currentMission.skill}</span>
            </div>

            <div className="w-full p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 text-sm md:text-base font-medium leading-relaxed mb-6 text-left">
              <span className="font-extrabold text-amber-900 block mb-1 text-xs uppercase tracking-wider">
                Real-Life Situation:
              </span>
              "{currentMission.scenario}"
            </div>

            {/* Quick Meta Info */}
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-xs text-slate-700 font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>Contextual Challenge</span>
              </span>
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                +{currentMission.xpReward} XP Reward
              </span>
            </div>

            {/* PRIMARY CTA: "I Accept the Real-Time Challenge" */}
            <button
              id="btn-accept-real-time-challenge"
              onClick={handleAcceptChallenge}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-lg md:text-xl font-black rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-amber-300 mb-3"
            >
              <Sparkles size={20} />
              <span>I Accept the Real-Time Challenge</span>
              <ArrowRight size={20} />
            </button>

            {/* Secondary: Postpone / Return to Quests */}
            <button
              id="btn-postpone-challenge"
              onClick={handleFinishAndReturn}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Save for later (Back to Daily Quests)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: COMPLETION SCREEN
  // -------------------------------------------------------------
  if (stage === 'COMPLETION') {
    return (
      <div id="real-world-mission-completion" className="w-full max-w-xl mx-auto py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-emerald-200 text-center relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Trophy size={44} className="text-emerald-500" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>Mission Accomplished</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            REAL WORLD MISSION COMPLETE!
          </h2>

          <p className="text-slate-600 text-sm md:text-base mb-6">
            You completed all 6 real-world challenges! Peco is super proud of your thoughtful
            decisions and everyday social bravery.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Missions Done
              </div>
              <div className="text-2xl font-black text-emerald-900">
                {REAL_WORLD_MISSIONS.length} / {REAL_WORLD_MISSIONS.length}
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                Total XP Earned
              </div>
              <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <span>+{sessionXp} XP</span>
              </div>
            </div>
          </div>

          {/* Skills Practiced Checklist */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Skills Practiced Today</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRACTICED_SKILLS.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="btn-return-daily-quest"
              onClick={handleFinishAndReturn}
              className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Quests</span>
              <ArrowRight size={18} />
            </button>

            <button
              id="btn-replay-missions"
              onClick={handleReplayAll}
              className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 3: ACTIVE MISSION SCREEN
  // -------------------------------------------------------------
  const isCorrect = answerState === 'CORRECT';
  const isIncorrect = answerState === 'INCORRECT';

  return (
    <div id="real-world-mission-active" className="w-full max-w-xl mx-auto py-1">
      {/* Top Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentMission.badgeIcon}</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                🎯 Challenge {currentStepIndex + 1} of {missionPlaylist.length}
              </span>
              <h2 className="text-sm md:text-base font-bold text-slate-800">
                {currentMission.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span>+{currentMission.xpReward} XP</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStepIndex + (isCorrect ? 1 : 0)) / missionPlaylist.length) * 100}%`,
            }}
            transition={{ duration: 0.35 }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between mt-2 px-1">
          {missionPlaylist.slice(0, 6).map((m, idx) => {
            const isDone = completedMissions.includes(m.id) || idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={m.id}
                className="flex items-center gap-1"
                title={`Challenge ${idx + 1}: ${m.title}`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isDone
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-amber-500 ring-2 ring-amber-200'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Mission Scenario Card */}
      <motion.div
        key={currentMission.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-4"
      >
        {/* Scenario Header with Read Aloud */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md mb-2">
              {currentMission.skill}
            </span>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-slate-800 text-sm md:text-base font-medium leading-relaxed">
              <span className="font-bold text-amber-900 block mb-1">Scenario:</span>
              "{currentMission.scenario}"
            </div>
          </div>

          <button
            id="btn-read-scenario-aloud"
            onClick={handleReadScenarioAloud}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
              isPecoSpeaking
                ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Hear Peco read this mission"
            aria-label="Hear scenario read aloud with Peco's voice"
          >
            <Volume2 size={18} />
          </button>
        </div>

        {/* Challenge prompt */}
        <div className="mb-4">
          <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <HelpCircle size={18} className="text-amber-500" />
            <span>{currentMission.challenge}</span>
          </h3>
        </div>

        {/* Interactive Options A, B, C, D */}
        <div className="space-y-2.5 mb-5" role="radiogroup" aria-label={currentMission.challenge}>
          {currentMission.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isWiggling = wiggleOptionId === option.id;

            let optionClasses =
              'w-full p-3.5 rounded-2xl border-2 text-left font-medium text-sm md:text-base transition-all flex items-start gap-3 cursor-pointer ';

            if (isCorrect && option.isCorrect) {
              optionClasses +=
                'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200';
            } else if (isSelected && isIncorrect) {
              optionClasses +=
                'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200';
            } else if (isSelected) {
              optionClasses +=
                'bg-indigo-50 border-indigo-400 text-indigo-950';
            } else {
              optionClasses +=
                'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-white hover:border-amber-300 active:scale-99';
            }

            return (
              <motion.button
                key={option.id}
                id={`option-btn-${option.id}`}
                onClick={() => handleSelectOption(option)}
                disabled={isCorrect}
                animate={isWiggling ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.45 }}
                className={optionClasses}
              >
                {/* Letter pill */}
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCorrect && option.isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isSelected && isIncorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {isCorrect && option.isCorrect ? <Check size={14} strokeWidth={3} /> : option.id}
                </span>

                <span className="flex-1 pt-0.5 leading-snug">{option.text}</span>
              </motion.button>
            );
          })}
        </div>

        {/* FEEDBACK CALLOUT: Correct Answer */}
        <AnimatePresence>
          {isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-black text-emerald-950 text-sm mb-1">
                    MISSION COMPLETE ✓
                  </div>
                  <p className="text-emerald-900 text-xs md:text-sm mb-2 leading-relaxed">
                    {currentMission.pecoCheer}
                  </p>
                  <div className="bg-white/80 rounded-xl p-2.5 text-xs text-emerald-800 font-medium border border-emerald-100">
                    <span className="font-bold">Key Takeaway:</span> {currentMission.learningPoint}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* FEEDBACK CALLOUT: Incorrect Answer (Supportive & Non-punitive) */}
          {isIncorrect && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                  <HelpCircle size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-black text-amber-950 text-sm mb-1">
                    Not quite!
                  </div>
                  <p className="text-amber-900 text-xs md:text-sm leading-relaxed mb-3">
                    {currentMission.options.find((o) => o.id === selectedOptionId)?.feedback ||
                      "Let's think about what might work better in this situation."}
                  </p>
                  <button
                    id="btn-try-again"
                    onClick={handleTryAgain}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* HINT CALLOUT */}
          {isHintVisible && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-3.5 mb-4 text-xs md:text-sm text-indigo-900"
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-950 block mb-0.5">Peco's Hint:</span>
                  <p>{currentMission.hint}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions: Hint Button & Next Mission Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {!isCorrect ? (
            <button
              id="btn-ask-peco-hint"
              onClick={handleAskHint}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isHintVisible
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
              }`}
            >
              <Lightbulb size={14} className="text-indigo-600" />
              <span>{isHintVisible ? 'Hint Displayed' : '💡 Ask Peco for a Hint'}</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>Great Job!</span>
            </div>
          )}

          {isCorrect && (
            <button
              id="btn-next-mission"
              onClick={handleNextMission}
              disabled={isProcessingAction}
              className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs md:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>
                {currentStepIndex + 1 < REAL_WORLD_MISSIONS.length
                  ? 'Next Mission'
                  : 'View Results'}
              </span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RealWorldMission;