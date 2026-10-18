import { z } from "zod";
import Assessment from "../models/Assessment.js";
import { createWorkoutPlan } from "../utils/workoutPlanner.js";

const schema = z.object({
  age: z.coerce.number().int().min(13).max(100),
  fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  currentDistanceKm: z.coerce.number().min(0).max(500),
  targetDistanceKm: z.coerce.number().min(0.1).max(500),
  weeklyTrainingDays: z.coerce.number().int().min(1).max(7),
  availableMinutes: z.coerce.number().int().min(5).max(300)
}).refine(data => data.targetDistanceKm >= data.currentDistanceKm, {
  message: "Target distance should be equal to or greater than current distance.",
  path: ["targetDistanceKm"]
});

export async function generateAssessment(req, res, next) {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const plan = createWorkoutPlan(parsed.data);
    const assessment = await Assessment.create({ ...parsed.data, user: req.user._id, plan });
    res.status(201).json({ success: true, source: "free-rule-based", message: "Workout plan generated.", assessmentId: assessment._id, plan });
  } catch (err) { next(err); }
}

export async function latestAssessment(req, res, next) {
  try {
    const assessment = await Assessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, assessment });
  } catch (err) { next(err); }
}
