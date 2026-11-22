
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import routineRoutes from './routes/workoutroute.js';
import userRoutes from './routes/UserRouter.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', async (req, res) => {
    res.status(200).send('FitLink Backend is running!');
});
app.use('/api/userinfo', userRoutes);

app.use('/api/routines', routineRoutes);

app.use('/api/auth', authRoutes);
// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();
