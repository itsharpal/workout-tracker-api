import mongoose from "mongoose";

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number, // in kg
    default: 0
  },
  notes: {
    type: String
  }
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    exercises: [workoutExerciseSchema],
    scheduledAt: {
      type: Date // For scheduling workouts
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending"
    },
    comments: {
      type: String
    },
    progressReport: {
      totalWorkouts: {
        type: Number,
        default: 0
      },
      completedWorkouts: {
        type: Number,
        default: 0
      },
      totalWeightLifted: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true }
);

export const Workout = mongoose.model("Workout", workoutSchema);