import User from '../models/User.js';
const GetUserDetails = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return null;
        }

        return user;

    } catch (error) {
        console.log('Get User Details Error:', error);
        throw error;
    }
};

export default GetUserDetails;