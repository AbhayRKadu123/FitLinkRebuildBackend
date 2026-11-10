
import mongoose from 'mongoose';
import seedExercises from '../utils/seedExercises.js';
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await seedExercises();

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
