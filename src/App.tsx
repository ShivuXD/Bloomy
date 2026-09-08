import React, { useEffect } from 'react';
import { NurtureProvider, useNurture } from './contexts/NurtureContext';
import Onboarding from './pages/Onboarding/Onboarding';
import Assessment from './pages/Assessment/Assessment';
import HolisticMap from './pages/HolisticMap/HolisticMap';
import DailyQuest from './pages/DailyQuest/DailyQuest';
import ParentDashboard from './pages/Dashboard/ParentDashboard';
import ActivityDashboard from './pages/Dashboard/ActivityDashboard';
import CalmSpaceModal from './components/CalmSpace/CalmSpaceModal';
import clsx from 'clsx';

const AppContent: React.FC = () => {
  const { currentScreen, accessibilitySettings } = useNurture();

  // Apply theme classes based on accessibility settings
  useEffect(() => {
    document.body.className = clsx(
      'antialiased transition-all duration-500 min-h-screen',
      {
        'theme-dyslexia font-dyslexia': accessibilitySettings.dyslexiaFont,
        'theme-asd low-sensory': accessibilitySettings.lowSensoryMode,
      }
    );
  }, [accessibilitySettings]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'ONBOARDING': return <Onboarding />;
      case 'ASSESSMENT': return <Assessment />;
      case 'HOLISTIC_MAP': return <HolisticMap />;
      case 'DAILY_QUEST': return <DailyQuest />;
      case 'PARENT_DASHBOARD': return <ParentDashboard />;
      case 'ACTIVITY_DASHBOARD': return <ActivityDashboard />;
      default: return <Onboarding />;
    }
  };

  return (
    <>
      {renderScreen()}
      <CalmSpaceModal />
    </>
  );
};

const App: React.FC = () => {
  return (
    <NurtureProvider>
      <AppContent />
    </NurtureProvider>
  );
};

export default App;
