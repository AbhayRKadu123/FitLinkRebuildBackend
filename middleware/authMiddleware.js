
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        console.log('Token:', token); // Debugging: Log the token

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user details to request
        req.user = decoded;

        next();

    } catch (error) {
        console.log('Authentication Error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

export default authMiddleware;
