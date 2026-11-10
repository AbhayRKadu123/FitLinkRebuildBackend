import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                'Chest',
                'Back',
                'Shoulders',
                'Biceps',
                'Triceps',
                'Legs',
                'Abs',
                'Cardio',
                'Forearms',
            ],
        },

        muscleGroup: {
            type: String,
            required: true,
            trim: true,
        },

        equipment: {
            type: String,
            default: 'None',
        },

        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },

        description: {
            type: String,
            default: '',
        },

        instructions: {
            type: [String],
            default: [],
        },

        image: {
            type: String,
            default: '',
        },

        video: {
            type: String,
            default: '',
        },

        isPublic: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate public exercises
exerciseSchema.index(
    { name: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isPublic: true,
        },
    }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;