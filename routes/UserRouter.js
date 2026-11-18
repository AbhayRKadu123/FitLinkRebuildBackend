import { getProfileData } from "../controllers/ProfileController";
const userRoutes = express.Router();

userRoutes.get('/profile-data', verifyToken, getProfileData);