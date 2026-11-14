
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createRoutine } from '../controllers/workoutcontroller.js'
import { getExercises } from '../controllers/workoutcontroller.js';
import {getAllRoutines} from '../controllers/workoutcontroller.js';
import {logWorkout} from '../controllers/workoutcontroller.js';
import {getWorkoutByRoutineId} from '../controllers/workoutcontroller.js';
import {deleteRoutine,getRoutineById,
    updateRoutine,
} from '../controllers/workoutcontroller.js';
// import authMiddleware from "../middleware/"
const routineRoutes = express.Router();

// CREATE NEW ROUTINE
routineRoutes.post('/log', authMiddleware, logWorkout);
routineRoutes.post('/newroutine',authMiddleware, createRoutine);
routineRoutes.get('/getAllRoutines',authMiddleware, getAllRoutines);
routineRoutes.get('/getWorkoutByRoutineId/:routineId', authMiddleware, getWorkoutByRoutineId);
routineRoutes.delete('/deleteRoutine/:routineId', authMiddleware, deleteRoutine);
routineRoutes.get(
    '/getRoutineById/:routineId',
    authMiddleware,
  
    getRoutineById
);

// PUT: Update routine
routineRoutes.put(
    '/updateRoutine/:routineId',
    authMiddleware,
    
    updateRoutine
);



routineRoutes.get('/getExercises', authMiddleware, getExercises);
export default routineRoutes;
