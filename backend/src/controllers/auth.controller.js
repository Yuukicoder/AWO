import {login, register, refreshTokenService} from '../service/auth.service.js';


export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try{
        const result = await login(email, password);
        
        // Lưu Refresh Token vào HTTP-Only Cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ HTTPS trong production
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Chỉ trả Access Token trong response body
        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            accessToken: result.accessToken,
            user: result.user
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const registerController = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const result = await register({ name, email, password, role });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: result.user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        const result = await refreshTokenService(refreshToken);
        
        // Cập nhật Refresh Token mới vào cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.status(200).json({
            success: true,
            accessToken: result.accessToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const logoutController = async (req, res) => {
    try {
        // Xóa refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

