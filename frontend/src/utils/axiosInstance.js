import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API || 'http://localhost:3002/api',
    withCredentials: true, // Quan trọng: cho phép gửi cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - thêm access token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy access token từ Auth Context (sẽ được inject khi dùng)
        const accessToken = window.__ACCESS_TOKEN__;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - tự động refresh token khi 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // KHÔNG retry nếu là refresh-token endpoint để tránh loop
        if (originalRequest.url?.includes('/auth/refresh-token')) {
            return Promise.reject(error);
        }

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Đang refresh, đưa request vào queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi refresh token endpoint
                const response = await axios.post(
                    `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const newToken = response.data.accessToken;
                    window.__ACCESS_TOKEN__ = newToken;
                    
                    // Process tất cả requests đang chờ
                    processQueue(null, newToken);
                    
                    // Thử lại request ban đầu với token mới
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token thất bại -> logout
                processQueue(refreshError, null);
                window.__ACCESS_TOKEN__ = null;
                
                // Chỉ redirect nếu không phải đang ở trang login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
