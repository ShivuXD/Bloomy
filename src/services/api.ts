export const submitAssessment = async (
  telemetry: Telemetry,
  childName: string = "Friend"
): Promise<AIResponse> => {
  try {
    const response = await fetch("http://bloomy-backend-rx1r.onrender.com/predict", {
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
      throw new Error("AI service failed");
    }

    const data = await response.json();

    // Real values from your AI + Gemini
    const skillLevel = data.skill_level;
    const pecoState = data.peco_state || "encouraging";
    const pecoMessage = data.peco_message || "You're doing great!";

    // Map skill level to difficulty
    let difficulty_level = 5;
    if (skillLevel === "Beginner") difficulty_level = 3;
    else if (skillLevel === "Advanced") difficulty_level = 8;

    return {
      result: skillLevel,
      difficulty_level,
      peco_state: pecoState,
      hint: pecoMessage,   // Using Gemini message as the hint/feedback
    };
  } catch (error) {
    console.error("AI API Error:", error);

    // Fallback if AI service is down
    return {
      result: "Intermediate",
      difficulty_level: 5,
      peco_state: "encouraging",
      hint: "Great effort! Keep going!",
    };
  }
};