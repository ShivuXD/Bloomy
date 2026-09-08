import React from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { activities } from '../../data/activitiesData';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { MissionType } from '../../types/nurture';

const ActivityDashboard: React.FC = () => {
  const { accessibilitySettings, setCurrentScreen, setCurrentMission } = useNurture();
  
  // Filter activities based on the profile set in accessibility settings
  // If 'Default', show all. Otherwise filter by profile.
  const profileMap: Record<string, 'ADHD' | 'ASD' | 'DYSLEXIA'> = {
    'ADHD': 'ADHD',
    'ASD': 'ASD',
    'Dyslexia': 'DYSLEXIA'
  };

  const currentProfile = accessibilitySettings.profile;
  const filteredActivities = currentProfile === 'Default' 
    ? activities 
    : activities.filter(act => act.category === profileMap[currentProfile]);

  // Group by skill
  const groupedActivities = filteredActivities.reduce((acc, act) => {
    if (!acc[act.skill]) acc[act.skill] = [];
    acc[act.skill].push(act);
    return acc;
  }, {} as Record<string, typeof activities>);

  const handleStartActivity = (actId: string) => {
    let targetMission: MissionType = actId;

    if (actId === 'adhd-memory-1' || actId === 'adhd-memory-2' || actId === 'adhd-memory-3') {
      targetMission = 'adhd-memory-1';
    } else if (actId === 'asd-comm-3' || actId === 'asd-comm-1' || actId === 'asd-comm-2') {
      targetMission = 'asd-comm-3';
    } else if (actId === 'dys-comp-1' || actId === 'dys-comp-2' || actId === 'dys-comp-3') {
      targetMission = 'dys-comp-1';
    } else if (actId === 'adhd-focus-2') {
      targetMission = 'ROCKET_FOCUS';
    } else if (actId.startsWith('adhd-focus')) {
      targetMission = 'FOCUS';
    } else if (actId.startsWith('adhd-impulse')) {
      targetMission = 'STOP_THINK_GO';
    } else if (actId.startsWith('asd-soc')) {
      targetMission = 'WHAT_WOULD_YOU_DO';
    } else if (actId.startsWith('asd-emo')) {
      targetMission = 'SOCIAL';
    } else if (actId.startsWith('dys-phon')) {
      targetMission = 'READING';
    } else if (actId.startsWith('dys-spell') || actId.startsWith('dys-word')) {
      targetMission = 'WORD_BUILDER';
    }

    setCurrentMission(targetMission);
    setCurrentScreen('ASSESSMENT');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => setCurrentScreen('DAILY_QUEST')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-[var(--color-accent)] font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Daily Quests
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] mb-2">
            {currentProfile === 'Default' ? 'All Learning Activities' : `${currentProfile} Learning Path`}
          </h1>
          <p className="text-slate-500 text-sm">
            Click any module below to launch the interactive game with Peco!
          </p>
        </div>
        
        {Object.entries(groupedActivities).map(([skill, acts]) => (
          <section key={skill} className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 border-b-2 border-[var(--color-accent)] pb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--color-accent)]" />
              <span>{skill}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acts.map(activity => (
                <motion.div
                  key={activity.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartActivity(activity.id)}
                  className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-[var(--color-accent)] cursor-pointer flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {activity.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{activity.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-accent)]">
                      Play with Peco
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bg)] group-hover:bg-[var(--color-accent)] group-hover:text-white flex items-center justify-center text-slate-700 transition-colors shadow-xs">
                      <Play size={14} fill="currentColor" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ActivityDashboard;
