import React, { useState, useEffect, useRef } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Users, Volume2, CheckCircle2, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { ActivityChallengeView } from './ActivityChallengeView';

interface GreetingScenario {
  id: number;
  location: string;
  badge: string;
  avatarEmoji: string;
  speakerName: string;
  speakerPrompt: string;
  contextTip: string;
  options: {
    id: string;
    text: string;
    actionIcon: string;
    isAppropriate: boolean;
    explanation: string;
  }[];
}

const SCENARIOS: GreetingScenario[] = [
  {
    id: 1,
    location: "Classroom Morning",
    badge: "School Arrival",
    avatarEmoji: "🧑‍🏫",
    speakerName: "Teacher Mr. Davis",
    speakerPrompt: "Good morning! Welcome to class. I hope you had a good breakfast!",
    contextTip: "Mr. Davis is greeting you with a smile as you walk through the doorway.",
    options: [
      {
        id: 'opt-1a',
        actionIcon: '👋',
        text: "Good morning, Mr. Davis! I'm ready to learn.",
        isAppropriate: true,
        explanation: "Terrific! Saying good morning back and looking up acknowledges your teacher kindly.",
      },
      {
        id: 'opt-1b',
        actionIcon: '🙈',
        text: "Stare at the floor and say nothing at all.",
        isAppropriate: false,
        explanation: "It feels easy to look down, but a quiet wave or nod helps people know you noticed them!",
      },
      {
        id: 'opt-1c',
        actionIcon: '🏃',
        text: "Run backwards into the hallway yelling.",
        isAppropriate: false,
        explanation: "Running back might startle others in the hallway. A calm greeting is much safer!",
      },
    ],
  },
  {
    id: 2,
    location: "Playground Swings",
    badge: "Recess & Peers",
    avatarEmoji: "👦",
    speakerName: "Classmate Alex",
    speakerPrompt: "Hey! Do you want to swing with me, or do you want the red swing?",
    contextTip: "Alex is smiling and waving a hand toward the empty swings.",
    options: [
      {
        id: 'opt-2a',
        actionIcon: '😊',
        text: "Hi Alex! Sure, I would love to swing with you!",
        isAppropriate: true,
        explanation: "Wonderful! You answered his greeting and shared your choice warmly.",
      },
      {
        id: 'opt-2b',
        actionIcon: '😠',
        text: "Cross your arms and turn around without answering.",
        isAppropriate: false,
        explanation: "If you don't feel like swinging, you can say 'No thank you, maybe later!' instead.",
      },
      {
        id: 'opt-2c',
        actionIcon: '🥪',
        text: "Say 'I like sandwiches' and walk away.",
        isAppropriate: false,
        explanation: "Sandwiches are tasty, but answering what Alex asked helps keep the conversation going!",
      },
    ],
  },
  {
    id: 3,
    location: "School Exit",
    badge: "End of the Day",
    avatarEmoji: "👧",
    speakerName: "Friend Maya",
    speakerPrompt: "The bell rang! Have a great afternoon! See you tomorrow morning!",
    contextTip: "Maya has her backpack on and is walking toward the bus stop.",
    options: [
      {
        id: 'opt-3a',
        actionIcon: '👋',
        text: "See you tomorrow Maya! Have a fun afternoon!",
        isAppropriate: true,
        explanation: "Perfect farewell! Wishing friends a good afternoon closes the day cheerfully.",
      },
      {
        id: 'opt-3b',
        actionIcon: '☀️',
        text: "Say 'Good morning!'",
        isAppropriate: false,
        explanation: "Since school is ending and the sun is setting, we say 'Good afternoon' or 'See you tomorrow'!",
      },
      {
        id: 'opt-3c',
        actionIcon: '🔇',
        text: "Pretend Maya is invisible and keep walking.",
        isAppropriate: false,
        explanation: "Even a small wave goodbye makes friends feel valued!",
      },
    ],
  },
  {
    id: 4,
    location: "Cafeteria Table",
    badge: "Lunchtime Sharing",
    avatarEmoji: "👧",
    speakerName: "Classmate Lily",
    speakerPrompt: "Hi! Is this empty chair taken, or can I sit here with my lunch tray?",
    contextTip: "Lily is holding her lunch tray and politely asking to join your table.",
    options: [
      {
        id: 'opt-4a',
        actionIcon: '🥪',
        text: "Hi Lily! Sure, please sit here, there is plenty of room!",
        isAppropriate: true,
        explanation: "Warm and inviting! Welcoming classmates to sit together builds great friendships.",
      },
      {
        id: 'opt-4b',
        actionIcon: '🎒',
        text: "Say 'No, this chair is only for my backpack.'",
        isAppropriate: false,
        explanation: "Sharing chairs at lunch makes the cafeteria a friendly place for everyone.",
      },
      {
        id: 'opt-4c',
        actionIcon: '🤐',
        text: "Stare blankly and say nothing at all.",
        isAppropriate: false,
        explanation: "Answering with a friendly yes or no lets Lily know she is heard.",
      },
    ],
  },
  {
    id: 5,
    location: "Art Corner",
    badge: "Sharing Supplies",
    avatarEmoji: "👦",
    speakerName: "Art Partner Sam",
    speakerPrompt: "I'm drawing a rainbow! May I borrow the blue marker after you finish?",
    contextTip: "Sam is waiting politely beside your drawing paper.",
    options: [
      {
        id: 'opt-5a',
        actionIcon: '🎨',
        text: "Of course Sam! I just need one moment, then here you go!",
        isAppropriate: true,
        explanation: "Awesome sharing! Acknowledging their request and handing it over happily feels great.",
      },
      {
        id: 'opt-5b',
        actionIcon: '🙈',
        text: "Hide all the markers inside your desk quickly.",
        isAppropriate: false,
        explanation: "Art supplies in class are meant to be shared by everyone safely.",
      },
      {
        id: 'opt-5c',
        actionIcon: '📢',
        text: "Yell loudly: 'Never ever touch my markers!'",
        isAppropriate: false,
        explanation: "Speaking calmly and taking turns keeps art time fun for everyone.",
      },
    ],
  },
  {
    id: 6,
    location: "Hallway Passage",
    badge: "Polite Moments",
    avatarEmoji: "🧑",
    speakerName: "Student Jordan",
    speakerPrompt: "Oops, pardon me! Our backpacks brushed against each other in the crowd.",
    contextTip: "Jordan stops and looks back with an apologetic smile.",
    options: [
      {
        id: 'opt-6a',
        actionIcon: '🤝',
        text: "No worries at all, Jordan! Have a great day!",
        isAppropriate: true,
        explanation: "Graceful and kind! Saying 'No worries' smooths over everyday hallway bumps easily.",
      },
      {
        id: 'opt-6b',
        actionIcon: '😠',
        text: "Grumble angrily and glare at them.",
        isAppropriate: false,
        explanation: "Accidental bumps happen when hallways are busy. Staying calm is much kinder!",
      },
      {
        id: 'opt-6c',
        actionIcon: '🏃',
        text: "Sprint away without saying a word.",
        isAppropriate: false,
        explanation: "A quick friendly reply lets you both keep walking happily.",
      },
    ],
  },
];

const GreetingMaster: React.FC = () => {
  const {
    onCorrectAnswer,
    completeGameActivity,
    recordExerciseProgress,
    setCurrentScreen,
    triggerPecoEvent,
    speak,
    stopSpeaking,
    isPecoSpeaking,
  } = useNurture();

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);

  const currentScenario = SCENARIOS[scenarioIndex];
  const scenarioStartTimeRef = useRef<number>(Date.now());

  // Stop audio if navigating away
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Reset timer when scenario changes
  useEffect(() => {
    scenarioStartTimeRef.current = Date.now();
  }, [scenarioIndex]);

  const handleSelectOption = async (opt: GreetingScenario['options'][0]) => {
    setSelectedOptionId(opt.id);

    if (opt.isAppropriate) {
      setIsCorrect(true);
      setFeedbackMessage(opt.explanation);
      recordExerciseProgress('GREETING_MASTER');
      triggerPecoEvent('CORRECT_ANSWER', `Spot on! ${opt.explanation}`);

      const accuracy = (1 - wrongTries / (wrongTries + 1)) * 100 || 100;
      await onCorrectAnswer({
        accuracy,
        reaction_time: Date.now() - scenarioStartTimeRef.current,
        hesitation_count: 0,
        retries: wrongTries,
      }, 'GREETING_MASTER');

      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch {}

      setTimeout(() => {
        if (scenarioIndex + 1 < SCENARIOS.length) {
          setScenarioIndex(prev => prev + 1);
          setSelectedOptionId(null);
          setIsCorrect(null);
          setFeedbackMessage('');
          setWrongTries(0);
        } else {
          // Finished all greeting scenarios
          setIsCompleted(true);
          try {
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.55 } });
          } catch {}
        }
      }, 2000);
    } else {
      setIsCorrect(false);
      setFeedbackMessage(opt.explanation);
      setWiggleId(opt.id);
      setWrongTries((prev) => prev + 1);
      triggerPecoEvent('WRONG_ANSWER', `Good effort! ${opt.explanation}`);
      setTimeout(() => setWiggleId(null), 600);
    }
  };

  const handleHearPrompt = () => {
    if (isPecoSpeaking) {
      stopSpeaking();
    } else {
      speak(`${currentScenario.speakerName} says: "${currentScenario.speakerPrompt}"`, 'talking', { force: true });
    }
  };

  if (isCompleted) {
    return (
      <ActivityChallengeView
        activityId="GREETING_MASTER"
        activityTitle="Greeting Master"
        customPecoIntro="You've mastered greeting friends and teachers! Ready to try a real-world communication challenge?"
        onFinished={() => {
          completeGameActivity('asd-comm-3');
          setCurrentScreen('DAILY_QUEST');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Stage Header */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-teal-100 text-teal-800 font-bold rounded-full text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} />
            Scenario {scenarioIndex + 1} of {SCENARIOS.length}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {currentScenario.badge}
          </span>
        </div>

        <button
          onClick={handleHearPrompt}
          className={`px-3 py-1.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-colors ${
            isPecoSpeaking
              ? 'bg-teal-600 text-white border-teal-600 animate-pulse'
              : 'border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-700'
          }`}
          title="Hear scenario read aloud with Peco's voice"
        >
          <Volume2 size={15} />
          <span>{isPecoSpeaking ? 'Reading...' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Social Scene Card */}
      <motion.div
        key={currentScenario.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 mb-5 relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-3xl md:text-4xl shrink-0 shadow-xs">
            {currentScenario.avatarEmoji}
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-[var(--color-text)]">
                {currentScenario.speakerName}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {currentScenario.location}
              </span>
            </div>

            <div className="mt-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 relative text-slate-700 font-medium text-sm md:text-base">
              <span className="text-teal-600 font-bold text-lg leading-none">“</span>
              <span className="mx-1">{currentScenario.speakerPrompt}</span>
              <span className="text-teal-600 font-bold text-lg leading-none">”</span>
            </div>

            <p
              id="greeting-context-tip"
              className="mt-3.5 md:mt-4 text-base md:text-lg font-medium text-slate-600 font-child-friendly leading-relaxed break-words flex items-start gap-2"
            >
              <span className="shrink-0 select-none text-base md:text-lg" aria-hidden="true">💡</span>
              <span className="flex-1 min-w-0">{currentScenario.contextTip}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Prompt Question */}
      <div className="w-full mb-3 text-left px-1">
        <p className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
          Choose the best way to respond:
        </p>
      </div>

      {/* Choice Options List */}
      <div className="flex flex-col gap-3 w-full">
        {currentScenario.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const showSuccessState = isSelected && isCorrect === true;
          const showErrorState = isSelected && isCorrect === false;

          return (
            <motion.button
              key={opt.id}
              disabled={isCorrect === true || isCompleted}
              onClick={() => handleSelectOption(opt)}
              animate={wiggleId === opt.id ? { x: [-8, 8, -6, 6, 0] } : {}}
              whileHover={!isCorrect ? { scale: 1.015 } : {}}
              whileTap={!isCorrect ? { scale: 0.985 } : {}}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all shadow-xs ${
                showSuccessState
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-200'
                  : showErrorState
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'bg-white border-slate-100 hover:border-teal-400 hover:bg-teal-50/30 text-[var(--color-text)]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                {opt.actionIcon}
              </div>

              <div className="flex-1">
                <p className="font-bold text-sm md:text-base leading-snug">
                  {opt.text}
                </p>
              </div>

              {showSuccessState && (
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Explanatory Banner */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`w-full mt-4 p-4 rounded-2xl border text-sm md:text-base font-medium text-left ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{isCorrect ? '🌟' : '💡'}</span>
              <p>{feedbackMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GreetingMaster;