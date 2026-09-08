export type LearnerNeed = 'asd' | 'adhd' | 'dyslexia' | 'communication' | 'social_emotional';

export type UserRole = 'parent' | 'teacher' | 'child';

export interface SensorySettings {
  readAloud: boolean;
  dyslexiaFont: boolean;
  lowSensoryMode: boolean;
  fixedLayoutLock: boolean;
  movementBreaks: boolean;
  timerVisibility: boolean;
  rewardStyle: 'competitive' | 'mastery' | 'interest';
  interestTheme: 'none' | 'space' | 'dinosaurs' | 'vehicles' | 'animals';
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  avatarHat?: string;
  age: number;
  needs: LearnerNeed[];
  sensorySettings: SensorySettings;
  totalPoints: number;
  level: number; // 1 to 5
  gardenStage: number; // 0 to 4 (seed, sprout, bud, flower, bouquet)
  gardenFlowersCount: number;
  wordWall: string[];
  unlockedCostumes: string[];
  badges: string[]; // Badge IDs
  assignedActivities: string[]; // Activity IDs assigned by teacher or parent
  customRoutine: RoutineItem[];
  customAAC: CustomAACItem[];
  parentEmail?: string;
  teacherId?: string;
  createdAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  icon: string;
  timeSlot?: string;
  completed: boolean;
}

export interface CustomAACItem {
  id: string;
  label: string;
  icon: string;
  category: 'food' | 'feelings' | 'actions' | 'help' | 'people' | 'places';
  soundPhrase?: string;
}

export interface ActivityAttempt {
  id: string;
  childId: string;
  activityId: string;
  activityName: string;
  category: LearnerNeed;
  accuracy: number; // 0 to 100 percentage
  correctCount: number;
  totalQuestions: number;
  difficultyLevel: number; // 1 to 4
  timeSpentSeconds: number;
  timestamp: string;
  notes?: string;
}

export interface Badge {
  id: string;
  title: string;
  category: LearnerNeed | 'general';
  description: string;
  icon: string;
  requirement: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  name: string;
  role: 'parent' | 'teacher';
  childrenIds: string[];
  createdAt: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  childId: string;
  grade: string;
  currentReadingStage: 'Letter' | 'Sound' | 'Word' | 'Sentence' | 'Story';
  currentLevel: number;
  recentAccuracy: number;
  lastActive: string;
  notes: string;
  assignedTasks: string[];
}
