import React, { useState, useEffect, useMemo } from 'react';import { useNurture } from '../../contexts/NurtureContext';
import { motion } from 'framer-motion';
import { Star, Circle, Square, Triangle } from 'lucide-react';

const FocusGame: React.FC = () => {
  const { difficultyLevel, onCorrectAnswer, onIncorrectAnswer, onHintNeeded, setCurrentMission } = useNurture();
  const [startTime] = useState(Date.now());
  const [retries] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [wrongTries, setWrongTries] = useState(0);
  const [wiggleIndex, setWiggleIndex] = useState<number | null>(null);

  const numChoices = Math.min(6, 2 + Math.floor(difficultyLevel / 2));
  
  // Track hesitation and offer gentle hint if inactive for 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHesitationCount(prev => prev + 1);
      onHintNeeded('FOCUS');
    }, 10000);
    return () => clearTimeout(timer);
  }, [onHintNeeded]);

  const handleChoice = async (isCorrect: boolean, index: number) => {
    if (isCorrect) {
      const accuracy = ((1 - wrongTries / (wrongTries + 1)) * 100) || 100;
      const reactionTime = Date.now() - startTime;
      
      await onCorrectAnswer({
        accuracy,
        reaction_time: reactionTime,
        hesitation_count: hesitationCount,
        retries
      }, 'FOCUS');

      setTimeout(() => {
        setCurrentMission('READING');
      }, 1600);

    } else {
      const newWrongs = wrongTries + 1;
      setWrongTries(newWrongs);
      setWiggleIndex(index);
      
      onIncorrectAnswer(newWrongs);

      setTimeout(() => setWiggleIndex(null), 500);
    }
  };

  const choices = useMemo(() => {
  const icons = [<Circle size={64}/>, <Square size={64}/>, <Triangle size={64}/>, <Circle size={64}/>, <Square size={64}/>];
  return Array.from({ length: numChoices }).map((_, i) => ({
    id: i,
    isCorrect: i === 0,
    icon: i === 0 ? <Star fill="#FACC15" color="#FACC15" size={64} /> : icons[i - 1]
  })).sort(() => Math.random() - 0.5);
}, [numChoices]);
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {choices.map((choice, idx) => (
        <motion.button
          key={choice.id}
          onClick={() => handleChoice(choice.isCorrect, idx)}
          animate={wiggleIndex === idx ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-32 h-32 md:w-36 md:h-36 bg-slate-50 shadow-sm rounded-3xl flex items-center justify-center border-4 border-slate-100 hover:border-indigo-400 hover:bg-white transition-all text-slate-400 cursor-pointer"
        >
          {choice.icon}
        </motion.button>
      ))}
    </div>
  );
};

export default FocusGame;
