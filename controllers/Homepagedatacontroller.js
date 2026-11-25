import WorkoutSession from "../models/WorkoutSession.js"

export const todaysactivity = async (req, res) => {
  try {
    console.log("todays activity")
    const userId = req.user.id;

    // Get today's date according to Indian Standard Time
    const now = new Date();
    const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);

    const startOfDay = new Date(Date.UTC(
      istTime.getUTCFullYear(),
      istTime.getUTCMonth(),
      istTime.getUTCDate()
    ) - (5 * 60 + 30) * 60 * 1000);

    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Fetch today's completed workout sessions
    const todaysWorkouts = await WorkoutSession.find({
      userId,
      status: 'completed',
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).select('routineName date durationMinutes totalSets');

    const workoutsCompleted = todaysWorkouts.length;

    const totalDuration = todaysWorkouts.reduce(
      (total, workout) => total + (workout.durationMinutes || 0),
      0
    );
console.log('todaysWorkouts',todaysWorkouts)
    return res.status(200).json({
      success: true,
      message: 'Today activity fetched successfully',
      data: {
        hasCompletedWorkoutToday: workoutsCompleted > 0,
        workoutsCompleted,
        totalDuration,
        workouts: todaysWorkouts,
      },
    });

  } catch (error) {
    console.error('Todays activity error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch today activity',
      error: error.message,
    });
  }
};

// import WorkoutSession from '../models/WorkoutSession.js';

export const weeklyActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Current date in IST
    const now = new Date();
    const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);

    // Get Monday of the current week
    const dayOfWeek = istTime.getUTCDay();
    const daysFromMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(istTime);
    monday.setUTCDate(istTime.getUTCDate() - daysFromMonday);
    monday.setUTCHours(0, 0, 0, 0);

    // Convert IST Monday to UTC
    const startOfWeek = new Date(monday.getTime() - (5 * 60 + 30) * 60 * 1000);

    // End of current week (next Monday)
    const endOfWeek = new Date(
      startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000)
    );

    // Fetch completed workouts for this week
    const workouts = await WorkoutSession.find({
      userId,
      status: 'completed',
      date: {
        $gte: startOfWeek,
        $lt: endOfWeek,
      },
    }).select('date');

    // Create Monday-Sunday activity array
    const weeklyActivity = [];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    days.forEach((day, index) => {
      const activityDate = new Date(monday);
      activityDate.setUTCDate(monday.getUTCDate() + index);

      const dayStart = new Date(
        Date.UTC(
          activityDate.getUTCFullYear(),
          activityDate.getUTCMonth(),
          activityDate.getUTCDate()
        ) - (5 * 60 + 30) * 60 * 1000
      );

      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= dayStart && workoutDate < dayEnd;
      });

      weeklyActivity.push({
        day,
        date: activityDate.toISOString().split('T')[0],
        completed: dayWorkouts.length > 0,
        workoutCount: dayWorkouts.length,
      });
    });

    const weeklyWorkoutCount = workouts.length;

    return res.status(200).json({
      success: true,
      message: 'Weekly activity fetched successfully',
      data: {
        weeklyActivity,
        weeklyWorkoutCount,
      },
    });

  } catch (error) {
    console.error('Weekly activity error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly activity',
      error: error.message,
    });
  }
};

// import WorkoutSession from '../models/WorkoutSession.js';

export const getRecentWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest 3 completed workouts
    const workouts = await WorkoutSession.find({
      userId,
      status: 'completed',
    })
      .sort({ date: -1 })
      .limit(3)
      .select('routineName date durationMinutes exercises');

    const recentWorkouts = workouts.map(workout => {
      // Get unique muscle groups
      const muscleGroups = [
        ...new Set(
          workout.exercises
            .map(exercise => exercise.muscleGroup)
            .filter(Boolean)
        ),
      ];

      // Convert date to IST
      const workoutDate = new Date(workout.date);
      const istDate = new Date(
        workoutDate.getTime() + (5 * 60 + 30) * 60 * 1000
      );

      const today = new Date();
      const todayIST = new Date(
        today.getTime() + (5 * 60 + 30) * 60 * 1000
      );

      const todayString = todayIST.toISOString().split('T')[0];
      const workoutDateString = istDate.toISOString().split('T')[0];

      const yesterday = new Date(todayIST);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      let dateLabel;

      if (workoutDateString === todayString) {
        dateLabel = 'Today';
      } else if (workoutDateString === yesterdayString) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = istDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        });
      }

      return {
        id: workout._id,
        title: workout.routineName,
        details: muscleGroups.length
          ? muscleGroups.join(', ')
          : 'Workout',
        date: dateLabel,
        duration: `${workout.durationMinutes || 0} min`,
        icon: 'barbell-outline',
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Recent workouts fetched successfully',
      data: recentWorkouts,
    });

  } catch (error) {
    console.error('Get recent workouts error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent workouts',
      error: error.message,
    });
  }
};