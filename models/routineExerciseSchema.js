
import mongoose from 'mongoose';

const routineExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },

    order: {
      type: Number,
      default: 1,
    },

    sets: {
      type: Number,
      default: 3,
      min: 1,
    },

    reps: {
      type: Number,
      default: 12,
      min: 1,
    },

    restSeconds: {
      type: Number,
      default: 60,
      min: 0,
    },

    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const routineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    goal: {
      type: String,
      enum: [
        'Build Muscle',
        'Lose Fat',
        'Endurance',
        'Strength',
      ],
      default: 'Build Muscle',
    },

    duration: {
      type: String,
      default: '45 min',
    },

    frequency: {
      type: String,
      default: '3 days',
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'Flexibility'],
    default: 'Strength',

    },
  
  exercises: {

  type: [routineExerciseSchema],
  validate: {
    validator: value => value.length > 0,
    message: 'A routine must contain at least one exercise',
  },
},

  isActive: {
  type: Boolean,
  default: true,
},
  },
{
  timestamps: true,
  }
);

const Routine = mongoose.model('Routine', routineSchema);

export default Routine;
