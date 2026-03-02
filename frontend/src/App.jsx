import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import HomePage from './pages/Home/HomePage';
import UserManagementPage from './pages/Home/UserManagementPage';
import TicketListPage from './pages/ticket/TicketListPage';
import TaskListPage from './pages/task/TaskListPage';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import IngestReviewPage from './pages/Manager/IngestReviewPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with Layout */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/ingest-review" element={<IngestReviewPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
