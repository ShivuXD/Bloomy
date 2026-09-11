import React, { useMemo, useState } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Focus,
  Heart,
  Settings,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TrendPoint = {
  day: string;
  focus?: number;
  reading?: number;
  emotion?: number;
};

const ParentDashboard: React.FC = () => {
  const {
    setCurrentScreen,
    accessibilitySettings,
    setAccessibilitySettings,
    totalPlaySeconds,
    streakDays,
    totalMissionsCompleted,
    weeklyTrendData,
    childAge,
  } = useNurture();

  const [trendRange, setTrendRange] = useState<'7' | '14'>('7');

  const playHours = Math.floor(totalPlaySeconds / 3600);
  const playMinutes = Math.floor((totalPlaySeconds % 3600) / 60);
  const playTimeDisplay =
    playHours > 0 ? `${playHours}h ${playMinutes}m` : `${playMinutes}m`;

  const trendData = useMemo<TrendPoint[]>(() => {
    const data = Array.isArray(weeklyTrendData) ? weeklyTrendData : [];
    return trendRange === '14' ? data : data.slice(-7);
  }, [weeklyTrendData, trendRange]);

  const latestTrend = trendData[trendData.length - 1];

  const average = (key: keyof TrendPoint) => {
    const values = trendData
      .map((item) => item[key])
      .filter((value): value is number => typeof value === 'number');

    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const focusAverage = average('focus');
  const readingAverage = average('reading');
  const emotionAverage = average('emotion');

  const toggleSetting = (key: keyof typeof accessibilitySettings) => {
    if (key === 'profile') return;

    setAccessibilitySettings({
      ...accessibilitySettings,
      [key]: !accessibilitySettings[key],
    });
  };

  const setProfile = (profile: string) => {
    setAccessibilitySettings({
      ...accessibilitySettings,
      profile,
      dyslexiaFont: profile === 'Dyslexia',
      lowSensoryMode: profile === 'ASD',
    });
  };

  const activeProfileLabel =
    accessibilitySettings.profile === 'Default'
      ? 'Standard support'
      : accessibilitySettings.profile;

  const getProgressLabel = (value: number) => {
    if (value >= 80) return 'Strong';
    if (value >= 60) return 'Developing';
    if (value > 0) return 'Building';
    return 'Getting started';
  };

  const getTrendMessage = () => {
    if (!trendData.length) {
      return 'Learning activity will appear here as your child completes more sessions.';
    }

    if (focusAverage >= readingAverage && focusAverage >= emotionAverage) {
      return 'Attention-focused activities are currently showing the strongest observed performance.';
    }

    if (readingAverage >= emotionAverage) {
      return 'Reading and phonics activities are currently showing the strongest observed performance.';
    }

    return 'Emotion and social activities are currently showing the strongest observed performance.';
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserRound size={21} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Family overview
              </p>
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Parent Dashboard
              </h1>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('DAILY_QUEST')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to Child View</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8 lg:py-8">
        {/* Welcome / high-level summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Sparkles size={16} />
                Learning snapshot
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                A clear view of your child&apos;s learning journey
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Bloomy turns activity data into simple learning insights so you
                can see progress, strengths, and areas that may benefit from
                more practice.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 lg:min-w-[230px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current support profile
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {activeProfileLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {childAge ? `Age ${childAge}` : 'Personalized for your child'}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Activities completed
                </p>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalMissionsCompleted}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Completed learning missions
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Learning time
                </p>
                <Clock3 size={18} className="text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {playTimeDisplay}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Recorded activity time
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Learning streak
                </p>
                <TrendingUp size={18} className="text-amber-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {streakDays} {streakDays === 1 ? 'day' : 'days'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Consecutive active days
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Current focus
                </p>
                <Focus size={18} className="text-violet-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {focusAverage || '--'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Observed attention trend
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main analytics */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={19} className="text-slate-700" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Learning progress
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Observed skill trends from recent activity.
                  </p>
                </div>

                <div className="relative self-start">
                  <select
                    value={trendRange}
                    onChange={(event) =>
                      setTrendRange(event.target.value as '7' | '14')
                    }
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    aria-label="Trend range"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Attention
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {focusAverage || '--'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {getProgressLabel(focusAverage)}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    Reading
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {readingAverage || '--'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {getProgressLabel(readingAverage)}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Social &amp; emotion
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {emotionAverage || '--'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {getProgressLabel(emotionAverage)}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}`,
                        name,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="focus"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Attention"
                    />
                    <Line
                      type="monotone"
                      dataKey="reading"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Reading"
                    />
                    <Line
                      type="monotone"
                      dataKey="emotion"
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Social & emotion"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Eye size={18} className="mt-0.5 shrink-0 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    What the graph tells you
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {getTrendMessage()}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    These are learning observations from Bloomy activities,
                    not medical or diagnostic measurements.
                  </p>
                </div>
              </div>
            </section>

            {/* Insights */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp size={19} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Growing strengths
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Skills currently showing stronger observed performance.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    ['Attention', focusAverage],
                    ['Reading', readingAverage],
                    ['Social & emotion', emotionAverage],
                  ]
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 2)
                    .map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {String(label)}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {Number(value) || '--'}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all"
                            style={{
                              width: `${Math.min(100, Number(value) || 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <BookOpen size={19} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Areas to support
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  A gentle view of skills that may benefit from practice.
                </p>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {(() => {
                      const values = [
                        ['Attention', focusAverage],
                        ['Reading', readingAverage],
                        ['Social & emotion', emotionAverage],
                      ].sort((a, b) => Number(a[1]) - Number(b[1]));
                      return values[0]?.[1]
                        ? `${values[0][0]} may benefit from more practice`
                        : 'Keep building consistent learning habits';
                    })()}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Short, repeatable activities and positive feedback can help
                    build confidence as your child practises.
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Heart size={14} />
                  Focus on progress over comparison.
                </div>
              </div>
            </section>
          </div>

          {/* Parent controls */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Settings size={19} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profile &amp; support settings
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Adjust the experience to better match your child&apos;s
                    current needs.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Quick support profile
                </label>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['Default', 'ADHD', 'Dyslexia', 'ASD'].map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      id={`quick-profile-${profile.toLowerCase()}`}
                      onClick={() => setProfile(profile)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        accessibilitySettings.profile === profile
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  These profiles change accessibility preferences. They do not
                  diagnose or label your child.
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Accessibility
                </p>

                <div className="mt-3 divide-y divide-slate-100">
                  {[
                    ['dyslexiaFont', 'Dyslexia-friendly font'],
                    ['lowSensoryMode', 'Low sensory mode'],
                    ['textToSpeech', 'Text to speech'],
                  ].map(([key, label]) => {
                    const settingKey =
                      key as keyof typeof accessibilitySettings;

                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center justify-between gap-4 py-4"
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {label}
                        </span>

                        <span className="relative inline-flex shrink-0">
                          <input
                            type="checkbox"
                            checked={Boolean(accessibilitySettings[settingKey])}
                            onChange={() => toggleSetting(settingKey)}
                            className="peer sr-only"
                          />
                          <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-slate-900 peer-focus:ring-2 peer-focus:ring-slate-300" />
                          <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <div className="flex items-start gap-3">
                <Sparkles size={19} className="mt-0.5 text-slate-300" />
                <div>
                  <h2 className="text-base font-bold">A note for parents</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Bloomy uses activity performance and interaction patterns
                    to adapt learning. Treat the dashboard as a helpful
                    progress view, not as a clinical assessment.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Latest data point
                </h2>
              </div>

              {latestTrend ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Attention</span>
                    <span className="font-bold text-slate-800">
                      {latestTrend.focus ?? '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Reading</span>
                    <span className="font-bold text-slate-800">
                      {latestTrend.reading ?? '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Social &amp; emotion</span>
                    <span className="font-bold text-slate-800">
                      {latestTrend.emotion ?? '--'}
                    </span>
                  </div>
                  <p className="pt-1 text-xs text-slate-400">
                    Latest recorded point: {latestTrend.day}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No recent trend data is available yet.
                </p>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
