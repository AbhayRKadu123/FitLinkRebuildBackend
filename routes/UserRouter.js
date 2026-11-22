import { getProfileData,GetUserDetail } from "../controllers/ProfileController.js";
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
const userRoutes = express.Router();

userRoutes.get('/profile-data', authMiddleware, getProfileData);
userRoutes.get('/GetUserDetail', authMiddleware, GetUserDetail);

// GetUserDetail
export default userRoutes;