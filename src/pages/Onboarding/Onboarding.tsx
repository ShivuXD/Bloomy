import React, { useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import Peco from '../../components/Peco/Peco';
import SpeechBubble from '../../components/Peco/SpeechBubble';
import { motion } from 'framer-motion';
import { Sparkles, Sliders, Eye, Type, Volume2, Wind } from 'lucide-react';

const Onboarding: React.FC = () => {
  const {
    setCurrentScreen,
    triggerPecoEvent,
    accessibilitySettings,
    setAccessibilitySettings,
    setIsCalmSpaceOpen,
    childName,
    updateChildName,
  } = useNurture();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [nameInput, setNameInput] = useState<string>(childName === 'Friend' ? '' : childName);

  const handleStart = () => {
    updateChildName(nameInput);
    setCurrentScreen('ASSESSMENT');
  };

  const toggleSetting = (key: keyof typeof accessibilitySettings) => {
    if (key === 'profile') return;
    const newVal = !accessibilitySettings[key];
    setAccessibilitySettings({
      ...accessibilitySettings,
      [key]: newVal,
    });

    if (key === 'lowSensoryMode') {
      if (newVal) {
        triggerPecoEvent('CALM', "Low Sensory Mode is on. I'll stay soft and calm for you.");
      } else {
        triggerPecoEvent('NORMAL_STATE', "Standard visual mode active! Let's explore.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg)] p-6">
      <motion.div 
        className="flex flex-col items-center max-w-lg w-full space-y-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* App Title Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-purple-600" />
            <span>Learning Buddy Companion</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
            NurtureBloom
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            An interactive, sensory-friendly adventure with your friend Peco
          </p>
        </div>

        {/* Speech Bubble */}
        <SpeechBubble />
        
        {/* Peco Hero Avatar */}
        <div className="my-2">
          <Peco size="xl" interactive={true} />
        </div>

        {/* Child Name Input */}
        <div className="w-full">
          <label
            htmlFor="onboarding-child-name"
            className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1"
          >
            What's your name?
          </label>
          <input
            id="onboarding-child-name"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Type your name here"
            maxLength={40}
            className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-[var(--color-accent)] focus:outline-hidden text-base font-medium text-[var(--color-text)] bg-white shadow-xs transition-colors"
          />
        </div>

        {/* Start CTA */}
        <button
          id="onboarding-play-btn"
          onClick={handleStart}
          className="w-full py-4 px-8 bg-[var(--color-accent)] text-white text-xl font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Let's Learn Together!</span>
        </button>

        {/* Quick Accessibility Toggles for Sensory Needs */}
        <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <Sliders size={14} />
              Sensory Preferences
            </span>
            <button
              onClick={() => setIsCalmSpaceOpen(true)}
              className="text-teal-600 hover:text-teal-700 flex items-center gap-1 normal-case font-semibold text-xs"
            >
              <Wind size={13} />
              Try Calm Space
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              id="toggle-low-sensory-btn"
              onClick={() => toggleSetting('lowSensoryMode')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                accessibilitySettings.lowSensoryMode
                  ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye size={18} />
              <span>Low Sensory</span>
            </button>

            <button
              id="toggle-dyslexia-font-btn"
              onClick={() => toggleSetting('dyslexiaFont')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                accessibilitySettings.dyslexiaFont
                  ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Type size={18} />
              <span>Dyslexia Font</span>
            </button>

            <button
              id="toggle-tts-btn"
              onClick={() => toggleSetting('textToSpeech')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                accessibilitySettings.textToSpeech
                  ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Volume2 size={18} />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Onboarding;