import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Wrong format email!");
      return;
    }

    // Validate password
    if (formData.password.length < 8) {
      toast.error("Min length password is 8");
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success("Đăng nhập thành công!");
        navigate('/'); // Chuyển đến trang dashboard
      } else {
        toast.error(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error("Không thể kết nối server");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-[#F4F4F4]">
        <div className="max-w-md text-black">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="7" height="7" fill="white" rx="1" />
                <rect x="14" y="3" width="7" height="7" fill="white" rx="1" />
                <rect x="3" y="14" width="7" height="7" fill="white" rx="1" />
                <rect x="14" y="14" width="7" height="7" fill="white" rx="1" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-black">AI-Powered Workflow</h1>
          <p className="text-gray-600 text-lg">
            Tự động hóa quy trình, tối ưu hiệu suất.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
          <div className="p-8">
            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <button
                onClick={() => window.location.href = '/login'}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "login"
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Đăng nhập
                {activeTab === "login" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "register"
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Welcome Text */}
            <h2 className="text-2xl font-bold text-black mb-6">
              Chào mừng trở lại!
            </h2>

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full mb-6 bg-white border-gray-300 text-black hover:bg-gray-50 h-11"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Tiếp tục với Google Workspace
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">hoặc</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-black font-medium">
                  Địa chỉ Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-black font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[#F4F4F4] border-gray-300 text-black placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-gray-900 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Terms & Privacy */}
            <p className="text-xs text-gray-600 text-center mt-6">
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                Điều khoản Dịch vụ
              </a>{" "}
              và{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                Chính sách Bảo mật
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
