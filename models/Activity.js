import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    activityType: {
      type: String,
      enum: {
        values: [
          "Running",
          "Walking",
          "Cycling",
          "Workout",
          "Yoga",
          "Other",
        ],
        message: "Invalid activity type",
      },
      required: [true, "Activity type is required"],
      default: "Running",
    },

    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [1440, "Duration cannot exceed 24 hours"],
      validate: {
        validator: Number.isFinite,
        message: "Duration must be a valid number",
      },
    },

    distanceKm: {
      type: Number,
      default: 0,
      min: [0, "Distance cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Distance must be a valid number",
      },
    },

    calories: {
      type: Number,
      default: 0,
      min: [0, "Calories cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Calories must be a valid number",
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },

    completedAt: {
      type: Date,
      default: Date.now,
      validate: {
        validator: (value) =>
          value instanceof Date && !Number.isNaN(value.getTime()),
        message: "Please provide a valid completion date",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Efficiently fetch a user's activities by date.
activitySchema.index({ user: 1, completedAt: -1 });

const Activity =
  mongoose.models.Activity ||
  mongoose.model("Activity", activitySchema);

export default Activity;