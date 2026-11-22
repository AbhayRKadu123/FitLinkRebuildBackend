import mongoose from 'mongoose';
import User from '../models/User.js';
import WorkoutSession from '../models/WorkoutSession.js';
import GetUserDetails from '../utils/GetUserDetails.js';
// import User from '../models/User.js';
export const getProfileData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("GetUserDetail",GetUserDetail)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Fetch user details
    const user = await User.findById(objectUserId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count completed workouts
    const totalWorkouts = await WorkoutSession.countDocuments({
      userId: objectUserId,
      status: 'completed',
    });

    // Calculate total reps and total lifted weight
    const workoutStats = await WorkoutSession.aggregate([
      {
        $match: {
          userId: objectUserId,
          status: 'completed',
        },
      },
      {
        $unwind: '$exercises',
      },
      {
        $unwind: '$exercises.sets',
      },
      {
        $match: {
          'exercises.sets.isCompleted': { $ne: false },
        },
      },
      {
        $group: {
          _id: null,

          totalReps: {
            $sum: '$exercises.sets.reps',
          },

          totalWeight: {
            $sum: {
              $multiply: [
                '$exercises.sets.weight',
                '$exercises.sets.reps',
              ],
            },
          },
        },
      },
    ]);

    const stats = workoutStats[0] || {
      totalReps: 0,
      totalWeight: 0,
    };

    return res.status(200).json({
      success: true,
      message: 'Profile data fetched successfully',

      data: {
        name: user.name,
        email: user.email,

        workouts: totalWorkouts,
        totalReps: stats.totalReps,
        totalWeight: stats.totalWeight,

        goal: user.goal || 'Not set',
        calories: user.calories || 0,
        protein: user.protein || 0,
      },
    });

  } catch (error) {
    console.error('Get profile data error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile data',
      error: error.message,
    });
  }
};
export const GetUserDetail = async (req, res) => {
  try {
    const userDetails = await GetUserDetails(req.user.id);
    console.log("get user details",userDetails)

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: userDetails,
    });

  } catch (err) {
    console.error("GetUserDetail Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};