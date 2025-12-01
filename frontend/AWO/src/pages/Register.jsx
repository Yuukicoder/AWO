import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Toaster } from '@/components/ui/sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Xử lý input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate name
    const nameRegex = /^[A-Za-z\s]+$/;
    if(!nameRegex.test(formData.name)){
      toast.error("Name is only character A-Z or a-z");
      return;
    }
    // Validate email
    const emailRegex = /^[\w.-]+@gmail\.com$/;
    if(!emailRegex.test(formData.email)){
      toast.error("Wrong format email!");
      return;
    }
    // Validate password
    if(formData.password.length < 8){
      toast.error("Min length password is 8");
      return;
    }
    //  Validate confirmPassword
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password is not matching!");
      return;
    }
    
    if(formData.name)

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password, 
      };

      const { data } = await axios.post(
        "http://localhost:3000/api/auth/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Đăng ký thành công!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      console.log("Server response:", data);

    } catch (error) {
      // Axios error handling
      if (error.response) {
        // lỗi từ backend
        toast.error(error.response.data.message || "Đăng ký thất bại");
      } else {
        // lỗi network
        toast.error("Không thể kết nối server");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 rounded-xl shadow-lg space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Register</h2>

      <Input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />

      <Input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />

      <Input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : "Register"}
      </Button>
    </form>
  );
}
