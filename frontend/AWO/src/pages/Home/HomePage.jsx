import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, Filter, Tag } from "lucide-react";

const getPriorityVariant = (priority) => {
  if (priority.includes("Cao")) return "destructive";
  if (priority.includes("Vừa")) return "default";
  return "secondary";
};

const TaskCard = ({ task }) => (
  <Card className="hover:shadow-lg transition-all cursor-pointer group border-l-4" style={{ borderLeftColor: task.priority.includes("Cao") ? "#ef4444" : task.priority.includes("Vừa") ? "#f59e0b" : "#10b981" }}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between mb-2">
        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
          {task.priority}
        </Badge>
        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
            {task.assignee}
          </AvatarFallback>
        </Avatar>
      </div>
      <CardTitle className="text-base font-semibold group-hover:text-blue-600 transition-colors">{task.title}</CardTitle>
      <CardDescription className="text-sm text-gray-600 leading-relaxed">{task.description}</CardDescription>
    </CardHeader>
    
    {task.chart && (
      <CardContent className="pb-3">
        <div className="w-full h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-end justify-around p-3 border border-gray-100">
          {[40, 55, 65, 75, 85, 70, 90].map((height, i) => (
            <div
              key={i}
              className="w-3 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full hover:opacity-80 transition-opacity"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </CardContent>
    )}

    <CardContent className="pt-0 flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <Clock className="w-4 h-4" />
        <span className="font-medium">{task.time}</span>
      </div>
      <span className="text-xs text-gray-500">{task.assigneeName}</span>
    </CardContent>
  </Card>
);

const Column = ({ title, count, tasks, badgeVariant = "secondary" }) => (
  <div className="flex-1 min-w-[300px]">
    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
      <h2 className="text-black font-bold text-lg">{title}</h2>
      <Badge variant={badgeVariant} className="text-xs px-2.5 py-1">
        {count} {count === 1 ? "tác vụ" : "tác vụ"}
      </Badge>
    </div>
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
      <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium">
        + Thêm tác vụ mới
      </button>
    </div>
  </div>
);

export default function HomePage() {
  const [tasks] = useState({
    canLam: [
      {
        id: 1,
        priority: "Ưu tiên Cao",
        title: "Thiết kế giao diện trang chủ",
        description: "Hoàn thiện wireframe và UI kit cho trang web chính.",
        time: "8h",
        assignee: "AN",
        assigneeName: "Anh Đức",
        color: "bg-red-500"
      },
      {
        id: 2,
        priority: "Ưu tiên Vừa",
        title: "Phân tích yêu cầu API",
        description: "Viết tài liệu kỹ thuật cho endpoint người dùng.",
        time: "4h",
        assignee: "MH",
        assigneeName: "Minh Hiếu",
        color: "bg-orange-500"
      },
      {
        id: 3,
        priority: "Ưu tiên Thấp",
        title: "Sửa lỗi đăng nhập",
        description: "Người dùng không thể đăng nhập khi mất kết nối.",
        time: "2h",
        assignee: "TL",
        assigneeName: "Thùy Linh",
        color: "bg-green-500"
      }
    ],
    dangTienHanh: [
      {
        id: 4,
        priority: "Ưu tiên Cao",
        title: "Cấu hình CI/CD Pipeline",
        description: "Tự động hóa quy trình build và deploy.",
        time: "12h",
        assignee: "QA",
        assigneeName: "Quang Anh",
        color: "bg-red-500"
      },
      {
        id: 5,
        priority: "Ưu tiên Vừa",
        title: "Viết Unit Test cho Module User",
        description: "Đảm bảo độ bao phủ code trên 80%.",
        time: "6h",
        assignee: "HN",
        assigneeName: "Hà Nhi",
        color: "bg-orange-500"
      }
    ],
    dangDuyet: [
      {
        id: 6,
        priority: "Ưu tiên Thấp",
        title: "Cập nhật tài liệu hướng dẫn",
        description: "Bổ sung phần hướng dẫn sử dụng mới.",
        time: "3h",
        assignee: "BT",
        assigneeName: "Bảo Trân",
        color: "bg-green-500",
        chart: true
      }
    ],
    hoanThanh: [
      {
        id: 7,
        priority: "Ưu tiên Vừa",
        title: "Tối ưu hóa hình ảnh trang chủ",
        description: "Giảm kích thước file để tăng tốc độ trang.",
        time: "5h",
        assignee: "NP",
        assigneeName: "Ngọc Phương",
        color: "bg-orange-500"
      }
    ]
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <Navbar />
      
      <div className="p-6">
        {/* Header Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" className="gap-2 shadow-sm hover:shadow-md">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>
          
          <Button variant="outline" className="gap-2 shadow-sm hover:shadow-md">
            <Tag className="w-4 h-4" />
            Sắp xếp
          </Button>

          {/* Team Avatars */}
          <div className="flex items-center ml-auto gap-4">
            <span className="text-sm text-gray-600 font-medium">Đội nhóm:</span>
            <div className="flex -space-x-3">
              {[
                { name: "AN", full: "Anh Đức" },
                { name: "MH", full: "Minh Hiếu" },
                { name: "TL", full: "Thùy Linh" }
              ].map((member, i) => (
                <Avatar 
                  key={i} 
                  className="border-2 border-white shadow-md hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                  title={member.full}
                >
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
                    {member.name}
                  </AvatarFallback>
                </Avatar>
              ))}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full text-xs font-medium shadow-md hover:shadow-lg"
                title="Xem thêm thành viên"
              >
                +4
              </Button>
            </div>
          </div>

          <Button variant="outline" className="shadow-sm hover:shadow-md">
            Chế độ xem
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          <Column
            title=" Cần làm"
            count={3}
            tasks={tasks.canLam}
            badgeVariant="secondary"
          />
          <Column
            title=" Đang tiến hành"
            count={2}
            tasks={tasks.dangTienHanh}
            badgeVariant="default"
          />
          <Column
            title=" Đang duyệt"
            count={1}
            tasks={tasks.dangDuyet}
            badgeVariant="outline"
          />
          <Column
            title=" Hoàn thành"
            count={1}
            tasks={tasks.hoanThanh}
            badgeVariant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
