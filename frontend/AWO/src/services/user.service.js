import axiosInstance from '../utils/axiosInstance';

export const userService = {
 
    getProfile: async () => {
        try {
            const response = await axiosInstance.get('/users/profile');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy thông tin profile',
                error: error
            };
        }
    },


    updateProfile: async (userData) => {
        try {
            const response = await axiosInstance.put('/users/profile', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Cập nhật profile thất bại',
                error: error
            };
        }
    },

  
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await axiosInstance.put('/users/change-password', {
                currentPassword,
                newPassword
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
                error: error
            };
        }
    },

    getUsers: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/users', { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách users',
                error: error
            };
        }
    },


    getUserById: async (userId) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy thông tin user',
                error: error
            };
        }
    }
};

export default userService;
