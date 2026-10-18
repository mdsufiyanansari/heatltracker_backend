import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  age: { type: Number, required: true, min: 13, max: 100 },
  fitnessLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  currentDistanceKm: { type: Number, min: 0, required: true },
  targetDistanceKm: { type: Number, min: 0.1, required: true },
  weeklyTrainingDays: { type: Number, min: 1, max: 7, required: true },
  availableMinutes: { type: Number, min: 5, max: 300, required: true },
  plan: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export default mongoose.model("Assessment", assessmentSchema);
