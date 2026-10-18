
const { z } = require("zod");
const { generateWorkoutPlan } = require("../services/aiService");

const InputSchema = z.object({
  age: z.coerce.number().int().min(16).max(100),

  fitnessLevel: z.enum([
    "Beginner",
    "Intermediate",
    "Advanced",
  ]),

  currentDistanceKm: z.coerce.number().min(0).max(100),

  targetDistanceKm: z.coerce.number().min(0.1).max(100),

  weeklyTrainingDays: z.coerce.number().int().min(2).max(6),

  availableMinutes: z.coerce.number().int().min(10).max(180),
});

async function createWorkoutPlan(req, res) {
  // 1. Validate frontend input
  const validation = InputSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid fitness details. Please check your inputs.",
      errors: validation.error.issues,
    });
  }

  try {
    // 2. Generate a free rule-based workout plan
    const plan = await generateWorkoutPlan(validation.data);

    // 3. Return the result to the frontend
    return res.status(200).json({
      success: true,
      source: "free-rule-based",
      message: "Workout plan generated successfully.",
      plan,
    });
  } catch (error) {
    // 4. Log the actual error on the backend
    console.error("Workout generation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Workout plan generate nahi ho paya. Please try again.",
    });
  }
}

module.exports = {
  createWorkoutPlan,
};
