
import mongoose from 'mongoose';

import Routine from '../models/routineExerciseSchema.js';
import Exercise from '../models/Exercises.js';
import GetUserDetails from '../utils/GetUserDetails.js';
import WorkoutSession from '../models/WorkoutSession.js';

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

// import mongoose from 'mongoose';
export const getPreviousWorkoutByRoutineId = async (req, res) => {
  try {
    const { routineId } = req.params;
    const userId = req.user.id;

    console.log('Fetching previous workout for routine:', routineId);

    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    // Calculate start of today in India (IST)
    const now = new Date();
    const indiaOffset = 330 * 60 * 1000;

    const indiaNow = new Date(now.getTime() + indiaOffset);

    const startOfToday = new Date(
      Date.UTC(
        indiaNow.getUTCFullYear(),
        indiaNow.getUTCMonth(),
        indiaNow.getUTCDate()
      ) - indiaOffset
    );

    // Find the latest completed session before today
    const previousWorkout = await WorkoutSession.findOne({
      userId,
      routineId,
      status: 'completed',
      date: { $lt: startOfToday },
    }).sort({
      date: -1,
      createdAt: -1,
    });

    if (!previousWorkout) {
      return res.status(200).json({
        success: true,
        message: 'No previous workout found',
        data: null,
      });
    }
console.log("previousWorkout is ",previousWorkout)
    return res.status(200).json({
      success: true,
      message: 'Previous workout fetched successfully',
      data: previousWorkout,
    });

  } catch (error) {
    console.error('Previous workout error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch previous workout',
      error: error.message,
    });
  }
};
export const getWorkoutByRoutineId = async (req, res) => {
  try {
    let { routineId } = req.params;

    console.log('Fetching workout for routine:', routineId);

    // Validate routine ID
    if (routineId) {
      routineId = new mongoose.Types.ObjectId(routineId);

    }
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    // Find routine and populate exercises
   const routine = await Routine.findOne({
  _id: routineId,
  // userId: req.user.id,
}).populate({
  path: 'exercises.exerciseId',
  model: 'Exercise',
});
    console.log('Routine fetched successfully:', routine?.exercises);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workout fetched successfully',
      data: routine,
    });

  } catch (error) {
    console.error('Get Workout Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch workout',
      error: error.message,
    });
  }
};

export const updateWorkoutSession = async (req, res) => {
  try {
    console.log('Updating workout session...', req.body);

    const { sessionId } = req.params;
    const userId = req.user.id;

    const {
      routineId,
      routineName,
      endTime,
      durationMinutes,
      exercises,
      notes,
      status,
    } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    if (!routineName || !routineName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Routine name is required',
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one exercise is required',
      });
    }

    // Calculate today's date range in India time
    const now = new Date();
    const indiaOffset = 330 * 60 * 1000;
    const indiaNow = new Date(now.getTime() + indiaOffset);

    const startOfDay = new Date(Date.UTC(
      indiaNow.getUTCFullYear(),
      indiaNow.getUTCMonth(),
      indiaNow.getUTCDate()
    ) - indiaOffset);

    const endOfDay = new Date(
      startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1
    );

    // Find today's session belonging to this user and routine
    const session = await WorkoutSession.findOne({
      _id: sessionId,
      userId,
      routineId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found for today',
      });
    }

    // Format exercises
    const formattedExercises = [];
    let totalSets = 0;

    for (const exercise of exercises) {
      if (
        !exercise.exerciseId ||
        !mongoose.Types.ObjectId.isValid(exercise.exerciseId)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid exercise ID for ${exercise.exerciseName || 'exercise'}`,
        });
      }

      if (!exercise.exerciseName || !Array.isArray(exercise.sets)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exercise data',
        });
      }

      const formattedSets = [];

      for (const [index, set] of exercise.sets.entries()) {
        const weightEmpty = set.weight === '' || set.weight == null;
        const repsEmpty = set.reps === '' || set.reps == null;

        // Skip empty sets
        if (weightEmpty && repsEmpty) {
          continue;
        }

        // Require both values
        if (weightEmpty || repsEmpty) {
          return res.status(400).json({
            success: false,
            message: `Enter both weight and reps for ${exercise.exerciseName}, Set ${index + 1}`,
          });
        }

        const weight = Number(set.weight);
        const reps = Number(set.reps);

        if (
          !Number.isFinite(weight) ||
          weight < 0 ||
          !Number.isInteger(reps) ||
          reps < 1
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid weight or reps for ${exercise.exerciseName}, Set ${index + 1}`,
          });
        }

        formattedSets.push({
          setNumber: Number(set.setNumber) || index + 1,
          weight,
          reps,
          isCompleted: true,
        });
      }

      // Skip exercises without completed sets
      if (formattedSets.length > 0) {
        totalSets += formattedSets.length;

        formattedExercises.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup || '',
          sets: formattedSets,
        });
      }
    }

    if (formattedExercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enter at least one completed set',
      });
    }

    // Validate end time
    const parsedEndTime = endTime ? new Date(endTime) : null;

    if (parsedEndTime && Number.isNaN(parsedEndTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end time',
      });
    }

    // Calculate duration using original start time
    let calculatedDuration = Number(durationMinutes) || 0;

    if (parsedEndTime) {
      calculatedDuration = Math.max(
        0,
        Math.round(
          (parsedEndTime - session.startTime) / 60000
        )
      );
    }

    // Update existing session
    session.routineName = routineName.trim();
    session.exercises = formattedExercises;
    session.notes = notes || '';
    session.totalSets = totalSets;
    session.endTime = parsedEndTime;
    session.durationMinutes = calculatedDuration;

    if (status) {
      if (!['completed', 'in-progress'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid workout status',
        });
      }

      session.status = status;
    }

    await session.save();

    console.log('Workout session updated:', session._id);

    return res.status(200).json({
      success: true,
      message: 'Workout session updated successfully',
      data: session,
    });

  } catch (error) {
    console.error('Update Workout Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update workout session',
    });
  }
};


export const logWorkout = async (req, res) => {
  try {
    console.log('Saving workout session...', req.body);

    const userId = req.user.id;

    let {
      routineId,
      routineName,
      date,
      startTime,
      endTime,
      durationMinutes,
      exercises,
      notes,
      status,
    } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authenticated user',
      });
    }

    if (!routineName || !routineName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Routine name is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one exercise is required',
      });
    }

    // India date range
    const now = new Date();
    const indiaOffset = 330 * 60 * 1000;
    const indiaNow = new Date(now.getTime() + indiaOffset);

    const startOfDay = new Date(Date.UTC(
      indiaNow.getUTCFullYear(),
      indiaNow.getUTCMonth(),
      indiaNow.getUTCDate()
    ) - indiaOffset);

    const endOfDay = new Date(
      startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1
    );

    // Prevent duplicate session
    const existingSession = await WorkoutSession.findOne({
      userId,
      routineId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: 'Workout already exists today. Update the existing session.',
        data: existingSession,
      });
    }

    let totalSets = 0;
    const formattedExercises = [];

    for (const exercise of exercises) {
      if (
        !exercise.exerciseId ||
        !mongoose.Types.ObjectId.isValid(exercise.exerciseId)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid exercise ID for ${exercise.exerciseName || 'exercise'}`,
        });
      }

      if (!exercise.exerciseName || !Array.isArray(exercise.sets)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exercise data',
        });
      }

      const formattedSets = [];

      for (const [index, set] of exercise.sets.entries()) {
        const weightEmpty = set.weight === '' || set.weight == null;
        const repsEmpty = set.reps === '' || set.reps == null;

        // Skip completely empty sets
        if (weightEmpty && repsEmpty) {
          continue;
        }

        // Both weight and reps are required
        if (weightEmpty || repsEmpty) {
          return res.status(400).json({
            success: false,
            message: `Enter both weight and reps for ${exercise.exerciseName}, Set ${index + 1}`,
          });
        }

        const weight = Number(set.weight);
        const reps = Number(set.reps);

        if (
          !Number.isFinite(weight) ||
          weight < 0 ||
          !Number.isInteger(reps) ||
          reps < 1
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid weight or reps for ${exercise.exerciseName}, Set ${index + 1}`,
          });
        }

        formattedSets.push({
          setNumber: Number(set.setNumber) || index + 1,
          weight,
          reps,
          isCompleted: true,
        });
      }

      // Ignore exercises with no completed sets
      if (formattedSets.length > 0) {
        totalSets += formattedSets.length;

        formattedExercises.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup || '',
          sets: formattedSets,
        });
      }
    }

    if (formattedExercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enter at least one completed set',
      });
    }

    // Validate workout times
    const parsedStartTime = startTime
      ? new Date(startTime)
      : new Date();

    const parsedEndTime = endTime
      ? new Date(endTime)
      : null;

    if (
      Number.isNaN(parsedStartTime.getTime()) ||
      (parsedEndTime && Number.isNaN(parsedEndTime.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workout time',
      });
    }

    let calculatedDuration = Number(durationMinutes) || 0;

    if (parsedEndTime) {
      calculatedDuration = Math.max(
        0,
        Math.round((parsedEndTime - parsedStartTime) / 60000)
      );
    }

    const newSession = await WorkoutSession.create({
      userId,
      routineId,
      routineName: routineName.trim(),
      date: date ? new Date(date) : new Date(),
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      durationMinutes: calculatedDuration,
      exercises: formattedExercises,
      notes: notes || '',
      totalSets,
      status: status || 'completed',
    });

    return res.status(201).json({
      success: true,
      message: 'Workout session saved successfully',
      data: newSession,
    });

  } catch (error) {
    console.error('Log Workout Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save workout session',
    });
  }
};


// export const logWorkout = async (req, res) => {
//   try {
//     console.log('Saving workout session...', req.body);

//     // Get authenticated user ID from JWT middleware
//     let userId = req.user.id;
//     userId = new mongoose.Types.ObjectId(
//       userId
//     );
//    let{
//       routineId,
//       routineName,
//       date,
//       startTime,
//       endTime,
//       durationMinutes,
//       exercises,
//       notes,
//     } = req.body;

//     // Validate required fields
//     if (!routineName || !routineName.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Routine name is required',
//       });
//     }

//     if (!Array.isArray(exercises) || exercises.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one exercise is required',
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid authenticated user',
//       });
//     }
//     if (routineId) {
//       routineId = new mongoose.Types.ObjectId(routineId);
//     }
//     // Validate routine ID if supplied
//     if (
//       routineId &&
//       !mongoose.Types.ObjectId.isValid(routineId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid routine ID',
//       });
//     }

//     // Validate and prepare exercises
//     let totalSets = 0;
// console.log('Received exercises:', JSON.stringify(exercises, null, 2));
//     const formattedExercises = exercises.map((exercise) => {
//       if (
//         !exercise.exerciseId ||
//         !mongoose.Types.ObjectId.isValid(exercise.exerciseId)
//       ) {
//         throw new Error(
//           `Invalid exercise ID for ${exercise.exerciseName || 'exercise'}`
//         );
//       }

//       if (
//         !exercise.exerciseName ||
//         !Array.isArray(exercise.sets) ||
//         exercise.sets.length === 0
//       ) {
//         throw new Error(
//           `Invalid exercise data for ${exercise.exerciseName || 'exercise'}`
//         );
//       }

//       totalSets += exercise.sets.length;

//       return {
//         exerciseId: exercise.exerciseId,
//         exerciseName: exercise.exerciseName,
//         muscleGroup: exercise.muscleGroup || '',

//         sets: exercise.sets.map((set, index) => {
//           const weight = Number(set.weight);
//           const reps = Number(set.reps);

//           if (
//             !Number.isFinite(weight) ||
//             weight < 0 ||
//             !Number.isInteger(reps) ||
//             reps <= 0
//           ) {
//             throw new Error(
//               `Invalid weight or reps in ${exercise.exerciseName}, Set ${index + 1}`
//             );
//           }

//           return {
//             setNumber: index + 1,
//             weight,
//             reps,
//             isCompleted: set.isCompleted ?? true,
//           };
//         }),
//       };
//     });

//     // Calculate duration when endTime is provided
//     const parsedStartTime = startTime
//       ? new Date(startTime)
//       : new Date();

//     const parsedEndTime = endTime
//       ? new Date(endTime)
//       : null;

//     if (
//       Number.isNaN(parsedStartTime.getTime()) ||
//       (parsedEndTime && Number.isNaN(parsedEndTime.getTime()))
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid workout time',
//       });
//     }

//     let calculatedDuration = Number(durationMinutes) || 0;

//     if (parsedEndTime) {
//       calculatedDuration = Math.max(
//         0,
//         Math.round(
//           (parsedEndTime - parsedStartTime) / 60000
//         )
//       );
//     }

//     // Create workout session
//     const newSession = await WorkoutSession.create({
//       userId,

//       routineId: routineId || null,
//       routineName: routineName.trim(),

//       date: date ? new Date(date) : new Date(),
//       startTime: parsedStartTime,
//       endTime: parsedEndTime,

//       durationMinutes: calculatedDuration,

//       exercises: formattedExercises,

//       notes: notes || '',

//       totalSets,

//       status: 'completed',
//     });

//     console.log('Workout session saved:', newSession._id);

//     return res.status(201).json({
//       success: true,
//       message: 'Workout session saved successfully',

//       data: newSession,
//     });

//   } catch (error) {
//     console.error('Log Workout Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to save workout session',
//     });
//   }
// };


export const getAllRoutines = async (req, res) => {
  try {
    console.log('Fetching routines for user...', req.user);
    let { Category } = req.query;
    let userDetails = await GetUserDetails(req.user.id);
    console.log('User details fetched successfully:', userDetails);
    if (Category) {
      Category = Category.trim();

    }
    if (Category == 'All') {
      Category = '';
    }
    const userId = new mongoose.Types.ObjectId(
      req.user.id
    );

    const routines = await Routine.aggregate([
      {
        $match: { userId, goal: { $regex: Category, $options: 'i' } },
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

    console.log('Exercises fetched successfully:', exercises);

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
export const deleteWorkoutHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const deletedSession = await WorkoutSession.findOneAndDelete({
      _id: sessionId,
      userId: userId,
    });

    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: "Workout history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workout history deleted successfully",
    });

  } catch (error) {
    console.log("Delete workout history error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
      req.user.id
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
      req.user.id
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
      req.user.id
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
export const getTodayWorkoutSession = async (req, res) => {
  try {
    const { routineId } = req.params;
    const userId = req.user.id;
console.log('Fetching today workout session for user:', userId, 'and routine:', routineId);
    // Validate routine ID
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's workout session
    const session = await WorkoutSession.findOne({
      userId,
      routineId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: session
        ? 'Workout session found'
        : 'No workout session found today',
      data: session,
    });

  } catch (error) {
    console.error('Get today workout session error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch today workout session',
      error: error.message,
    });
  }
}
export const createWorkoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      routineId,
      routineName,
      date,
      startTime,
      notes,
      exercises,
      status,
    } = req.body;

    // Validate routine ID
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid routine ID',
      });
    }

    if (!routineName || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Routine name and exercises are required',
      });
    }

    // Calculate today's date range in India time
    const now = new Date();
    const indiaOffset = 330 * 60 * 1000;
    const indiaNow = new Date(now.getTime() + indiaOffset);

    const startOfDay = new Date(Date.UTC(
      indiaNow.getUTCFullYear(),
      indiaNow.getUTCMonth(),
      indiaNow.getUTCDate()
    ) - indiaOffset);

    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Prevent duplicate sessions for the same routine on the same day
    const existingSession = await WorkoutSession.findOne({
      userId,
      routineId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: 'A workout session already exists for this routine today. Update the existing session instead.',
        data: existingSession,
      });
    }

    // Keep only exercises containing at least one valid set
    const formattedExercises = [];

    for (const exercise of exercises) {
      if (!mongoose.Types.ObjectId.isValid(exercise.exerciseId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid exercise ID for ${exercise.exerciseName || 'exercise'}`,
        });
      }

      if (!exercise.exerciseName) {
        return res.status(400).json({
          success: false,
          message: 'Exercise name is required',
        });
      }

      const validSets = (exercise.sets || [])
        .filter(set => set.weight !== '' && set.weight != null &&
                       set.reps !== '' && set.reps != null)
        .map((set, index) => {
          const weight = Number(set.weight);
          const reps = Number(set.reps);

          if (!Number.isFinite(weight) || weight < 0 ||
              !Number.isInteger(reps) || reps < 1) {
            throw new Error(`Invalid weight or reps for ${exercise.exerciseName}`);
          }

          return {
            setNumber: Number(set.setNumber) || index + 1,
            weight,
            reps,
            isCompleted: true,
          };
        });

      // Skip exercises where no sets were entered
      if (validSets.length > 0) {
        formattedExercises.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup || '',
          sets: validSets,
        });
      }
    }

    if (formattedExercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enter at least one completed set',
      });
    }

    const totalSets = formattedExercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );

    const session = await WorkoutSession.create({
      userId,
      routineId,
      routineName: routineName.trim(),
      date: date ? new Date(date) : new Date(),
      startTime: startTime ? new Date(startTime) : new Date(),
      notes: notes || '',
      exercises: formattedExercises,
      totalSets,
      status: status || 'completed',
    });

    return res.status(201).json({
      success: true,
      message: 'Workout session created successfully',
      data: session,
    });

  } catch (error) {
    console.error('Create workout session error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create workout session',
    });
  }
};
export const getWorkoutHistory = async (req, res) => {
  try {
    console.log('Fetching workout history for user:')
    const userId = req.user.id;
    const { filter = 'All Time' } = req.query;

    let startDate = null;
    const now = new Date();

    // Apply date filter
    if (filter === 'This Month') {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    } 
    else if (filter === 'Last 3 Months') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
    } 
    else if (filter === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    else if (filter !== 'All Time') {
      return res.status(400).json({
        success: false,
        message: 'Invalid history filter',
      });
    }

    // Build query
    const query = {
      userId,
      status: 'completed',
    };

    if (startDate) {
      query.date = { $gte: startDate };
    }

    // Fetch workout sessions
    const workouts = await WorkoutSession.find(query)
      .sort({ date: -1 })
      .lean();

    // Calculate statistics
    const totalWorkouts = workouts.length;

    const totalMinutes = workouts.reduce(
      (total, workout) =>
        total + (workout.durationMinutes || 0),
      0
    );

    // Calculate weekly workout trend (last 7 weeks)
    const weeklyTrend = [];

    const currentWeek = new Date(now);
    const day = currentWeek.getDay();

    // Set Monday as start of week
    currentWeek.setDate(
      currentWeek.getDate() - ((day + 6) % 7)
    );
    currentWeek.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);

        return (
          workoutDate >= weekStart &&
          workoutDate < weekEnd
        );
      }).length;

      weeklyTrend.push({
        week: `W${7 - i}`,
        count,
      });
    }

    // Format history cards
    const history = workouts.map((workout) => ({
      _id: workout._id,
      routineId: workout.routineId,
      name: workout.routineName,
      exercises: workout.exercises?.length || 0,
      duration: workout.durationMinutes || 0,
      totalSets: workout.totalSets || 0,
      date: workout.date,
      status: workout.status,
    }));

    return res.status(200).json({
      success: true,
      message: 'Workout history fetched successfully',

      data: {
        statistics: {
          totalWorkouts,
          totalMinutes,
        },

        weeklyTrend,

        history,
      },
    });

  } catch (error) {
    console.error('Get Workout History Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch workout history',
      error: error.message,
    });
  }
};
export const getWorkoutSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    console.log("getWorkoutSessionById")

    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    // Find session belonging to the logged-in user
    const session = await WorkoutSession.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout history not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workout history fetched successfully',
      data: session,
    });

  } catch (error) {
    console.error('Get workout history error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch workout history',
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
