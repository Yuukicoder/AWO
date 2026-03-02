import { useEffect, useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, RefreshCw, AlertCircle } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  urgent:   { label: "Khẩn cấp", variant: "destructive",  color: "#ef4444" },
  high:     { label: "Cao",      variant: "destructive",  color: "#f97316" },
  medium:   { label: "Vừa",      variant: "default",      color: "#f59e0b" },
  low:      { label: "Thấp",     variant: "secondary",    color: "#10b981" },
};

const STATUS_COLUMNS = [
  { key: "todo",        label: "Cần làm",          badgeVariant: "secondary", accent: "#6b7280" },
  { key: "in_progress", label: "Đang tiến hành",   badgeVariant: "default",   accent: "#3b82f6" },
  { key: "review",      label: "Đang duyệt",       badgeVariant: "outline",   accent: "#8b5cf6" },
  { key: "done",        label: "Hoàn thành",       badgeVariant: "secondary", accent: "#10b981" },
];

const getInitials = (name = "") =>
  name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase() || "?";

const isOverdue = (deadline) =>
  deadline && new Date(deadline) < new Date();

// ─── TaskCard ────────────────────────────────────────────────────────────────

const TaskCard = ({ task }) => {
  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
  const overdue = task.status !== "done" && isOverdue(task.deadline);
  const assigneeName = task.assignedTo?.name ?? task.assignedTo?.email ?? null;

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer group border-l-4"
      style={{ borderLeftColor: pm.color }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <Badge variant={pm.variant} className="text-xs">
            {pm.label}
          </Badge>
          {assigneeName && (
            <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-[10px] font-semibold">
                {getInitials(assigneeName)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <CardTitle className="text-sm font-semibold leading-snug group-hover:text-blue-600 transition-colors">
          {task.title}
        </CardTitle>
        {task.description && (
          <CardDescription className="text-xs text-gray-500 line-clamp-2 mt-0.5">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          <span>
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString("vi-VN")
              : "Không có deadline"}
          </span>
        </div>
        {task.tags?.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Column ──────────────────────────────────────────────────────────────────

const Column = ({ col, tasks, loading }) => (
  <div className="flex-1 min-w-[280px] max-w-[320px]">
    <div
      className="flex items-center gap-2 mb-4 pb-3 border-b-2"
      style={{ borderColor: col.accent }}
    >
      <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
        {col.label}
      </h2>
      <Badge variant={col.badgeVariant} className="text-xs px-2 py-0.5">
        {tasks.length}
      </Badge>
    </div>

    <div className="space-y-3 min-h-[120px]">
      {loading ? (
        // skeleton
        Array.from({ length: 2 }).map((_, i) => (
          <div key={`sk-${i}`} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))
      ) : tasks.length === 0 ? (
        <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <span className="text-xs text-gray-400">Không có tác vụ</span>
        </div>
      ) : (
        tasks.map(task => <TaskCard key={task._id} task={task} />)
      )}
    </div>
  </div>
);

// ─── HomePage ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();
  const { tasks, loading, fetchMyTasks, getKanbanColumns, stats } = useTaskStore();
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (user?._id) {
      fetchMyTasks(user._id);
    }
  }, [user?._id]);

  const handleRefresh = () => {
    if (user?._id) fetchMyTasks(user._id);
  };

  const columns = getKanbanColumns();

  // apply quick priority filter
  const filtered = (colTasks) => {
    if (activeFilter === "all") return colTasks;
    return colTasks.filter(t => t.priority === activeFilter);
  };

  return (
    <div className="space-y-6">
        {/* Board Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Tác vụ của tôi
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.name ?? user?.email} · {tasks.length} tác vụ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Priority quick-filter */}
            <div className="flex gap-1 bg-white border rounded-lg p-1 shadow-sm">
              {[
                { key: "all",    label: "Tất cả" },
                { key: "urgent", label: "Khẩn" },
                { key: "high",   label: "Cao" },
                { key: "medium", label: "Vừa" },
                { key: "low",    label: "Thấp" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    activeFilter === f.key
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>


        {/* Kanban Board */}
        <div className="flex gap-5 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map(col => (
            <Column
              key={col.key}
              col={col}
              tasks={filtered(columns[col.key] ?? [])}
              loading={loading}
            />
          ))}
        </div>
    </div>
  );
}
