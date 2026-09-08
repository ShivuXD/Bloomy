export interface WeeklyTrendPoint {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  focus: number;
  reading: number;
  emotion: number;
}

export const INITIAL_WEEKLY_TRENDS: WeeklyTrendPoint[] = [
  { day: 'Mon', focus: 0, reading: 0, emotion: 0 },
  { day: 'Tue', focus: 0, reading: 0, emotion: 0 },
  { day: 'Wed', focus: 0, reading: 0, emotion: 0 },
  { day: 'Thu', focus: 0, reading: 0, emotion: 0 },
  { day: 'Fri', focus: 0, reading: 0, emotion: 0 },
];

const STORAGE_PLAY_SECONDS = 'nurture_total_play_seconds';
const STORAGE_ACTIVITY_DATES = 'nurture_activity_dates';
const STORAGE_COMPLETED_MISSIONS = 'nurture_completed_mission_keys';
const STORAGE_WEEKLY_TRENDS = 'nurture_weekly_skills_v1';

export function getStoredPlaySeconds(): number {
  try {
    const val = localStorage.getItem(STORAGE_PLAY_SECONDS);
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

export function saveStoredPlaySeconds(seconds: number): void {
  try {
    localStorage.setItem(STORAGE_PLAY_SECONDS, String(Math.max(0, seconds)));
  } catch {}
}

export function getStoredActivityDates(): string[] {
  try {
    const val = localStorage.getItem(STORAGE_ACTIVITY_DATES);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function recordActivityDate(): string[] {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dates = getStoredActivityDates();
    if (!dates.includes(today)) {
      const updated = [...dates, today];
      localStorage.setItem(STORAGE_ACTIVITY_DATES, JSON.stringify(updated));
      return updated;
    }
    return dates;
  } catch {
    return [];
  }
}

export function calculateStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  // Must have completed activity today or yesterday to maintain an active streak
  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  const startDayStr = uniqueDates.includes(today) ? today : yesterday;
  const checkDate = new Date(startDayStr);

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getStoredCompletedMissions(): string[] {
  try {
    const val = localStorage.getItem(STORAGE_COMPLETED_MISSIONS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function recordCompletedMissionKey(missionId: string): string[] {
  try {
    const current = getStoredCompletedMissions();
    if (!current.includes(missionId)) {
      const updated = [...current, missionId];
      localStorage.setItem(STORAGE_COMPLETED_MISSIONS, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch {
    return [];
  }
}

export function getStoredWeeklyTrends(): WeeklyTrendPoint[] {
  try {
    const val = localStorage.getItem(STORAGE_WEEKLY_TRENDS);
    if (!val) return INITIAL_WEEKLY_TRENDS;
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed) && parsed.length === 5) {
      return parsed;
    }
    return INITIAL_WEEKLY_TRENDS;
  } catch {
    return INITIAL_WEEKLY_TRENDS;
  }
}

export function recordActivitySkillScore(activityId: string, score = 80): WeeklyTrendPoint[] {
  try {
    const days: WeeklyTrendPoint['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    const dayIndex = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    let currentDay: WeeklyTrendPoint['day'] = 'Mon';
    if (dayIndex >= 1 && dayIndex <= 5) {
      currentDay = days[dayIndex - 1];
    } else if (dayIndex === 6) {
      currentDay = 'Fri';
    } else {
      currentDay = 'Mon';
    }

    const currentTrends = getStoredWeeklyTrends().map(point => ({ ...point }));
    const targetPoint = currentTrends.find(p => p.day === currentDay);

    if (targetPoint) {
      const idLower = activityId.toLowerCase();
      if (
        idLower.includes('focus') ||
        idLower.includes('think') ||
        idLower.includes('stop') ||
        idLower.includes('memory') ||
        idLower.includes('impulse') ||
        idLower.includes('atn')
      ) {
        targetPoint.focus = Math.max(targetPoint.focus, Math.min(100, Math.round(score)));
      } else if (
        idLower.includes('word') ||
        idLower.includes('reading') ||
        idLower.includes('phon') ||
        idLower.includes('story') ||
        idLower.includes('comp') ||
        idLower.includes('spell')
      ) {
        targetPoint.reading = Math.max(targetPoint.reading, Math.min(100, Math.round(score)));
      } else {
        targetPoint.emotion = Math.max(targetPoint.emotion, Math.min(100, Math.round(score)));
      }
    }

    localStorage.setItem(STORAGE_WEEKLY_TRENDS, JSON.stringify(currentTrends));
    return currentTrends;
  } catch {
    return INITIAL_WEEKLY_TRENDS;
  }
}
