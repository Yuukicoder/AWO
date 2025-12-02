import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);

    // Sync accessToken to window for axios interceptor
    useEffect(() => {
        window.__ACCESS_TOKEN__ = accessToken;
    }, [accessToken]);

    // Khôi phục session khi app load - CHỈ CHẠY 1 LẦN
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        // Ngăn gọi nhiều lần đồng thời
        if (isCheckingAuth) return;
        
        setIsCheckingAuth(true);
        try {
            // Thử refresh token để kiểm tra session
            const result = await authService.checkSession();
            if (result.success && result.data?.accessToken) {
                setAccessToken(result.data.accessToken);
                if (result.data.user) {
                    setUser(result.data.user);
                }
            }
        } catch (error) {
            // Không log lỗi nếu chỉ là không có session (401 là bình thường)
            if (error.response?.status !== 401) {
                console.error('Check auth error:', error);
            }
        } finally {
            setLoading(false);
            setIsCheckingAuth(false);
        }
    };

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        
        if (result.success && result.data.success) {
            setAccessToken(result.data.accessToken);
            setUser(result.data.user);
            return { success: true };
        }
        
        return {
            success: false,
            message: result.message || 'Login failed'
        };
    };

    const register = async (userData) => {
        const result = await authService.register(userData);
        
        if (result.success && result.data.success) {
            return { success: true };
        }
        
        return {
            success: false,
            message: result.message || 'Registration failed'
        };
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    const refreshToken = async () => {
        const result = await authService.refreshToken();
        
        if (result.success && result.data.success) {
            setAccessToken(result.data.accessToken);
            return result.data.accessToken;
        }
        
        logout();
        throw new Error(result.message || 'Refresh token failed');
    };

    const value = {
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
