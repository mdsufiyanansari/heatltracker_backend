import { z } from "zod";
import Activity from "../models/Activity.js";

const activitySchema = z.object({
  activityType: z.enum(["Running", "Walking", "Cycling", "Workout", "Yoga", "Other"]),
  durationMinutes: z.coerce.number().int().min(1).max(1440),
  distanceKm: z.coerce.number().min(0).max(1000).default(0),
  calories: z.coerce.number().int().min(0).max(20000).default(0),
  notes: z.string().max(500).optional().default(""),
  completedAt: z.coerce.date().optional()
});

export async function createActivity(req, res, next) {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const activity = await Activity.create({ ...parsed.data, user: req.user._id });
    res.status(201).json({ success: true, activity });
  } catch (err) { next(err); }
}

export async function listActivities(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const activities = await Activity.find({ user: req.user._id }).sort({ completedAt: -1 }).limit(limit);
    res.json({ success: true, count: activities.length, activities });
  } catch (err) { next(err); }
}

export async function deleteActivity(req, res, next) {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found." });
    res.json({ success: true, message: "Activity deleted." });
  } catch (err) { next(err); }
}
