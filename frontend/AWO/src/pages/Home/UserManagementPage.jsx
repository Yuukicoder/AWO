import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import AssignmentModal from "@/components/assignment/AssignmentModal";
import { getUserWorkload, getAllUsers } from "@/services/user.service";
// import { getTicketsByAssignee } from "@/services/ticket.service";
// import { getTasksByAssignee } from "@/services/task.service";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Ticket,
  ListTodo
} from "lucide-react";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    item: null,
    type: null
  });
  
  // Load users and their workloads
  useEffect(() => {
    loadUsersAndWorkloads();
  }, []);

  const loadUsersAndWorkloads = async () => {
    setIsLoading(true);
    try {
      const usersResponse = await getAllUsers();
      const usersData = usersResponse.data || [];
      setUsers(usersData);

      // Load workloads for all users
      const workloadPromises = usersData.map(user => 
        getUserWorkload(user._id)
          .then(res => ({ userId: user._id, workload: res.data }))
          .catch(() => ({ userId: user._id, workload: null }))
      );
      
      const workloadResults = await Promise.all(workloadPromises);
      const workloadMap = {};
      workloadResults.forEach(result => {
        workloadMap[result.userId] = result.workload;
      });
      setWorkloads(workloadMap);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAssignmentModal = (user, type) => {
    setAssignmentModal({
      isOpen: true,
      item: user,
      type
    });
  };

  const closeAssignmentModal = () => {
    setAssignmentModal({
      isOpen: false,
      item: null,
      type: null
    });
  };

  const handleAssignmentSuccess = () => {
    loadUsersAndWorkloads(); // Reload to update workload
    toast.success('Assignment updated successfully');
  };
  
  const getRoleBadgeVariant = (role) => {
    if (role === "admin") return "destructive";
    if (role === "manager") return "default";
    return "secondary";
  };

  // const getStatusBadgeVariant = (status) => {
  //   return status === "active" ? "default" : "outline";
  // };

  const getStatusColor = (status) => {
    return status === "active" 
      ? "bg-green-500 text-white" 
      : "bg-yellow-500 text-black";
  };

  const getWorkloadColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      overloaded: 'bg-red-100 text-red-700'
    };
    return colors[level] || colors.low;
  };

  const getWorkloadIcon = (level) => {
    if (level === 'overloaded' || level === 'high') {
      return <AlertTriangle className="w-3 h-3" />;
    }
    return <TrendingUp className="w-3 h-3" />;
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Workload</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tickets/Tasks</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        Không có người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const workload = workloads[user._id];
                      const workloadLevel = workload?.summary?.workloadLevel || 'low';
                      const totalTickets = workload?.summary?.totalTickets || 0;
                      const totalTasks = workload?.summary?.totalTasks || 0;
                      const criticalItems = workload?.sla?.criticalItems || 0;
                      
                      return (
                        <tr 
                          key={user._id} 
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
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
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getWorkloadColor(workloadLevel)} inline-flex items-center gap-1`}>
                                {getWorkloadIcon(workloadLevel)}
                                {workloadLevel}
                              </Badge>
                              {workload && (
                                <span className="text-xs text-gray-500">
                                  ({workload.summary.workloadScore}/100)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Ticket className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{totalTickets}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <ListTodo className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{totalTasks}</span>
                              </div>
                              {criticalItems > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {criticalItems} critical
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(user.status || 'active')}>
                              {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 gap-1 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => openAssignmentModal(user, 'ticket')}
                                title="Assign Ticket"
                              >
                                <Ticket className="w-4 h-4" />
                                <span className="text-xs">Ticket</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 gap-1 hover:bg-green-50 hover:text-green-600"
                                onClick={() => openAssignmentModal(user, 'task')}
                                title="Assign Task"
                              >
                                <ListTodo className="w-4 h-4" />
                                <span className="text-xs">Task</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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

        {/* Assignment Modal */}
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          onClose={closeAssignmentModal}
          item={assignmentModal.item}
          type={assignmentModal.type}
          onSuccess={handleAssignmentSuccess}
        />
      </div>
    </div>
  );
}
