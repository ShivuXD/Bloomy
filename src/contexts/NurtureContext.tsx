import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { PecoState, PecoAppEvent, ScreenState, MissionType, SkillScore, DailyMission, AccessibilitySettings, Telemetry } from '../types/nurture';
import { pecoCompanion, SpeechRequestOptions } from '../services/pecoCompanion';
import { submitAssessment } from '../services/api';
import {
  RealWorldSkill,
  RealWorldMissionItem,
  ACTIVITY_SKILL_MAP,
  ACTIVITY_CHALLENGE_CONFIGS,
  getActivityChallenge,
  selectContextualMission,
} from '../data/realWorldMissionsData';
import {
  WeeklyTrendPoint,
  INITIAL_WEEKLY_TRENDS,
  getStoredPlaySeconds,
  saveStoredPlaySeconds,
  getStoredActivityDates,
  recordActivityDate,
  calculateStreak,
  getStoredCompletedMissions,
  recordCompletedMissionKey,
  getStoredWeeklyTrends,
  recordActivitySkillScore,
} from '../utils/dashboardMetrics';

export const ACTIVITIES_REQUIRED_FOR_MISSION = 7;
export interface ProgressRecord {
  activityId: string;
  timestamp: number;
  skillLevel: string;
  difficultyLevel: number;
  accuracy: number;
}
export const PECO_EVENT_MAP: Record<PecoAppEvent, { expression: PecoState; message: string; autoResetMs?: number }> = {
  CORRECT_ANSWER: {
    expression: 'happy',
    message: "Awesome! You got it!",
    autoResetMs: 3200,
  },
  LEVEL_COMPLETE: {
    expression: 'celebrating',
    message: "You completed the quest! I'm celebrating with you!",
    autoResetMs: 4000,
  },
  DIFFICULT_TASK_COMPLETED: {
    expression: 'proud',
    message: "You worked so hard and did it! I'm so proud of your effort.",
    autoResetMs: 4000,
  },
  WRONG_ANSWER: {
    expression: 'encouraging',
    message: "Almost! Let's try it together.",
    autoResetMs: 3000,
  },
  MULTIPLE_ERRORS: {
    expression: 'comforting',
    message: "That's okay. We can take a little break or try again slowly.",
    autoResetMs: 4000,
  },
  SHOW_HINT: {
    expression: 'thinking',
    message: "Think about it for a moment...",
  },
  VOICE_INPUT: {
    expression: 'listening',
    message: "I'm listening! Speak whenever you are ready.",
  },
  CALM_SPACE: {
    expression: 'calm',
    message: "Let's take a slow, gentle breath together.",
  },
  NORMAL_STATE: {
    expression: 'idle',
    message: "Hi! I'm Peco. Let's learn together!",
  },
  RETRY: {
    expression: 'encouraging',
    message: "You can do it! Let's give it another try.",
    autoResetMs: 3000,
  },
  REWARD_EARNED: {
    expression: 'excited',
    message: "Woohoo! Look what you unlocked!",
    autoResetMs: 3500,
  },
  LESSON_COMPLETE: {
    expression: 'celebrating',
    message: "You finished the whole lesson! Fantastic job!",
    autoResetMs: 4500,
  },
};

interface NurtureContextType {
  currentScreen: ScreenState;
  setCurrentScreen: (screen: ScreenState) => void;
  currentMission: MissionType;
  setCurrentMission: (mission: MissionType) => void;
  difficultyLevel: number;
  setDifficultyLevel: (level: number) => void;
  pecoState: PecoState;
  setPecoState: (state: PecoState) => void;
  pecoMessage: string;
  setPecoMessage: (msg: string) => void;
  pecoHint: string | null;
  setPecoHint: (hint: string | null) => void;
  triggerPecoEvent: (event: PecoAppEvent, customMessage?: string, durationMs?: number) => void;
  realWorldChallenge: { title: string; description: string } | null;
  setRealWorldChallenge: (challenge: { title: string; description: string } | null) => void;
  skillScores: SkillScore[];
  setSkillScores: (scores: SkillScore[]) => void;
  dailyMissions: DailyMission[];
  setDailyMissions: (missions: DailyMission[]) => void;
  accessibilitySettings: AccessibilitySettings;
  setAccessibilitySettings: (settings: AccessibilitySettings) => void;
  isCalmSpaceOpen: boolean;
  setIsCalmSpaceOpen: (open: boolean) => void;

  // Real-World Mission Contextual Progress & Unlocking
  activitiesCompletedTowardsMission: number;
  activitiesRequiredForMission: number;
  recentActivitySkills: RealWorldSkill[];
  activeRealWorldMission: RealWorldMissionItem | null;
  setActiveRealWorldMission: (mission: RealWorldMissionItem | null) => void;
  isRealWorldMissionUnlocked: boolean;
  completedRealWorldMissionIds: string[];
  completeGameActivity: (activityId: string, options?: { silentCompanion?: boolean }) => { unlocked: boolean; mission?: RealWorldMissionItem };
  recordRealWorldMissionCompletion: (missionId: string, xp?: number) => void;
  dismissRealWorldMission: () => void;
  unlockRealWorldMissionForSkill: (forcedSkill?: RealWorldSkill) => void;

  // Activity-Specific Exercise Progress
  activityExerciseCounts: Record<string, number>;
  recordExerciseProgress: (activityId: string) => { count: number; isComplete: boolean; required: number };
  getActivityProgress: (activityId: string) => { count: number; required: number; isComplete: boolean };
  resetActivityProgress: (activityId: string) => void;
  unlockActivityChallenge: (activityId: string) => RealWorldMissionItem;

  // Proactive Learning Companion Speech Controls
  isPecoSpeaking: boolean;
  isPecoLoadingAudio: boolean;
  inworldError: { message: string; status?: number } | null;
  setInworldError: (err: { message: string; status?: number } | null) => void;
  stopSpeaking: () => void;
  speak: (text: string, expression?: PecoState, options?: SpeechRequestOptions) => Promise<void>;
  onAppStart: () => void;
  onActivityEnter: (mission: MissionType) => void;
  onCorrectAnswer: (telemetry?: Telemetry, activityId?: string) => Promise<void>;
  onIncorrectAnswer: (attempt?: number) => void;
  onHintNeeded: (mission?: MissionType, customHint?: string) => void;
  onActivityComplete: (mission?: MissionType) => void;
  onSectionChange: (screen: ScreenState) => void;
  onAskPecoHelp: () => void;

  // Real Activity Tracking for Parents Dashboard
  totalPlaySeconds: number;
  streakDays: number;
  totalMissionsCompleted: number;
  weeklyTrendData: WeeklyTrendPoint[];
  childProfile: ProgressRecord[];

  // Child identity (used for personalized AI messages)
  childName: string;
  updateChildName: (name: string) => void;
}

const WELCOME_SESSION_KEY = 'peco_welcomed_session';
let hasWelcomedInMemory = false;

export const hasWelcomedThisSession = (): boolean => {
  if (hasWelcomedInMemory) return true;
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(WELCOME_SESSION_KEY) === 'true';
  } catch {
    return hasWelcomedInMemory;
  }
};

export const markWelcomedThisSession = (): void => {
  hasWelcomedInMemory = true;
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
  } catch {}
};

const NurtureContext = createContext<NurtureContextType | undefined>(undefined);

export const NurtureProvider = ({ children }: { children: ReactNode }) => {
  const isInitialWelcome = !hasWelcomedThisSession();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('ONBOARDING');
  const [currentMission, setCurrentMission] = useState<MissionType>('FOCUS');
  const [difficultyLevel, setDifficultyLevel] = useState<number>(5);
  const [pecoState, setPecoState] = useState<PecoState>(isInitialWelcome ? 'happy' : 'idle');
  const [pecoMessage, setPecoMessage] = useState<string>(
    "Hello! I am Peco! Let's learn together!"
  );
  const [pecoHint, setPecoHint] = useState<string | null>(null);
  const [isCalmSpaceOpen, setIsCalmSpaceOpen] = useState<boolean>(false);
  const [realWorldChallenge, setRealWorldChallenge] = useState<{ title: string; description: string } | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    profile: 'Default',
    dyslexiaFont: false,
    lowSensoryMode: false,
    textToSpeech: false,
  });

  // Companion audio states
  const [isPecoSpeaking, setIsPecoSpeaking] = useState<boolean>(false);
  const [isPecoLoadingAudio, setIsPecoLoadingAudio] = useState<boolean>(false);
  const [inworldError, setInworldError] = useState<{ message: string; status?: number } | null>(null);

  // Contextual Real-World Mission States (Persisted)
  const [activitiesCompletedTowardsMission, setActivitiesCompletedTowardsMission] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nurture_rwm_count');
      return saved ? Math.min(ACTIVITIES_REQUIRED_FOR_MISSION, Math.max(0, parseInt(saved, 10) || 0)) : 0;
    } catch {
      return 0;
    }
  });

  const [recentActivitySkills, setRecentActivitySkills] = useState<RealWorldSkill[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_recent_skills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedRealWorldMissionIds, setCompletedRealWorldMissionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_completed_rwm_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeRealWorldMission, setActiveRealWorldMission] = useState<RealWorldMissionItem | null>(() => {
    try {
      const saved = localStorage.getItem('nurture_active_rwm');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isRealWorldMissionUnlocked, setIsRealWorldMissionUnlocked] = useState<boolean>(
    () => activeRealWorldMission !== null
  );

  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real Activity Tracking for Parents Dashboard
  const [totalPlaySeconds, setTotalPlaySeconds] = useState<number>(getStoredPlaySeconds);
  const [completedMissionKeys, setCompletedMissionKeys] = useState<string[]>(getStoredCompletedMissions);
  const [activityDates, setActivityDates] = useState<string[]>(getStoredActivityDates);
  const [weeklyTrendData, setWeeklyTrendData] = useState<WeeklyTrendPoint[]>(getStoredWeeklyTrends);

  // Active Play Time tracking (counts active tab time only)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setTotalPlaySeconds((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) {
            saveStoredPlaySeconds(next);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalMissionsCompleted = useMemo(() => {
    const completedDaily = dailyMissions.filter((m) => m.completed).map((m) => m.id);
    const allUnique = new Set([
      ...completedDaily,
      ...completedRealWorldMissionIds,
      ...completedMissionKeys,
    ]);
    return allUnique.size;
  }, [dailyMissions, completedRealWorldMissionIds, completedMissionKeys]);

  const streakDays = useMemo(() => {
    return calculateStreak(activityDates);
  }, [activityDates]);

  const isPecoSpeakingRef = useRef(isPecoSpeaking);
  useEffect(() => {
    isPecoSpeakingRef.current = isPecoSpeaking;
  }, [isPecoSpeaking]);

  const lowSensoryRef = useRef(accessibilitySettings.lowSensoryMode);
  useEffect(() => {
    lowSensoryRef.current = accessibilitySettings.lowSensoryMode;
  }, [accessibilitySettings.lowSensoryMode]);

  const currentMissionRef = useRef(currentMission);
  useEffect(() => {
    currentMissionRef.current = currentMission;
  }, [currentMission]);

  const currentScreenRef = useRef(currentScreen);
  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Synchronize Companion Speech Manager with this Context
  useEffect(() => {
    pecoCompanion.registerCallbacks({
      setState: (s) => setPecoState(s),
      setMessage: (m) => {
        setPecoMessage(m);
      },
      setIsSpeaking: (spk) => setIsPecoSpeaking(spk),
      setIsLoading: (ld) => setIsPecoLoadingAudio(ld),
      setError: (err) => setInworldError(err),
    });
  }, []);

  const triggerPecoEvent = useCallback((event: PecoAppEvent, customMessage?: string, durationMs?: number) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    const config = PECO_EVENT_MAP[event];
    if (!config) return;

    const messageToUse = customMessage || config.message;
    setPecoState(config.expression);
    setPecoMessage(messageToUse);
    if (event === 'SHOW_HINT') {
      setPecoHint(messageToUse);
    } else {
      setPecoHint(null);
    }

    const isLowSensory = lowSensoryRef.current;
    const mission = currentMissionRef.current;

    // Connect proactive speech to app events using Peco's Inworld voice
    if (event === 'CORRECT_ANSWER') {
      if (customMessage) {
        pecoCompanion.speak(customMessage, 'celebrating', { priority: 'high', force: true }, isLowSensory);
      } else {
        pecoCompanion.onCorrectAnswer(isLowSensory);
      }
    } else if (event === 'WRONG_ANSWER' || event === 'MULTIPLE_ERRORS') {
      if (customMessage) {
        pecoCompanion.speak(customMessage, config.expression || 'comforting', { priority: 'high', force: true }, isLowSensory);
      } else {
        pecoCompanion.onIncorrectAnswer(1, isLowSensory);
      }
    } else if (event === 'SHOW_HINT') {
      pecoCompanion.speak(messageToUse, config.expression || 'thinking', { priority: 'high', force: true }, isLowSensory);
    } else if (event === 'LEVEL_COMPLETE' || event === 'LESSON_COMPLETE' || event === 'DIFFICULT_TASK_COMPLETED') {
      if (customMessage) {
        pecoCompanion.speak(customMessage, 'celebrating', { priority: 'high', force: true }, isLowSensory);
      } else {
        pecoCompanion.onActivityComplete(mission, isLowSensory);
      }
    } else if (event === 'CALM_SPACE') {
      pecoCompanion.speak("Let's take a slow, gentle breath together.", 'calm', { priority: 'high', force: true }, isLowSensory);
    } else if (customMessage) {
      pecoCompanion.speak(customMessage, config.expression, { priority: 'normal', force: true }, isLowSensory);
    }

    const resetDuration = durationMs !== undefined ? durationMs : config.autoResetMs;
    if (resetDuration && resetDuration > 0) {
      resetTimerRef.current = setTimeout(() => {
        if (!isPecoSpeakingRef.current) {
          setPecoState('idle');
        }
        resetTimerRef.current = null;
      }, resetDuration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Companion action wrappers
  const onAppStart = useCallback(() => {
    markWelcomedThisSession();
    pecoCompanion.onAppStart(lowSensoryRef.current);
  }, []);

  const onActivityEnter = useCallback((mission: MissionType) => {
    pecoCompanion.onActivityEnter(mission, lowSensoryRef.current);
  }, []);

  const [childProfile, setChildProfile] = useState<ProgressRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_child_profile');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [childName, setChildName] = useState<string>(() => {
    try {
      return localStorage.getItem('nurture_child_name') || "Friend";
    } catch {
      return "Friend";
    }
  });

  const updateChildName = useCallback((name: string) => {
    const cleanName = name.trim() || "Friend";
    setChildName(cleanName);
    try {
      localStorage.setItem('nurture_child_name', cleanName);
    } catch {}
  }, []);

  const onCorrectAnswer = useCallback(async (telemetry?: Telemetry, activityId?: string) => {
    pecoCompanion.onCorrectAnswer(lowSensoryRef.current);

    if (telemetry && activityId) {
      try {
        const aiResult = await submitAssessment(telemetry, childName);

        setDifficultyLevel(aiResult.difficulty_level);

        // Show real Gemini message + emotion
        if (aiResult.hint) {
          setPecoMessage(aiResult.hint);
          setPecoState(aiResult.peco_state);
        }

        const record: ProgressRecord = {
          activityId,
          timestamp: Date.now(),
          skillLevel: aiResult.result,
          difficultyLevel: aiResult.difficulty_level,
          accuracy: telemetry.accuracy,
        };

        setChildProfile((prev) => {
          const updated = [...prev, record];
          try {
            localStorage.setItem('nurture_child_profile', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } catch (err) {
        console.error('AI personalization error:', err);
      }
    }
  }, [childName]);

  const onIncorrectAnswer = useCallback((attempt?: number) => {
    pecoCompanion.onIncorrectAnswer(attempt, lowSensoryRef.current);
  }, []);

  const onHintNeeded = useCallback((mission?: MissionType, customHint?: string) => {
    pecoCompanion.onHintNeeded(mission || currentMissionRef.current, customHint, lowSensoryRef.current);
  }, []);

  const onActivityComplete = useCallback((mission?: MissionType) => {
    pecoCompanion.onActivityComplete(mission || currentMissionRef.current, lowSensoryRef.current);
  }, []);

  const onSectionChange = useCallback((screen: ScreenState) => {
    pecoCompanion.onSectionChange(screen, lowSensoryRef.current);
  }, []);

  const onAskPecoHelp = useCallback(() => {
    pecoCompanion.onAskPecoHelp(currentMissionRef.current, currentScreenRef.current, lowSensoryRef.current);
  }, []);

  const speak = useCallback((text: string, expression: PecoState = 'idle', options?: SpeechRequestOptions) => {
    return pecoCompanion.speak(text, expression, options, lowSensoryRef.current);
  }, []);

  const stopSpeaking = useCallback(() => {
    pecoCompanion.stop();
  }, []);

  // Centralized Game Activity Completion handler
  const completeGameActivity = useCallback((activityId: string, options?: { silentCompanion?: boolean }) => {
    // 1. Notify companion
    if (!options?.silentCompanion) {
      pecoCompanion.onActivityComplete(activityId as MissionType, lowSensoryRef.current);
    }

    // 2. Mark this mission completed in dailyMissions
    setDailyMissions((prev) =>
      prev.map((m) => (m.id === activityId ? { ...m, completed: true } : m))
    );

    // Record real activity metrics for Parent Dashboard
    const updatedDates = recordActivityDate();
    setActivityDates(updatedDates);
    const updatedKeys = recordCompletedMissionKey(activityId);
    setCompletedMissionKeys(updatedKeys);
    const updatedTrends = recordActivitySkillScore(activityId, 85);
    setWeeklyTrendData(updatedTrends);

    // 3. Resolve skill practiced
    const detectedSkill: RealWorldSkill = ACTIVITY_SKILL_MAP[activityId] || 'Communication';
    const updatedSkills = [...recentActivitySkills, detectedSkill];
    setRecentActivitySkills(updatedSkills);
    try {
      localStorage.setItem('nurture_recent_skills', JSON.stringify(updatedSkills));
    } catch {}

    const nextCount = activitiesCompletedTowardsMission + 1;

    if (nextCount >= ACTIVITIES_REQUIRED_FOR_MISSION) {
      // THRESHOLD REACHED: Select contextual Real-World Mission based on recent skills
      const mission = selectContextualMission(updatedSkills, completedRealWorldMissionIds);

      setActiveRealWorldMission(mission);
      setIsRealWorldMissionUnlocked(true);
      setActivitiesCompletedTowardsMission(0);
      try {
        localStorage.setItem('nurture_rwm_count', '0');
        localStorage.setItem('nurture_active_rwm', JSON.stringify(mission));
      } catch {}

      // Transition to Real-World Mission on Assessment screen
      setCurrentMission('REAL_WORLD_MISSION');
      setCurrentScreen('ASSESSMENT');

      const unlockAnnouncement = `You've been practicing ${mission.skill}! Ready to try using it in the real world?`;
      triggerPecoEvent('PROUD', unlockAnnouncement, 5000);
      speak(unlockAnnouncement, 'proud', { priority: 'high', force: true });

      return { unlocked: true, mission };
    } else {
      // Threshold not yet reached (e.g. 1 or 2 of 3)
      setActivitiesCompletedTowardsMission(nextCount);
      try {
        localStorage.setItem('nurture_rwm_count', String(nextCount));
      } catch {}

      setIsRealWorldMissionUnlocked(false);

      const remaining = ACTIVITIES_REQUIRED_FOR_MISSION - nextCount;
      const progressMessage = `Great work! Complete ${remaining} more ${
        remaining === 1 ? 'activity' : 'activities'
      } to unlock your real-world challenge!`;
      triggerPecoEvent('CORRECT_ANSWER', progressMessage, 4000);

      // Return smoothly to Daily Quests
      setCurrentScreen('DAILY_QUEST');

      return { unlocked: false };
    }
  }, [
    recentActivitySkills,
    activitiesCompletedTowardsMission,
    completedRealWorldMissionIds,
    triggerPecoEvent,
    speak,
  ]);

  const [activityExerciseCounts, setActivityExerciseCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('nurture_activity_counts_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const recordExerciseProgress = useCallback((activityId: string) => {
    const config = ACTIVITY_CHALLENGE_CONFIGS[activityId] || ACTIVITY_CHALLENGE_CONFIGS['WORD_BUILDER'];
    const required = config?.requiredExercises || 7;
    let nextVal = 1;
    setActivityExerciseCounts(prev => {
      nextVal = (prev[activityId] || 0) + 1;
      const updated = { ...prev, [activityId]: nextVal };
      try {
        localStorage.setItem('nurture_activity_counts_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return {
      count: nextVal,
      required,
      isComplete: nextVal >= required,
    };
  }, []);

  const getActivityProgress = useCallback((activityId: string) => {
    const config = ACTIVITY_CHALLENGE_CONFIGS[activityId] || ACTIVITY_CHALLENGE_CONFIGS['WORD_BUILDER'];
    const required = config?.requiredExercises || 7;
    const count = activityExerciseCounts[activityId] || 0;
    return {
      count,
      required,
      isComplete: count >= required,
    };
  }, [activityExerciseCounts]);

  const resetActivityProgress = useCallback((activityId: string) => {
    setActivityExerciseCounts(prev => {
      const updated = { ...prev, [activityId]: 0 };
      try {
        localStorage.setItem('nurture_activity_counts_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const unlockActivityChallenge = useCallback((activityId: string) => {
    const mission = getActivityChallenge(activityId, completedRealWorldMissionIds);
    setActiveRealWorldMission(mission);
    setIsRealWorldMissionUnlocked(true);
    try {
      localStorage.setItem('nurture_active_rwm', JSON.stringify(mission));
    } catch {}
    return mission;
  }, [completedRealWorldMissionIds]);

  const recordRealWorldMissionCompletion = useCallback((missionId: string, xp = 20) => {
    // Record real activity metrics for Parent Dashboard
    const updatedDates = recordActivityDate();
    setActivityDates(updatedDates);
    const updatedKeys = recordCompletedMissionKey(missionId);
    setCompletedMissionKeys(updatedKeys);
    const updatedTrends = recordActivitySkillScore(missionId, 90);
    setWeeklyTrendData(updatedTrends);

    setCompletedRealWorldMissionIds((prev) => {
      if (prev.includes(missionId)) return prev;
      const updated = [...prev, missionId];
      try {
        localStorage.setItem('nurture_completed_rwm_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setIsRealWorldMissionUnlocked(false);
    setActiveRealWorldMission(null);
    try {
      localStorage.removeItem('nurture_active_rwm');
    } catch {}
  }, []);

  const dismissRealWorldMission = useCallback(() => {
    setIsRealWorldMissionUnlocked(false);
    setCurrentScreen('DAILY_QUEST');
  }, []);

  const unlockRealWorldMissionForSkill = useCallback(
    (forcedSkill?: RealWorldSkill) => {
      const skillsToUse = forcedSkill
        ? [forcedSkill]
        : recentActivitySkills.length > 0
        ? recentActivitySkills
        : (['Communication'] as RealWorldSkill[]);

      const mission = selectContextualMission(skillsToUse, completedRealWorldMissionIds);
      setActiveRealWorldMission(mission);
      setIsRealWorldMissionUnlocked(true);
      setCurrentMission('REAL_WORLD_MISSION');
      setCurrentScreen('ASSESSMENT');

      const speech = `You've been practicing ${mission.skill}! Ready to try using it in the real world?`;
      triggerPecoEvent('PROUD', speech, 5000);
      speak(speech, 'proud', { priority: 'high', force: true });
    },
    [recentActivitySkills, completedRealWorldMissionIds, triggerPecoEvent, speak]
  );

  return (
    <NurtureContext.Provider value={{
      currentScreen, setCurrentScreen,
      currentMission, setCurrentMission,
      difficultyLevel, setDifficultyLevel,
      pecoState, setPecoState,
      pecoMessage, setPecoMessage,
      pecoHint, setPecoHint,
      triggerPecoEvent,
      realWorldChallenge, setRealWorldChallenge,
      skillScores, setSkillScores,
      dailyMissions, setDailyMissions,
      accessibilitySettings, setAccessibilitySettings,
      isCalmSpaceOpen, setIsCalmSpaceOpen,
      activitiesCompletedTowardsMission,
      activitiesRequiredForMission: ACTIVITIES_REQUIRED_FOR_MISSION,
      recentActivitySkills,
      activeRealWorldMission,
      setActiveRealWorldMission,
      isRealWorldMissionUnlocked,
      completedRealWorldMissionIds,
      completeGameActivity,
      recordRealWorldMissionCompletion,
      dismissRealWorldMission,
      unlockRealWorldMissionForSkill,
      activityExerciseCounts,
      recordExerciseProgress,
      getActivityProgress,
      resetActivityProgress,
      unlockActivityChallenge,
      isPecoSpeaking,
      isPecoLoadingAudio,
      inworldError,
      setInworldError,
      stopSpeaking,
      speak,
      onAppStart,
      onActivityEnter,
      onCorrectAnswer,
      onIncorrectAnswer,
      onHintNeeded,
      onActivityComplete,
      onSectionChange,
      onAskPecoHelp,
      totalPlaySeconds,
      streakDays,
      totalMissionsCompleted,
      weeklyTrendData,
      childProfile,
      childName,
      updateChildName,
    }}>
      {children}
    </NurtureContext.Provider>
  );
};

export const useNurture = () => {
  const context = useContext(NurtureContext);
  if (!context) throw new Error("useNurture must be used within NurtureProvider");
  return context;
};