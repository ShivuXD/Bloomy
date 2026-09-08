import React, { useState, useEffect, useRef } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { prepareAudioPlayback } from '../../services/inworldService';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Star,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Volume2,
  Award,
  ArrowRight,
  RotateCcw,
  Search,
} from 'lucide-react';
import Peco from '../Peco/Peco';

const REQUIRED_BLUE_STARS = 5;

type RocketStage =
  | 'PLAYING'
  | 'ROCKET_FOCUS_COMPLETION'
  | 'CHALLENGE_ACTIVE'
  | 'CHALLENGE_COMPLETE';

const RocketFocus: React.FC = () => {
  const {
  onCorrectAnswer,
  onIncorrectAnswer,
  speak,
  stopSpeaking,
  isPecoSpeaking,
  setCurrentScreen,
  setDailyMissions,
  completeGameActivity,
  recordRealWorldMissionCompletion,
} = useNurture();

  // Core Rocket Focus Game State
  const [stage, setStage] = useState<RocketStage>('PLAYING');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [stars, setStars] = useState<{ id: number; isBlue: boolean; x: number; y: number }[]>([]);
  const [wiggleId, setWiggleId] = useState<number | null>(null);
  const [wrongTries, setWrongTries] = useState(0);

  // Real-World Challenge State
  const [showHint, setShowHint] = useState(false);
  const [isProcessingChallenge, setIsProcessingChallenge] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Guard refs to guarantee idempotency and single rewards
  const startTimeRef = useRef<number>(Date.now());
  const hasAwardedRocketXpRef = useRef(false);
  const hasAwardedChallengeXpRef = useRef(false);
  const hasStartedChallengeIntroRef = useRef(false);

  useEffect(() => {
    generateStars();
  }, []);

  // Timer for Rocket Focus activity
  useEffect(() => {
    if (stage !== 'PLAYING') return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // If time runs out before reaching required stars, reset timer to keep task encouraging
      setTimeLeft(20);
    }
  }, [timeLeft, stage]);

  const generateStars = () => {
    const newStars = Array.from({ length: 4 })
      .map((_, i) => ({
        id: Math.random(),
        isBlue: i === 0, // Only 1 blue star per round
        x: Math.random() * 80,
        y: Math.random() * 80,
      }))
      .sort(() => Math.random() - 0.5);
    setStars(newStars);
  };

  const handleTap = async (star: { id: number; isBlue: boolean }) => {
    if (stage !== 'PLAYING') return;

    if (star.isBlue) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= REQUIRED_BLUE_STARS) {
        // ALL REQUIRED BLUE STARS FOUND!
        setStage('ROCKET_FOCUS_COMPLETION');

        // 1. Mark Rocket Focus as completed in Daily Missions
        setDailyMissions((prev) =>
          prev.map((m) => (m.id === 'ROCKET_FOCUS' ? { ...m, completed: true } : m))
        );

        // 2. Award existing Rocket Focus XP exactly once
       // 2. Award existing Rocket Focus XP exactly once
        if (!hasAwardedRocketXpRef.current) {
          hasAwardedRocketXpRef.current = true;
          const accuracy = Math.max(70, Math.round((1 - wrongTries / (wrongTries + REQUIRED_BLUE_STARS)) * 100));
          await onCorrectAnswer({
            accuracy,
            reaction_time: Date.now() - startTimeRef.current,
            hesitation_count: 0,
            retries: wrongTries,
          }, 'ROCKET_FOCUS');
        }

        // 3. Peco speaks completion feedback using existing Inworld voice
        prepareAudioPlayback();
        const completionSpeech = "Stellar focus! You caught all the blue stars!";
        try {
          await speak(completionSpeech, 'celebrating', {
            priority: 'high',
            force: true,
          });
        } catch (err) {
          console.warn('Peco completion speech issue:', err);
        }

        // 4. Once Peco finishes speaking, unlock and transition to Real-World Challenge
        setStage('CHALLENGE_ACTIVE');
      } else {
        generateStars();
      }
    } else {
      // Tapped yellow star (distractor)
      setWiggleId(star.id);
      setWrongTries((prev) => prev + 1);
      onIncorrectAnswer();
      setTimeout(() => setWiggleId(null), 500);
    }
  };

  // Automatically introduce the Focus Finder Challenge when entering CHALLENGE_ACTIVE
  useEffect(() => {
    if (stage === 'CHALLENGE_ACTIVE' && !hasStartedChallengeIntroRef.current) {
      hasStartedChallengeIntroRef.current = true;
      prepareAudioPlayback();

      const introSpeech =
        "You did a great job finding all the blue stars! Now let's use those focus skills in the real world. Look around your room and find 3 things that are blue.";

      speak(introSpeech, 'happy', {
        priority: 'high',
        force: true,
      }).catch((err) => {
        console.warn('Peco challenge intro speech issue:', err);
      });
    }
  }, [stage, speak]);

  const handleAskHint = async () => {
    if (isPecoSpeaking || isProcessingChallenge) return;
    setShowHint(true);
    prepareAudioPlayback();

    const hintSpeech = "Look carefully at your desk, shelves, toys, or clothes.";
    try {
      await speak(hintSpeech, 'thinking', {
        priority: 'high',
        force: true,
      });
    } catch (err) {
      console.warn('Peco hint speech issue:', err);
    }
  };

  const handleHearTaskAgain = async () => {
    if (isPecoSpeaking || isProcessingChallenge) return;
    prepareAudioPlayback();

    const taskSpeech = "Look around your room and find 3 things that are blue.";
    try {
      await speak(taskSpeech, 'talking', {
        priority: 'high',
        force: true,
      });
    } catch (err) {
      console.warn('Peco read aloud speech issue:', err);
    }
  };

  const handleCompleteChallenge = async () => {
    // Prevent duplicate triggers and enforce idempotency
    if (isProcessingChallenge || hasAwardedChallengeXpRef.current || stage === 'CHALLENGE_COMPLETE') {
      return;
    }

    setIsProcessingChallenge(true);
    prepareAudioPlayback();

    const feedbackText = "Fantastic! You used your eyes and attention to find three blue things.";
    setChallengeFeedback(feedbackText);

    try {
      // Peco says complete positive feedback using Inworld voice
      await speak(feedbackText, 'celebrating', {
        priority: 'high',
        force: true,
      });
    } catch (err) {
      console.warn('Peco challenge feedback speech issue:', err);
    }

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}

    // Award additional Real-World Challenge XP exactly once
    if (!hasAwardedChallengeXpRef.current) {
      hasAwardedChallengeXpRef.current = true;
      recordRealWorldMissionCompletion('rocket-focus-finder-challenge', 25);
    }

    // Transition to the final completed view
    setStage('CHALLENGE_COMPLETE');
    setIsProcessingChallenge(false);
  };

  const handleSkipOrReturn = () => {
    stopSpeaking();
    setCurrentScreen('DAILY_QUEST');
  };

  // =========================================================================
  // 1. CORE ROCKET FOCUS ACTIVITY (Stars Finding Screen)
  // =========================================================================
  if (stage === 'PLAYING') {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Top Activity Header */}
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Star size={18} fill="#3B82F6" className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-800">Rocket Focus</h2>
              <p className="text-xs text-slate-500 font-medium">Tap all the blue stars!</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <span>Goal: {REQUIRED_BLUE_STARS} Stars</span>
          </div>
        </div>

        {/* Existing Canvas Visual Design */}
        <div className="w-full h-96 relative bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-inner">
          <div className="absolute top-4 left-4 text-white font-bold text-xl drop-shadow-sm flex items-center gap-1.5">
            <Star size={20} fill="#3B82F6" className="text-blue-400" />
            <span>Blue Stars: {score} / {REQUIRED_BLUE_STARS}</span>
          </div>
          <div className="absolute top-4 right-4 text-white font-bold text-xl drop-shadow-sm">
            {timeLeft}s
          </div>

          {stars.map((star) => (
            <motion.button
              key={star.id}
              className="absolute p-2 cursor-pointer transition-transform select-none"
              style={{ left: `${star.x}%`, top: `${star.y + 10}%` }}
              onClick={() => handleTap(star)}
              animate={wiggleId === star.id ? { x: [-5, 5, -5, 5, 0] } : {}}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={star.isBlue ? 'Blue Star' : 'Star'}
            >
              <Star
                size={48}
                fill={star.isBlue ? '#3B82F6' : '#FACC15'}
                color={star.isBlue ? '#2563EB' : '#EAB308'}
              />
            </motion.button>
          ))}
        </div>

        {/* Bottom Helper Hint */}
        <p className="text-xs text-slate-400 font-medium">
          Fast eyes ready! Tap only the blue stars and let the yellow ones go.
        </p>
      </div>
    );
  }

  // =========================================================================
  // 2. ROCKET FOCUS COMPLETE TRANSITION (Waiting for Peco completion speech)
  // =========================================================================
  if (stage === 'ROCKET_FOCUS_COMPLETION') {
    return (
      <div className="w-full max-w-lg flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-3xl border-2 border-slate-100 shadow-xs">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs md:text-sm font-black uppercase tracking-wider mb-4">
          <Sparkles size={16} />
          🎉 ROCKET FOCUS COMPLETE!
        </div>

        <div className="my-2">
          <Peco size="sm" interactive={false} />
        </div>

        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 my-4 max-w-md w-full">
          <p className="text-slate-800 font-bold text-base md:text-lg">
            "Stellar focus! You caught all the blue stars!"
          </p>
          {isPecoSpeaking && (
            <p className="text-xs text-blue-600 font-semibold mt-2 animate-pulse flex items-center justify-center gap-1">
              <Volume2 size={14} /> Peco is speaking...
            </p>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium mt-1">
          Unlocking your Real-World Challenge...
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ROCKET FOCUS REAL-WORLD CHALLENGE: FOCUS FINDER CHALLENGE
  // =========================================================================
  if (stage === 'CHALLENGE_ACTIVE') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg flex flex-col items-center gap-4 text-center"
      >
        {/* Challenge Category Badge */}
        <div className="w-full flex items-center justify-between px-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Award size={14} className="text-amber-700" />
            REAL-WORLD CHALLENGE
          </span>

          <button
            type="button"
            onClick={handleHearTaskAgain}
            disabled={isPecoSpeaking || isProcessingChallenge}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
              isPecoSpeaking
                ? 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <Volume2 size={13} />
            <span>{isPecoSpeaking ? 'Peco Speaking...' : 'Read Aloud'}</span>
          </button>
        </div>

        {/* Main Challenge Card */}
        <div className="w-full bg-white rounded-3xl p-5 md:p-6 border-2 border-slate-100 shadow-xs flex flex-col items-center gap-3">
          {/* Challenge Title */}
          <div className="flex items-center gap-2 text-blue-600">
            <Search size={22} className="text-blue-600" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Focus Finder Challenge
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Use your focus skills in the real world!
          </p>

          {/* Task Observation Instruction */}
          <div className="w-full bg-blue-50/70 rounded-2xl p-4 border border-blue-100 my-1 flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Everyday Observation Task
            </span>
            <p className="text-base md:text-lg font-extrabold text-slate-900 leading-snug">
              "Look around your room and find 3 things that are blue."
            </p>
          </div>

          {/* Visual Observation Slots */}
          <div className="grid grid-cols-3 gap-2.5 w-full my-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm mb-1">
                  {num}
                </div>
                <span className="text-xs font-bold text-slate-600">Blue Item</span>
              </div>
            ))}
          </div>

          {/* Hint Area */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs md:text-sm text-amber-900 flex items-start gap-2"
              >
                <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Peco's Hint: </span>
                  <span>Look carefully at your desk, shelves, toys, or clothes.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Peco Speaking Indicator */}
          {isPecoSpeaking && (
            <div className="w-full py-1 text-center">
              <span className="text-xs text-purple-600 font-semibold animate-pulse flex items-center justify-center gap-1.5">
                <Volume2 size={14} /> Listen to Peco...
              </span>
            </div>
          )}

          {/* Primary Action Button: "I Found 3 Things!" */}
          <button
            type="button"
            onClick={handleCompleteChallenge}
            disabled={isPecoSpeaking || isProcessingChallenge}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-sm transition-all flex items-center justify-center gap-2 ${
              isPecoSpeaking || isProcessingChallenge
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white cursor-pointer shadow-md'
            }`}
          >
            <CheckCircle2 size={20} />
            <span>{isProcessingChallenge ? 'Checking with Peco...' : 'I Found 3 Things!'}</span>
          </button>

          {/* Helper Buttons: "Need a Hint?" & "Maybe Later" */}
          <div className="flex items-center justify-between w-full pt-1">
            <button
              type="button"
              onClick={handleAskHint}
              disabled={isPecoSpeaking || isProcessingChallenge}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
            >
              <Lightbulb size={14} />
              <span>Need a Hint?</span>
            </button>

            <button
              type="button"
              onClick={handleSkipOrReturn}
              disabled={isProcessingChallenge}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // 4. CHALLENGE COMPLETE (Celebration & Additional XP)
  // =========================================================================
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-3xl border-2 border-slate-100 shadow-xs gap-4"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
        🎉
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
          Focus Finder Complete!
        </h2>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          Real-World Challenge Mastered
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full max-w-md">
        <p className="text-emerald-950 font-bold text-sm md:text-base leading-relaxed">
          {challengeFeedback || 'Fantastic! You used your eyes and attention to find three blue things.'}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 border border-amber-300 rounded-2xl text-amber-900 text-sm font-black">
        <Sparkles size={16} className="text-amber-700" />
        <span>+25 Real-World Focus XP Earned!</span>
      </div>

      <button
        type="button"
        onClick={handleSkipOrReturn}
        className="w-full py-4 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform mt-2"
      >
        <span>Return to Quests</span>
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
};

export default RocketFocus;
