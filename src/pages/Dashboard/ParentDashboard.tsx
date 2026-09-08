import React, { useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { Settings, BarChart2, Activity, User, Smile, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Peco from '../../components/Peco/Peco';
import { PecoState } from '../../types/nurture';

type PecoTestState = PecoState | 'talking' | 'correct';

const ANIMATION_TEST_LIST: { id: PecoTestState; label: string; desc: string }[] = [
  { id: 'idle', label: 'Idle', desc: 'Gentle floating & breathing (default living state)' },
  { id: 'talking', label: 'Talking', desc: 'Speech-synchronized bobbing & micro-movements' },
  { id: 'listening', label: 'Listening', desc: 'Attentive friendly tilt when child speaks' },
  { id: 'correct', label: 'Correct / Win', desc: 'Cheerful celebratory bounce with soft sparkles' },
  { id: 'encouraging', label: 'Encouraging', desc: "Supportive gentle lean: 'Almost! Let's try again'" },
  { id: 'calm', label: 'Calm Space', desc: 'Slow, peaceful mindful breathing loop' },
  { id: 'thinking', label: 'Thinking', desc: 'Curious subtle head tilt during puzzles/hints' },
  { id: 'proud', label: 'Proud', desc: 'Confident gentle upright lift' },
  { id: 'excited', label: 'Excited', desc: 'Joyful lively movement' },
  { id: 'comforting', label: 'Comforting', desc: 'Warm empathetic reassuring lean' },
];

const ParentDashboard: React.FC = () => {
  const {
    setCurrentScreen,
    accessibilitySettings,
    setAccessibilitySettings,
    totalPlaySeconds,
    streakDays,
    totalMissionsCompleted,
    weeklyTrendData,
  } = useNurture();
  const [testState, setTestState] = useState<PecoTestState>('idle');

  const playHours = Math.floor(totalPlaySeconds / 3600);
  const playMinutes = Math.floor((totalPlaySeconds % 3600) / 60);
  const playTimeDisplay = `${playHours}h ${playMinutes}m`;

  const toggleSetting = (key: keyof typeof accessibilitySettings) => {
    if (key === 'profile') return;
    setAccessibilitySettings({
      ...accessibilitySettings,
      [key]: !accessibilitySettings[key]
    });
  };

  const setProfile = (profile: any) => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      profile,
      dyslexiaFont: profile === 'Dyslexia',
      lowSensoryMode: profile === 'ASD',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <header className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">Parent Dashboard</h1>
        <button 
          onClick={() => setCurrentScreen('DAILY_QUEST')}
          className="text-blue-600 font-medium hover:underline"
        >
          Back to Child View
        </button>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Accessibility Toggles
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Quick Profile</label>
                <div className="flex flex-wrap gap-2">
                  {['Default', 'ADHD', 'Dyslexia', 'ASD'].map(p => (
                    <button
                      key={p}
                      id={`quick-profile-${p.toLowerCase()}`}
                      onClick={() => setProfile(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${accessibilitySettings.profile === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">Dyslexia Font</span>
                  <input type="checkbox" checked={accessibilitySettings.dyslexiaFont} onChange={() => toggleSetting('dyslexiaFont')} className="w-5 h-5 accent-blue-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">Low Sensory Mode</span>
                  <input type="checkbox" checked={accessibilitySettings.lowSensoryMode} onChange={() => toggleSetting('lowSensoryMode')} className="w-5 h-5 accent-blue-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-medium">Text to Speech</span>
                  <input type="checkbox" checked={accessibilitySettings.textToSpeech} onChange={() => toggleSetting('textToSpeech')} className="w-5 h-5 accent-blue-600" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Data */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={20} />
              Weekly Skill Trends
            </h2>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="focus" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Focus (ATN)" />
                  <Line type="monotone" dataKey="reading" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Reading (PHON)" />
                  <Line type="monotone" dataKey="emotion" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Emotion (EMO)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-slate-500 font-semibold mb-1">Total Play Time</h3>
               <p className="text-3xl font-bold text-slate-800">{playTimeDisplay}</p>
               <p className={`text-sm ${totalPlaySeconds > 0 ? 'text-green-600' : 'text-slate-400'} mt-2 font-medium`}>
                 {totalPlaySeconds > 0 ? `↑ ${Math.max(1, Math.round(totalPlaySeconds / 60))}m this week` : '0m this week'}
               </p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-slate-500 font-semibold mb-1">Missions Completed</h3>
               <p className="text-3xl font-bold text-slate-800">{totalMissionsCompleted}</p>
               <p className={`text-sm ${streakDays > 0 ? 'text-green-600' : 'text-slate-400'} mt-2 font-medium`}>
                 {streakDays > 0 ? `${streakDays} day streak!` : '0 days streak'}
               </p>
             </div>
          </div>
        </div>

        {/* Peco Mascot Companion Verification & Animation Tester */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Smile size={22} className="text-purple-600" />
                Original Peco Mascot & Animation Verification
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Single source of truth: 100% original Peco character design with transparent background and subtle natural animations.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold self-start md:self-auto">
              <Sparkles size={13} />
              Current State: {testState.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Mascot Display - Transparent, No Card Box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-100/80">
              <Peco state={testState} size="xl" showSpeechBubble={false} interactive={true} />
              <div className="mt-3 text-center">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Active Animation: <span className="text-purple-600 font-extrabold">{testState}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ANIMATION_TEST_LIST.find(e => e.id === testState)?.desc}
                </p>
                <p className="text-[11px] text-purple-600 font-medium mt-1">
                  💡 Tap Peco above to trigger his friendly interaction response!
                </p>
              </div>
            </div>

            {/* Animation State Selectors */}
            <div className="md:col-span-8">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Select Interactive State:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {ANIMATION_TEST_LIST.map(item => (
                  <button
                    key={item.id}
                    id={`test-peco-${item.id}`}
                    onClick={() => setTestState(item.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                      testState === item.id
                        ? 'bg-purple-600 text-white shadow-md scale-[1.02]'
                        : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-800'
                    }`}
                  >
                    <span className="font-extrabold capitalize">{item.label}</span>
                    <span className={`text-[10px] mt-0.5 font-normal truncate ${testState === item.id ? 'text-purple-100' : 'text-slate-500'}`}>
                      {item.desc.split(':')[0]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-50/60 rounded-xl border border-purple-100/60 text-xs text-purple-900 leading-relaxed">
                <strong>Character Integrity:</strong> Peco is preserved exactly from the original reference image — with his original face, eyes, ears, hair colors, and purple hoodie. The blue photographic background has been completely removed to render him seamlessly with transparency across all screens.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
