
import express from 'express';

import { createRoutine } from '../controllers/workoutcontroller.js'
import { getExercises } from '../controllers/workoutcontroller.js';
import {getAllRoutines} from '../controllers/workoutcontroller.js';
import {deleteRoutine,getRoutineById,
    updateRoutine,
} from '../controllers/workoutcontroller.js';
// import authMiddleware from "../middleware/"
const routineRoutes = express.Router();

// CREATE NEW ROUTINE
routineRoutes.post('/newroutine', createRoutine);
routineRoutes.get('/getAllRoutines', getAllRoutines);
routineRoutes.delete('/deleteRoutine/:routineId', deleteRoutine);
routineRoutes.get(
    '/getRoutineById/:routineId',
  
    getRoutineById
);

// PUT: Update routine
routineRoutes.put(
    '/updateRoutine/:routineId',
    
    updateRoutine
);



routineRoutes.get('/getExercises', getExercises);
export default routineRoutes;
