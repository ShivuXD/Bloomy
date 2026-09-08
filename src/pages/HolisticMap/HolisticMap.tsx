import React, { useEffect, useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Peco from '../../components/Peco/Peco';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
const ACTIVITY_SKILL_TAGS: Record<string, string[]> = {
  FOCUS: ['ATN-SUS', 'ATN-INH', 'WM'],
  READING: ['PHON', 'DECODE', 'SPELL', 'ORTHO', 'COMP'],
  SOCIAL: ['SOC-CUE', 'SOC-SCRIPT', 'SOC-PROB', 'EMO-REG', 'FLEX', 'SELF-REG'],
  ROCKET_FOCUS: ['ATN-SUS', 'ATN-INH', 'SEQ'],
  STOP_THINK_GO: ['ATN-INH', 'SELF-REG'],
  STORY_ADVENTURE: ['COMP', 'PHON'],
  WHAT_WOULD_YOU_DO: ['SOC-CUE', 'SOC-SCRIPT', 'SOC-PROB'],
  WORD_BUILDER: ['SPELL', 'PHON', 'DECODE'],
  MEMORY_MISSION: ['WM', 'SEQ', 'ATN-SUS'],
  GREETING_MASTER: ['SOC-CUE', 'SOC-SCRIPT', 'FLEX'],
  REAL_WORLD_MISSION: ['SOC-CUE', 'SOC-SCRIPT', 'SOC-PROB', 'FLEX'],
};

const ALL_SKILL_TAGS = [
  'ATN-SUS', 'ATN-INH', 'WM', 'SEQ', 'EMO-REG', 'PHON', 'DECODE',
  'SPELL', 'ORTHO', 'COMP', 'SOC-CUE', 'SOC-SCRIPT', 'SOC-PROB', 'FLEX', 'SELF-REG',
];
function buildSkillScoresFromProfile(childProfile: { activityId: string; accuracy: number }[]) {
  const tagTotals: Record<string, { sum: number; count: number }> = {};

  childProfile.forEach((record) => {
    const tags = ACTIVITY_SKILL_TAGS[record.activityId] || [];
    tags.forEach((tag) => {
      if (!tagTotals[tag]) tagTotals[tag] = { sum: 0, count: 0 };
      tagTotals[tag].sum += record.accuracy;
      tagTotals[tag].count += 1;
    });
  });

  return ALL_SKILL_TAGS.map((tag) => ({
    tag,
    score: tagTotals[tag] ? Math.round(tagTotals[tag].sum / tagTotals[tag].count) : 70,
  }));
}

const DEFAULT_SKILL_SCORES = [
  { tag: "ATN-SUS", score: 80 },
  { tag: "ATN-INH", score: 65 },
  { tag: "WM", score: 70 },
  { tag: "SEQ", score: 85 },
  { tag: "EMO-REG", score: 60 },
  { tag: "PHON", score: 90 },
  { tag: "DECODE", score: 75 },
  { tag: "SPELL", score: 70 },
  { tag: "ORTHO", score: 80 },
  { tag: "COMP", score: 85 },
  { tag: "SOC-CUE", score: 95 },
  { tag: "SOC-SCRIPT", score: 80 },
  { tag: "SOC-PROB", score: 70 },
  { tag: "FLEX", score: 65 },
  { tag: "SELF-REG", score: 75 }
];

const HolisticMap: React.FC = () => {
const { skillScores, setSkillScores, setCurrentScreen, triggerPecoEvent, childProfile } = useNurture();   const [loading, setLoading] = useState(() => !skillScores || skillScores.length === 0);

  useEffect(() => {
    if (childProfile && childProfile.length > 0) {
      setSkillScores(buildSkillScoresFromProfile(childProfile));
    } else {
      setSkillScores(DEFAULT_SKILL_SCORES);
    }
    setLoading(false);
    triggerPecoEvent('PROUD', "Look at your wonderful skill map! Every mind learns in its own special way.");
  }, [childProfile]);
  const displayScores = (skillScores && skillScores.length > 0) ? skillScores : DEFAULT_SKILL_SCORES;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-xl font-bold text-slate-700">Generating your learning profile with Peco...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--color-bg)] p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        
        {/* Companion Header with Peco */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="shrink-0">
            <Peco expression="proud" size="sm" showSpeechBubble={false} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              Personal Growth
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)]">
              Your Holistic Skill Map
            </h1>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              Peco says: "Your brain is unique and powerful! This map celebrates your individual strengths and paths we can explore together."
            </p>
          </div>
        </div>

        {/* Skill Chart */}
        <div className="w-full h-[360px] md:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayScores}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="tag" tick={{ fill: 'var(--color-text)', fontSize: 13, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Skills" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentScreen('DAILY_QUEST')}
            className="py-4 px-8 bg-[var(--color-accent)] text-white text-lg md:text-xl font-bold rounded-2xl shadow-md flex items-center gap-2"
          >
            <span>Continue to Daily Quests</span>
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default HolisticMap;
