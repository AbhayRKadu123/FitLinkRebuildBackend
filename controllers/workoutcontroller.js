
import mongoose from 'mongoose';

import Routine from '../models/routineExerciseSchema.js';
import Exercise from '../models/Exercises.js';
// import mongoose from 'mongoose';


// get exercises from the database

// import Exercise from '../models/Exercises.js';
// export const getAllRoutines = async (req, res) => {
//   try {
//     console.log('Fetching routines for user...');

//     // Hardcoded user ID
//     const userId = new mongoose.Types.ObjectId(
//       '672a1b2c3d4e5f6789012345'
//     );

//     const routines = await Routine.aggregate([
//       {
//         $match: { userId },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           goal: 1,
//           duration: 1,
//           frequency: 1,
//           exercises: 1,
//           createdAt: 1,
//         },
//       },
//     ]);

//     console.log('Routines fetched successfully:', routines[0].exercises);

//     return res.status(200).json({
//       success: true,
//       message: 'Routines fetched successfully',
//       count: routines.length,
//       routines,
//     });

//   } catch (error) {
//     console.error('Get All Routines Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch routines',
//       error: error.message,
//     });
//   }
// };
export const deleteRoutine = async (req, res) => {
  try {
    const { routineId } = req.params;
    console.log('Deleting routine with ID:', routineId);

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    // Delete routine
    const deletedRoutine = await Routine.findByIdAndDelete(routineId);

    if (!deletedRoutine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Routine deleted successfully',
      deletedRoutine,
    });

  } catch (error) {
    console.error('Delete Routine Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete routine',
      error: error.message,
    });
  }
};

export const getAllRoutines = async (req, res) => {
  try {
    console.log('Fetching routines for user...');

    const userId = new mongoose.Types.ObjectId(
      '672a1b2c3d4e5f6789012345'
    );

    const routines = await Routine.aggregate([
      {
        $match: { userId },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'exercises',
          localField: 'exercises.exerciseId',
          foreignField: '_id',
          as: 'exerciseDetails',
        },
      },
      {
        $addFields: {
          exercises: {
            $map: {
              input: '$exercises',
              as: 'routineExercise',
              in: {
                $mergeObjects: [
                  '$$routineExercise',
                  {
                    exerciseId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$exerciseDetails',
                            as: 'exercise',
                            cond: {
                              $eq: [
                                '$$exercise._id',
                                '$$routineExercise.exerciseId',
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          goal: 1,
          duration: 1,
          frequency: 1,
          exercises: 1,
          createdAt: 1,
        },
      },
    ]);

    // console.log('Routines fetched successfully:', routines[0].exercises[0].exerciseId.muscleGroup);

    return res.status(200).json({
      success: true,
      message: 'Routines fetched successfully',
      count: routines.length,
      routines,
    });

  } catch (error) {
    console.error('Get All Routines Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch routines',
      error: error.message,
    });
  }
};

export const getExercises = async (req, res) => {
  try {
    console.log('Fetching exercises from the database...', req.query);
    let { SearchedName } = req.query;
    if (SearchedName) {
      SearchedName = SearchedName.trim();
    }
    let Pipeline = [
      {
        $match: { isPublic: true, name: { $regex: SearchedName, $options: 'i' } }
      },
      {
        $sort: { createdAt: 1 }
      },

      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          muscle: "$muscleGroup"
        }
      }
    ]
    // if(SearchedName && SearchedName.length > 0) {


    // }

    const exercises = await Exercise.aggregate(Pipeline);

    // console.log('Exercises fetched successfully:', exercises);

    return res.status(200).json({
      success: true,
      count: exercises.length,
      exercises
    });

  } catch (error) {
    console.error('Get Exercises Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message
    });
  }
};

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

    // Hardcoded user ID
    const userId = new mongoose.Types.ObjectId(
      '672a1b2c3d4e5f6789012345'
    );

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Routine title is required',
      });
    }
    let IsRoutineAlreadyexists = await Routine.findOne({ userId, title: title.trim() });

    if (IsRoutineAlreadyexists) {
      return res.status(400).json({
        success: false,
        message: 'A routine with this title already exists',
      });
    }
    // Validate exercises
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one exercise',
      });
    }

    // Validate exercise IDs
    const exerciseIds = exercises.map(item => item.exerciseId);

    const existingExercises = await Exercise.find({
      _id: { $in: exerciseIds },
    }).select('_id');

    if (existingExercises.length !== new Set(exerciseIds.map(String)).size) {
      return res.status(400).json({
        success: false,
        message: 'One or more exercises do not exist',
      });
    }

    // Prepare routine exercises
    const routineExercises = exercises.map((item, index) => ({
      exerciseId: item.exerciseId,
      order: index + 1,
      sets: Number(item.sets) || 3,
      reps: Number(item.reps) || 12,
      restSeconds: Number(item.restSeconds) || 60,
      notes: item.notes || '',
    }));

    // Create routine
    const newRoutine = await Routine.create({
      userId,
      title: title.trim(),
      goal,
      duration,
      frequency,
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


export const getRoutineById = async (req, res) => {
  try {
    const { routineId } = req.params;

    // const userId = req.user.id;
    const userId = new mongoose.Types.ObjectId(
      '672a1b2c3d4e5f6789012345'
    );

    // Validate routine ID
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID.',
      });
    }

    // Find routine belonging to logged-in user
    const routine = await Routine.findOne({
      _id: routineId,
      userId: userId,
    }).populate({
      path: 'exercises.exerciseId',
      select: 'name muscleGroup equipment type image',
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Routine fetched successfully.',
      routine,
    });

  } catch (error) {
    console.log('Get Routine By ID Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch routine.',
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE ROUTINE
// ==========================================

export const updateRoutine = async (req, res) => {
  try {
    const { routineId } = req.params;

    // const userId = req.user.id;
    const userId = new mongoose.Types.ObjectId(
      '672a1b2c3d4e5f6789012345'
    );

    const {
      title,
      goal,
      duration,
      frequency,
      exercises,
    } = req.body;

    // Validate routine ID
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID.',
      });
    }

    // Validate routine name
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Routine title is required.',
      });
    }

    // Validate exercises
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one exercise.',
      });
    }

    // Validate goal
    const allowedGoals = [
      'Build Muscle',
      'Lose Fat',
      'Endurance',
      'Strength',
    ];

    if (!allowedGoals.includes(goal)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine goal.',
      });
    }

    // Validate all exercise IDs
    for (const item of exercises) {

      if (
        !item.exerciseId ||
        !mongoose.Types.ObjectId.isValid(item.exerciseId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exercise ID.',
        });
      }

      if (
        !Number.isInteger(Number(item.sets)) ||
        Number(item.sets) < 1 ||
        !Number.isInteger(Number(item.reps)) ||
        Number(item.reps) < 1 ||
        !Number.isInteger(Number(item.restSeconds)) ||
        Number(item.restSeconds) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sets, reps or rest time.',
        });
      }
    }

    // Check whether all exercises exist
    const exerciseIds = exercises.map(item =>
      new mongoose.Types.ObjectId(item.exerciseId)
    );

    const existingExercises = await Exercise.find({
      _id: { $in: exerciseIds },
    }).select('_id');

    if (existingExercises.length !== new Set(
      exerciseIds.map(id => id.toString())
    ).size) {
      return res.status(404).json({
        success: false,
        message: 'One or more exercises were not found.',
      });
    }

    // Check routine ownership
    const existingRoutine = await Routine.findOne({
      _id: routineId,
      userId: userId,
    });

    if (!existingRoutine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found.',
      });
    }

    // Prepare updated exercises
    const updatedExercises = exercises.map((item, index) => ({
      exerciseId: item.exerciseId,
      order: index + 1,
      sets: Number(item.sets),
      reps: Number(item.reps),
      restSeconds: Number(item.restSeconds),
      notes: item.notes || '',
    }));

    // Update routine
    const updatedRoutine = await Routine.findOneAndUpdate(
      {
        _id: routineId,
        userId: userId,
      },
      {
        $set: {
          title: title.trim(),
          goal,
          duration,
          frequency,
          exercises: updatedExercises,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'exercises.exerciseId',
      select: 'name muscleGroup equipment type image',
    });

    return res.status(200).json({
      success: true,
      message: 'Routine updated successfully.',
      routine: updatedRoutine,
    });

  } catch (error) {
    console.log('Update Routine Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update routine.',
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

//     const exerciseId = new mongoose.Types.ObjectId(
//       '6af1a7d3c148cbb2eb0220b5'
//     );

//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Routine title is required',
//       });
//     }

//     if (!Array.isArray(exercises) || exercises.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please add at least one exercise',
//       });
//     }

//     // Check whether the hardcoded exercise exists
//     const existingExercise = await Exercise.findById(exerciseId);

//     if (!existingExercise) {
//       return res.status(400).json({
//         success: false,
//         message: 'Exercise does not exist',
//       });
//     }

//     // Assign the same exercise ID to every routine entry
//     const routineExercises = exercises.map((item, index) => ({
//       exerciseId: exerciseId,
//       order: index + 1,
//       sets: Number(item.sets) || 3,
//       reps: Number(item.reps) || 12,
//       restSeconds: Number(item.restSeconds) || 60,
//       notes: item.notes || '',
//     }));

//     const newRoutine = await Routine.create({
//       userId,
//       title: title.trim(),
//       exercises: routineExercises,
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Routine created successfully',
//       routine: newRoutine,
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
