
import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
    },

    isCompleted: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const sessionExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },

    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },

    muscleGroup: {
      type: String,
      default: '',
    },

    sets: {
      type: [setSchema],
      validate: {
        validator: (sets) => sets.length > 0,
        message: 'An exercise must contain at least one set.',
      },
    },
  },
  { _id: true }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    // User who performed this workout
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Routine used for this session
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null,
    },

    routineName: {
      type: String,
      required: true,
      trim: true,
    },

    // Actual workout date
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    exercises: {
      type: [sessionExerciseSchema],
      required: true,
      validate: {
        validator: (exercises) => exercises.length > 0,
        message: 'A workout must contain at least one exercise.',
      },
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    totalSets: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['completed', 'in-progress'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching a user's workout history
workoutSessionSchema.index({
  userId: 1,
  date: -1,
});

const WorkoutSession = mongoose.model(
  'WorkoutSession',
  workoutSessionSchema
);

export default WorkoutSession;
