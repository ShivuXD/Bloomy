import React, { useEffect, useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { fetchDailyMissions } from '../../services/api';
import { motion } from 'framer-motion';
import { Play, Star, BookOpen, Users, Navigation, Wind, Sparkles } from 'lucide-react';
import Peco from '../../components/Peco/Peco';
import { MissionType } from '../../types/nurture';

const DailyQuest: React.FC = () => {
  const {
    dailyMissions,
    setDailyMissions,
    triggerPecoEvent,
    setCurrentScreen,
    setCurrentMission,
    setIsCalmSpaceOpen,
  } = useNurture();
  const [loading, setLoading] = useState(() => !dailyMissions || dailyMissions.length === 0);

  useEffect(() => {
    let ignore = false;

    // Safety timer: Never stay stuck on loading screen
    const safetyTimer = setTimeout(() => {
      if (!ignore) {
        setLoading(false);
      }
    }, 600);

    const loadMissions = async () => {
      try {
        const data = await fetchDailyMissions();
        if (!ignore && data?.missions) {
          // Guarantee REAL_WORLD_MISSION is not included in the standard quests list
          setDailyMissions(data.missions.filter((m) => m.id !== 'REAL_WORLD_MISSION'));
        }
      } catch (err) {
        console.error('Failed to load daily quests', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
      if (!ignore) {
        triggerPecoEvent('NORMAL_STATE', "Welcome back! Which quest shall we conquer today?");
      }
    };

    if (dailyMissions && dailyMissions.length > 0) {
      setLoading(false);
      triggerPecoEvent('NORMAL_STATE', "Welcome back! Which quest shall we conquer today?");
    } else {
      loadMissions();
    }

    return () => {
      ignore = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  const getIcon = (id: string) => {
    switch(id) {
      case 'ROCKET_FOCUS': return <Navigation size={30} className="text-blue-500" />;
      case 'STOP_THINK_GO': return <Star size={30} className="text-amber-500" />;
      case 'WHAT_WOULD_YOU_DO': return <Users size={30} className="text-teal-500" />;
      case 'WORD_BUILDER': return <BookOpen size={30} className="text-purple-500" />;
      case 'MEMORY_MISSION':
      case 'adhd-memory-1': return <Sparkles size={30} className="text-amber-500" />;
      case 'GREETING_MASTER':
      case 'asd-comm-3': return <Users size={30} className="text-teal-500" />;
      case 'STORY_ADVENTURE':
      case 'dys-comp-1': return <BookOpen size={30} className="text-purple-500" />;
      default: return <Star size={30} />;
    }
  };

  const startMission = (missionId: string) => {
    setCurrentMission(missionId as MissionType);
    setCurrentScreen('ASSESSMENT');
  };

  // Quests filtered strictly so REAL_WORLD_MISSION never appears as a generic card
  const filteredQuests = dailyMissions.filter((m) => m.id !== 'REAL_WORLD_MISSION');

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-xl font-bold text-slate-700">Loading your daily quests with Peco...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Peco Header Banner */}
        <header className="flex flex-col sm:flex-row items-center gap-5 mb-6 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="shrink-0">
            <Peco size="sm" showSpeechBubble={false} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              Daily Adventure
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
              Your Daily Quests
            </h1>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              Peco is ready: "Pick any quest below. We learn and celebrate at your pace!"
            </p>
          </div>
          <button
            onClick={() => setIsCalmSpaceOpen(true)}
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <Wind size={16} />
            <span>Calm Space</span>
          </button>
        </header>

        {/* Quests List */}
        <div className="space-y-4">
          {filteredQuests.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white p-5 md:p-6 rounded-2xl shadow-sm flex items-center justify-between border-2 border-transparent hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  {getIcon(mission.id)}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[var(--color-text)]">{mission.title}</h3>
                  <p className="text-slate-500 text-sm font-medium">{mission.target}</p>
                </div>
              </div>
              <button 
                onClick={() => startMission(mission.id)}
                className="p-3.5 md:p-4 bg-[var(--color-bg)] rounded-full text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white transition-all shadow-sm"
                aria-label={`Start ${mission.title}`}
              >
                <Play size={22} fill="currentColor" />
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* Navigation links */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <button 
            onClick={() => setCurrentScreen('HOLISTIC_MAP')}
            className="text-[var(--color-accent)] hover:text-[var(--color-text)] font-semibold underline text-sm"
          >
            View Holistic Skill Map
          </button>
          <button 
            onClick={() => setCurrentScreen('ACTIVITY_DASHBOARD')}
            className="text-[var(--color-accent)] hover:text-[var(--color-text)] font-semibold underline text-sm"
          >
            View All Activities
          </button>
          <button 
            onClick={() => setCurrentScreen('PARENT_DASHBOARD')}
            className="text-slate-400 hover:text-slate-600 font-semibold underline text-sm"
          >
            Parent & Educator Portal
          </button>
        </div>

      </div>
    </div>
  );
};

export default DailyQuest;
