
import express from 'express';

import { createRoutine } from '../controllers/workoutcontroller.js'
// import authMiddleware from "../middleware/"
const routineRoutes = express.Router();

// CREATE NEW ROUTINE
routineRoutes.post('/newroutine', createRoutine);

export default routineRoutes;
