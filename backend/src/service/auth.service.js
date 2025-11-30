import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';
import AuthRepository from '../repository/Auth.repository.js';

const authRepo = new AuthRepository();


// tạo token cho account user
export const generateToken = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

//basic login service
// Todo: thêm chức năng ghi log đăng nhập thất bại,
 // giới hạn số lần đăng nhập thất bại để tránh tấn công brute-force
 // check refresh token của model
export const login = async(email, password) => {
    const user = await authRepo.login(email, password);
    if(!user){
        throw new Error('User not found');
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        throw new Error('Invalid password');
    }
    return generateToken(user);
};