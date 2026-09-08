import React from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import Peco from '../../components/Peco/Peco';
import SpeechBubble from '../../components/Peco/SpeechBubble';
import FocusGame from '../../components/Game/FocusGame';
import ReadingGame from '../../components/Game/ReadingGame';
import SocialGame from '../../components/Game/SocialGame';
import RocketFocus from '../../components/Game/RocketFocus';
import StopThinkGo from '../../components/Game/StopThinkGo';
import WhatWouldYouDo from '../../components/Game/WhatWouldYouDo';
import WordBuilder from '../../components/Game/WordBuilder';
import RealWorldMission from '../../components/Game/RealWorldMission';
import MemoryMission from '../../components/Game/MemoryMission';
import GreetingMaster from '../../components/Game/GreetingMaster';
import StoryAdventure from '../../components/Game/StoryAdventure';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Sparkles } from 'lucide-react';

const Assessment: React.FC = () => {
  const { currentMission, setCurrentScreen, setIsCalmSpaceOpen, onActivityEnter, onSectionChange } = useNurture();

  // Proactive activity introduction when entering or switching activity
  React.useEffect(() => {
    onActivityEnter(currentMission);
  }, [currentMission, onActivityEnter]);

  const getMissionTitle = () => {
    switch (currentMission) {
      case 'FOCUS': return 'Bright Star Search';
      case 'READING': return 'Phonics Sound Match';
      case 'SOCIAL': return 'Feelings & Empathy';
      case 'ROCKET_FOCUS': return 'Blue Star Explorer';
      case 'STOP_THINK_GO': return 'Stop, Think, Go!';
      case 'WHAT_WOULD_YOU_DO': return 'Social Pathways';
      case 'WORD_BUILDER': return 'Word Sound Blending';
      case 'MEMORY_MISSION':
      case 'adhd-memory-1': return 'Memory Mission: Object Sequence';
      case 'GREETING_MASTER':
      case 'asd-comm-3': return 'Greeting Master: Hello & Bye';
      case 'STORY_ADVENTURE':
      case 'dys-comp-1': return 'Story Adventure: Treehouse Tale';
      case 'REAL_WORLD_MISSION': return 'Real-World Mission';
      default: return "Peco's Adventure";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] p-3 md:p-6 pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="w-full max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            onSectionChange('DAILY_QUEST');
            setCurrentScreen('DAILY_QUEST');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-700 hover:text-indigo-600 font-semibold text-xs md:text-sm border border-slate-200/80 shadow-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quests</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            {getMissionTitle()}
          </span>
        </div>

        <button
          onClick={() => setIsCalmSpaceOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs md:text-sm border border-teal-200/80 shadow-sm transition-colors"
        >
          <Wind size={16} />
          <span className="hidden sm:inline">Calm Space</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-6 flex-1">
        
        {/* Peco Companion Area (Compact & Non-Obstructive) */}
        <div className="w-full md:w-80 flex flex-col items-center shrink-0">
          <SpeechBubble />
          <div className="mt-3">
            <Peco size="md" interactive={true} enableVoiceInput={true} />
          </div>
        </div>

        {/* Game Activity Canvas */}
        <div className="flex-1 flex justify-center items-center w-full min-h-[360px] bg-white/60 backdrop-blur-xs rounded-3xl p-4 md:p-8 border border-white/80 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMission}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              {currentMission === 'FOCUS' && <FocusGame />}
              {currentMission === 'READING' && <ReadingGame />}
              {currentMission === 'SOCIAL' && <SocialGame />}
              {currentMission === 'ROCKET_FOCUS' && <RocketFocus />}
              {currentMission === 'STOP_THINK_GO' && <StopThinkGo />}
              {currentMission === 'WHAT_WOULD_YOU_DO' && <WhatWouldYouDo />}
              {currentMission === 'WORD_BUILDER' && <WordBuilder />}
              {(currentMission === 'MEMORY_MISSION' || currentMission === 'adhd-memory-1') && <MemoryMission />}
              {(currentMission === 'GREETING_MASTER' || currentMission === 'asd-comm-3') && <GreetingMaster />}
              {(currentMission === 'STORY_ADVENTURE' || currentMission === 'dys-comp-1') && <StoryAdventure />}
              {currentMission === 'REAL_WORLD_MISSION' && <RealWorldMission />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Assessment;
