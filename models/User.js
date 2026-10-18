import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  age: { type: Number, min: 13, max: 100, default: null },
  fitnessLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
