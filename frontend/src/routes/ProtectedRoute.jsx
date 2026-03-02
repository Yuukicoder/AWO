import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { accessToken, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
