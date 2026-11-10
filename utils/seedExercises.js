import Exercise from '../models/Exercises.js';

const exercises = [
    // CHEST
    {
        name: 'Bench Press',
        category: 'Chest',
        muscleGroup: 'Pectorals',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'A compound exercise for building chest strength.',
    },
    {
        name: 'Incline Dumbbell Press',
        category: 'Chest',
        muscleGroup: 'Upper Chest',
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        description: 'Targets the upper chest muscles.',
    },
    {
        name: 'Chest Fly',
        category: 'Chest',
        muscleGroup: 'Pectorals',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'An isolation exercise for chest development.',
    },
    {
        name: 'Push Ups',
        category: 'Chest',
        muscleGroup: 'Pectorals',
        equipment: 'None',
        difficulty: 'Beginner',
        description: 'A bodyweight exercise for chest and triceps.',
    },

    // BACK
    {
        name: 'Pull Ups',
        category: 'Back',
        muscleGroup: 'Latissimus Dorsi',
        equipment: 'Pull Up Bar',
        difficulty: 'Intermediate',
        description: 'A bodyweight exercise for back development.',
    },
    {
        name: 'Lat Pulldown',
        category: 'Back',
        muscleGroup: 'Latissimus Dorsi',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        description: 'Targets the lats and upper back.',
    },
    {
        name: 'Barbell Row',
        category: 'Back',
        muscleGroup: 'Middle Back',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Builds thickness and strength in the back.',
    },
    {
        name: 'Deadlift',
        category: 'Back',
        muscleGroup: 'Posterior Chain',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        description: 'A compound exercise for full-body strength.',
    },

    // SHOULDERS
    {
        name: 'Shoulder Press',
        category: 'Shoulders',
        muscleGroup: 'Deltoids',
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        description: 'Builds shoulder strength and size.',
    },
    {
        name: 'Lateral Raises',
        category: 'Shoulders',
        muscleGroup: 'Side Deltoids',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Targets the lateral shoulder muscles.',
    },

    // BICEPS
    {
        name: 'Barbell Curl',
        category: 'Biceps',
        muscleGroup: 'Biceps Brachii',
        equipment: 'Barbell',
        difficulty: 'Beginner',
        description: 'An effective exercise for biceps development.',
    },
    {
        name: 'Hammer Curl',
        category: 'Biceps',
        muscleGroup: 'Biceps and Brachialis',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Targets the biceps and brachialis.',
    },

    // TRICEPS
    {
        name: 'Triceps Pushdown',
        category: 'Triceps',
        muscleGroup: 'Triceps',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        description: 'An isolation exercise for triceps.',
    },
    {
        name: 'Skull Crushers',
        category: 'Triceps',
        muscleGroup: 'Triceps',
        equipment: 'EZ Bar',
        difficulty: 'Intermediate',
        description: 'Targets all three heads of the triceps.',
    },

    // LEGS
    {
        name: 'Barbell Squat',
        category: 'Legs',
        muscleGroup: 'Quadriceps',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'A compound exercise for lower body strength.',
    },
    {
        name: 'Leg Press',
        category: 'Legs',
        muscleGroup: 'Quadriceps',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Develops quadriceps and glutes.',
    },
    {
        name: 'Leg Curl',
        category: 'Legs',
        muscleGroup: 'Hamstrings',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'An isolation exercise for hamstrings.',
    },
    {
        name: 'Calf Raises',
        category: 'Legs',
        muscleGroup: 'Calves',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Strengthens the calf muscles.',
    },

    // ABS
    {
        name: 'Crunches',
        category: 'Abs',
        muscleGroup: 'Rectus Abdominis',
        equipment: 'None',
        difficulty: 'Beginner',
        description: 'A bodyweight abdominal exercise.',
    },
    {
        name: 'Plank',
        category: 'Abs',
        muscleGroup: 'Core',
        equipment: 'None',
        difficulty: 'Beginner',
        description: 'An isometric exercise for core stability.',
    },

    // FOREARMS
    {
        name: 'Wrist Curls',
        category: 'Forearms',
        muscleGroup: 'Forearm Flexors',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Strengthens the forearm flexors.',
    },

    // CARDIO
    {
        name: 'Running',
        category: 'Cardio',
        muscleGroup: 'Full Body',
        equipment: 'None',
        difficulty: 'Beginner',
        description: 'A cardiovascular endurance exercise.',
    },
    {
        name: 'Jump Rope',
        category: 'Cardio',
        muscleGroup: 'Full Body',
        equipment: 'Skipping Rope',
        difficulty: 'Beginner',
        description: 'Improves cardiovascular fitness and coordination.',
    },
];

const seedExercises = async () => {
    try {
        let addedCount = 0;

        for (const exercise of exercises) {
            const exists = await Exercise.findOne({
                name: exercise.name,
                createdBy: null,
            });

            if (!exists) {
                await Exercise.create(exercise);
                addedCount++;
            }
        }

        console.log(`${addedCount} new exercises added successfully.`);
    } catch (error) {
        console.log('Exercise seeding error:', error.message);
    }
};

export default seedExercises;