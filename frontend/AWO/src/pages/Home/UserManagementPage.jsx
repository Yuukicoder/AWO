import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const users = [
    {
      id: 1,
      name: "Minh Nguyen",
      email: "minh.nguyen@example.com",
      role: "Admin",
      tasks: 40,
      joinDate: "2023-01-15",
      status: "Hoạt động",
      avatar: "MN"
    },
    {
      id: 2,
      name: "Trần Lan Anh",
      email: "lan.anh@example.com",
      role: "Manager",
      tasks: 40,
      joinDate: "2023-02-20",
      status: "Hoạt động",
      avatar: "LA"
    },
    {
      id: 3,
      name: "Lê Hoàng",
      email: "le.hoang@example.com",
      role: "Member",
      tasks: 35,
      joinDate: "2023-03-10",
      status: "Hoạt động",
      avatar: "LH"
    },
    {
      id: 4,
      name: "Phạm Vân",
      email: "pham.van@example.com",
      role: "Member",
      tasks: 40,
      joinDate: "2023-04-05",
      status: "Tạm khóa",
      avatar: "PV"
    },
    {
      id: 5,
      name: "Vũ Thị Thu",
      email: "vu.thu@example.com",
      role: "Member",
      tasks: 20,
      joinDate: "2023-05-22",
      status: "Hoạt động",
      avatar: "VT"
    }
  ];

  const getRoleBadgeVariant = (role) => {
    if (role === "Admin") return "destructive";
    if (role === "Manager") return "default";
    return "secondary";
  };

  const getStatusBadgeVariant = (status) => {
    return status === "Hoạt động" ? "default" : "outline";
  };

  const getStatusColor = (status) => {
    return status === "Hoạt động" 
      ? "bg-green-500 text-white" 
      : "bg-yellow-500 text-black";
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <Navbar />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Quản lý Người dùng & Nhóm</h1>
          <p className="text-gray-600">Quản lý quyền truy cập, vai trò và năng lực của các thành viên trong tổ chức.</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Controls Bar */}
            <div className="flex items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#F4F4F4] border-gray-300"
                />
              </div>

              {/* Filter */}
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
              </Button>

              {/* Action Dropdown */}
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                <option>Hành động hàng loạt</option>
                <option>Xóa đã chọn</option>
                <option>Xuất CSV</option>
              </select>

              {/* Add User Button */}
              <Button className="ml-auto bg-blue-600 hover:bg-blue-700 gap-2">
                <UserPlus className="w-4 h-4" />
                Thêm người dùng mới
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên người dùng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vai trò</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Năng lực (Nhiệm vụ)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày tham gia</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-black">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.tasks}</td>
                      <td className="py-4 px-4 text-gray-600">{user.joinDate}</td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {[1, 2, 3, "...", 10].map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${page === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
