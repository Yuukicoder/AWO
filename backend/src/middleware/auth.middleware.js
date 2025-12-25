import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';

export const authenticate = async (req, res, next) => {
    try{
    const authHeader = req.headers.authorization?.split(' ')[1];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(authHeader, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const authorize = (roles = []) => {
    if(typeof roles === "string"){
        roles = [roles];
    }
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({message: "Not authenticated"});
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

