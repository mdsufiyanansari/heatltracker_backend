import mongoose from "mongoose";

const coordinateSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const runningRouteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    distanceKm: { type: Number, required: true, min: 0.1, max: 500 },
    estimatedMinutes: { type: Number, min: 1, max: 1440, default: null },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], default: "Easy" },
    description: { type: String, maxlength: 1000, default: "" },
    startLocation: { type: String, maxlength: 200, default: "" },
    endLocation: { type: String, maxlength: 200, default: "" },
    startCoordinates: { type: coordinateSchema, default: null },
    endCoordinates: { type: coordinateSchema, default: null },
    coordinates: { type: [coordinateSchema], default: [], validate: [(arr) => arr.length <= 1000, "Maximum 1000 route coordinates allowed"] },
  },
  { timestamps: true }
);

runningRouteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.RunningRoute || mongoose.model("RunningRoute", runningRouteSchema);
