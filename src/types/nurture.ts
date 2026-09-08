export type PecoState =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'encouraging'
  | 'thinking'
  | 'proud'
  | 'comforting'
  | 'calm'
  | 'celebrating'
  | 'listening'
  | 'curious'
  | 'silly';

export type PecoAppEvent =
  | 'CORRECT_ANSWER'
  | 'LEVEL_COMPLETE'
  | 'DIFFICULT_TASK_COMPLETED'
  | 'WRONG_ANSWER'
  | 'MULTIPLE_ERRORS'
  | 'SHOW_HINT'
  | 'VOICE_INPUT'
  | 'CALM_SPACE'
  | 'NORMAL_STATE'
  | 'RETRY'
  | 'REWARD_EARNED'
  | 'LESSON_COMPLETE';

export interface Telemetry {
  accuracy: number;
  reaction_time: number;
  hesitation_count: number;
  retries: number;
}

export interface SkillScore {
  tag: string;
  score: number;
}

export interface DailyMission {
  id: string;
  title: string;
  target: string;
  completed: boolean;
}

export interface AIResponse {
  result: string;
  difficulty_level: number;
  peco_state: PecoState;
  hint: string | null;
  daily_goal?: string;
  skill_scores?: SkillScore[];
  missions?: DailyMission[];
}

export interface AccessibilitySettings {
  profile: 'ADHD' | 'Dyslexia' | 'ASD' | 'Default';
  dyslexiaFont: boolean;
  lowSensoryMode: boolean;
  textToSpeech: boolean;
}

export type ScreenState = 'ONBOARDING' | 'ASSESSMENT' | 'HOLISTIC_MAP' | 'DAILY_QUEST' | 'PARENT_DASHBOARD' | 'ACTIVITY_DASHBOARD';
export type MissionType =
  | 'FOCUS'
  | 'READING'
  | 'SOCIAL'
  | 'ROCKET_FOCUS'
  | 'STOP_THINK_GO'
  | 'WHAT_WOULD_YOU_DO'
  | 'WORD_BUILDER'
  | 'REAL_WORLD_MISSION'
  | 'COMPLETED'
  | 'MEMORY_MISSION'
  | 'GREETING_MASTER'
  | 'STORY_ADVENTURE'
  | 'adhd-memory-1'
  | 'asd-comm-3'
  | 'dys-comp-1'
  | string;

export interface RealWorldChallenge {
  title: string;
  description: string;
}

