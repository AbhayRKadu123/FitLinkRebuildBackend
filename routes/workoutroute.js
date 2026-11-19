
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
import  {  getPreviousWorkoutByRoutineId} from "../controllers/workoutcontroller.js"
import {updateWorkoutSession} from '../controllers/workoutcontroller.js';
import {createWorkoutSession} from '../controllers/workoutcontroller.js';
import { getWorkoutSessionById } from '../controllers/workoutcontroller.js';
// import authMiddleware from "../middleware/"
import {getWorkoutHistory} from '../controllers/workoutcontroller.js';
import {getTodayWorkoutSession} from '../controllers/workoutcontroller.js';
const routineRoutes = express.Router();

// CREATE NEW ROUTINE
routineRoutes.get('/getExercises', authMiddleware, getExercises);

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
routineRoutes.get(
  '/previous/:routineId',
  authMiddleware,
  getPreviousWorkoutByRoutineId
);
routineRoutes.get('/history', authMiddleware, getWorkoutHistory);
// PUT: Update routine
routineRoutes.get(
  '/today/:routineId',
  authMiddleware,
  getTodayWorkoutSession
);
routineRoutes.put('/:sessionId', authMiddleware, updateWorkoutSession);
routineRoutes.get('/:sessionId', authMiddleware, getWorkoutSessionById);

// getWorkoutSessionById
// routineRoutes.post('/log', verifyToken, createWorkoutSession);
routineRoutes.put(
    '/updateRoutine/:routineId',
    authMiddleware,
    
    updateRoutine
);



export default routineRoutes;
