import type { AIResponse, DailyMission, Telemetry } from '../types/nurture';

const ML_API_URL = (import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  { id: 'ROCKET_FOCUS', title: 'Blue Star Explorer', target: 'Build focus and attention', completed: false },
  { id: 'STOP_THINK_GO', title: 'Stop, Think, Go!', target: 'Practice calm impulse control', completed: false },
  { id: 'WHAT_WOULD_YOU_DO', title: 'Social Pathways', target: 'Explore social choices', completed: false },
  { id: 'WORD_BUILDER', title: 'Word Sound Blending', target: 'Practice spelling and phonics', completed: false },
  { id: 'MEMORY_MISSION', title: 'Memory Mission', target: 'Strengthen recall skills', completed: false },
];

/** Keeps the core activities available when the ML service is unavailable. */
export const fetchDailyMissions = async (): Promise<{ missions: DailyMission[] }> => ({
  missions: DEFAULT_DAILY_MISSIONS,
});

export const submitAssessment = async (
  telemetry: Telemetry,
  childName: string = "Friend"
): Promise<AIResponse> => {
  const response = await fetch(`${ML_API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accuracy: telemetry.accuracy,
      reaction_time: telemetry.reaction_time,
      hesitation: telemetry.hesitation_count,
      retries: telemetry.retries,
      child_name: childName,
    }),
  });

  if (!response.ok) {
    throw new Error(`ML service returned HTTP ${response.status}`);
  }

  const data = await response.json();

  const difficultyLevel = Number(data.difficulty_level);

  if (
    !data.skill_level ||
    !Number.isFinite(difficultyLevel) ||
    difficultyLevel < 1 ||
    difficultyLevel > 10
  ) {
    throw new Error("ML service returned an invalid adaptation response");
  }

  return {
    result: String(data.skill_level),
    difficulty_level: difficultyLevel,
    peco_state: data.peco_state || "encouraging",
    hint: data.peco_message || null,
  };
};

export interface AdaptiveQuestionChoice {
  text: string;
  is_correct: boolean;
}

export interface AdaptiveQuestion {
  instruction: string;
  question: string;
  choices: AdaptiveQuestionChoice[];
  peco_dialogue: string;
}

export const generateAdaptiveQuestion = async (
  difficultyLevel: number,
  skillLevel: string,
  age: number = 8,
  questionType: string = "phonics",
  childName: string = "Friend"
): Promise<AdaptiveQuestion> => {
  try {
    const response = await fetch(`${ML_API_URL}/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        difficulty_level: difficultyLevel,
        skill_level: skillLevel,
        age,
        question_type: questionType,
        child_name: childName,
      }),
    });

    if (!response.ok) {
      throw new Error("Question generation failed");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Adaptive question error:", error);

    // Emergency frontend fallback
    return {
      instruction: "Choose the correct answer.",
      question: "Which word starts with B?",
      choices: [
        {
          text: "Bear",
          is_correct: true,
        },
        {
          text: "Cat",
          is_correct: false,
        },
      ],
    };
  }
};
