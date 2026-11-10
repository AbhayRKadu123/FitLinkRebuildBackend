
import mongoose from 'mongoose';

import Routine from '../models/routineExerciseSchema.js';
import Exercise from '../models/Exercises.js';
    // import mongoose from 'mongoose';

// CREATE NEW ROUTINE
export const createRoutine = async (req, res) => {
  try {
    const {
      title,
      goal,
      duration,
      frequency,
      exercises,
    } = req.body;

    console.log('Received routine data:', req.body);

    const userId = req.user?.id || "672a1b2c3d4e5f6789012345";

    const exerciseId = new mongoose.Types.ObjectId(
      '6af1a7d3c148cbb2eb0220b5'
    );

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Routine title is required',
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one exercise',
      });
    }

    // Check whether the hardcoded exercise exists
    const existingExercise = await Exercise.findById(exerciseId);

    if (!existingExercise) {
      return res.status(400).json({
        success: false,
        message: 'Exercise does not exist',
      });
    }

    // Assign the same exercise ID to every routine entry
    const routineExercises = exercises.map((item, index) => ({
      exerciseId: exerciseId,
      order: index + 1,
      sets: Number(item.sets) || 3,
      reps: Number(item.reps) || 12,
      restSeconds: Number(item.restSeconds) || 60,
      notes: item.notes || '',
    }));

    const newRoutine = await Routine.create({
      userId,
      title: title.trim(),
      exercises: routineExercises,
    });

    return res.status(201).json({
      success: true,
      message: 'Routine created successfully',
      routine: newRoutine,
    });

  } catch (error) {
    console.error('Create Routine Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create routine',
      error: error.message,
    });
  }
};
// export const createRoutine = async (req, res) => {
//   try {
//     const {
//       title,
//       goal,
//       duration,
//       frequency,
//       exercises,
//     } = req.body;
//     console.log('Received routine data:', req.body);

//     const userId = req.user?.id || "672a1b2c3d4e5f6789012345";

//     // Validate routine title
//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Routine title is required',
//       });
//     }

//     // Validate exercises
//     if (!Array.isArray(exercises) || exercises.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please add at least one exercise',
//       });
//     }

// const exerciseId = new mongoose.Types.ObjectId('6af1a7d3c148cbb2eb0220b5')||item.exerciseId;

//     // Validate exercise IDs
//     const invalidIds = exercises.some(
//       item => !mongoose.Types.ObjectId.isValid(exerciseId)
//       // 6af1a7d3c148cbb2eb0220b5
//     );

//     if (invalidIds) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid exercise ID',
//       });
//     }

//     // Check whether exercises exist
//     const exerciseIds = exercises.map(item => item.exerciseId);

//     const existingExercises = await Exercise.find({
//       _id: { $in: exerciseIds },
//     }).select('_id');

//     if (existingExercises.length !== new Set(exerciseIds.map(String)).size) {
//       return res.status(400).json({
//         success: false,
//         message: 'One or more exercises do not exist',
//       });
//     }

//     // Prepare exercise data
//     const routineExercises = exercises.map((item, index) => ({
//       exerciseId: item.exerciseId,
//       order: index + 1,
//       sets: Number(item.sets) || 3,
//       reps: Number(item.reps) || 12,
//       restSeconds: Number(item.restSeconds) || 60,
//       notes: item.notes || '',
//     }));

//     // Create routine
//     const newRoutine = await Routine.create({
//       userId,
//       title: title.trim(),
//       exercises: routineExercises,
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Routine created successfully',
//       //   routine: newRoutine,
//     });

//   } catch (error) {
//     console.error('Create Routine Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to create routine',
//       error: error.message,
//     });
//   }
// };
