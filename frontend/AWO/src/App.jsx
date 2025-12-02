import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
