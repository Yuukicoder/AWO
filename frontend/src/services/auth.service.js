import axiosInstance from '../utils/axiosInstance';

/**
 * Authentication Service
 * Xử lý tất cả các API calls liên quan đến authentication
 */

export const authService = {
    login: async (email, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', {
                email,
                password
            });
            console.log("Response from login:", response);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng nhập thất bại',
                error: error
            };
        }
    },
    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/register', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng ký thất bại',
                error: error
            };
        }
    },
    refreshToken: async () => {
        try {
            const response = await axiosInstance.post('/auth/refresh-token');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Refresh token thất bại',
                error: error
            };
        }
    },
    logout: async () => {
        try {
            const response = await axiosInstance.post('/auth/logout');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng xuất thất bại',
                error: error
            };
        }
    },

    /**
     * Kiểm tra session hiện tại
     * @returns {Promise} Session status
     */
    checkSession: async () => {
        try {
            const response = await axiosInstance.post('/auth/refresh-token');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            // Không throw error nếu là 401 (no session)
            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'No active session'
                };
            }
            throw error;
        }
    }
};

export default authService;
