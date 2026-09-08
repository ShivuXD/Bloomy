import React, { useState, useEffect, useRef } from 'react';import { useNurture } from '../../contexts/NurtureContext';
import { motion } from 'framer-motion';

const StopThinkGo: React.FC = () => {
  const { onCorrectAnswer, onIncorrectAnswer, completeGameActivity } = useNurture();
  const [light, setLight] = useState<'RED' | 'GREEN'>('RED');
  const [successes, setSuccesses] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const [wrongTaps, setWrongTaps] = useState(0);
  const greenStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startCycle();
  }, []);

  const startCycle = () => {
    setLight('RED');
    const delay = Math.random() * 2000 + 1500; // 1.5s to 3.5s red light
    setTimeout(() => {
      setLight('GREEN');
      greenStartTimeRef.current = Date.now();
    }, delay);
  };

  const handleTap = async () => {
    if (light === 'GREEN') {
      const newSuccesses = successes + 1;
      setSuccesses(newSuccesses);

      const accuracy = (newSuccesses / (newSuccesses + wrongTaps)) * 100 || 100;
      const reactionTime = Date.now() - greenStartTimeRef.current;

      await onCorrectAnswer({
        accuracy,
        reaction_time: reactionTime,
        hesitation_count: 0,
        retries: wrongTaps,
      }, 'STOP_THINK_GO');

      if (newSuccesses >= 3) {
        endGame();
      } else {
        startCycle();
      }
    } else {
      setWiggle(true);
      setWrongTaps((prev) => prev + 1);
      onIncorrectAnswer();
      setTimeout(() => setWiggle(false), 500);
    }
  };

  const endGame = () => {
    setTimeout(() => {
      completeGameActivity('STOP_THINK_GO');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-8">
      <div className="bg-slate-800 p-6 rounded-full flex flex-col gap-4 border-4 border-slate-700 shadow-xl">
        <div className={`w-24 h-24 rounded-full transition-colors duration-300 ${light === 'RED' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-red-900'}`} />
        <div className={`w-24 h-24 rounded-full transition-colors duration-300 ${light === 'GREEN' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-green-900'}`} />
      </div>

      <motion.button
        animate={wiggle ? { x: [-5, 5, -5, 5, 0] } : {}}
        onClick={handleTap}
        className="w-full max-w-xs py-6 bg-[var(--color-accent)] text-white text-2xl font-bold rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-transform"
      >
        TAP TO GO!
      </motion.button>
    </div>
  );
};

export default StopThinkGo;
