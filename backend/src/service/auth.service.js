import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import AuthRepository from '../repository/Auth.repository.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

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
    const tokens = generateToken(user);
    
    // Cập nhật refresh token vào database
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    // Loại bỏ password trước khi trả về
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();
    
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userWithoutSensitiveData
    };
};
// register service
export const register = async({name,email, password, role}) =>{
    if(!name || !email || !password){
        throw new Error("Missing required field!")
    }

    // Hash password
    const hashed = await bcrypt.hash(password,12);
    password = hashed;

    const user = await authRepo.register({
        name, 
        email,
        password,
        role: role || "member"
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Cập nhật refresh token vào database
    user.refreshToken = refreshToken;
    await user.save();
    
    //  Loại bỏ password và refreshToken trước khi trả về client
    const {password: _, refreshToken: __, ...userWithoutPassword} = user.toObject();
   
    return {
        user: userWithoutPassword, 
        accessToken, 
        refreshToken
    };
};

// Refresh token service
export const refreshTokenService = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Tìm user và kiểm tra refresh token có khớp không
        const user = await User.findOne({ 
            _id: decoded.id, 
            refreshToken: refreshToken,
            isDeleted: false 
        });
        
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        
        // Generate tokens mới
        const tokens = generateToken(user);
        
        // Cập nhật refresh token mới vào database
        user.refreshToken = tokens.refreshToken;
        await user.save();
        
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};