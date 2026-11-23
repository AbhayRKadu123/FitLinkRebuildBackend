import {todaysactivity,weeklyActivity} from "../controllers/Homepagedatacontroller.js"
import authMiddleware from "../middleware/authMiddleware.js";
import express from 'express';
let homepagerouter=express.Router();
homepagerouter.get('/todays-activity', authMiddleware, todaysactivity);
homepagerouter.get('/weekly-activity', authMiddleware, weeklyActivity);
export default homepagerouter;
