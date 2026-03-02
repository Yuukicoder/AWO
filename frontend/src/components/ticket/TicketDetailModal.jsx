import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  X,
  Calendar,
  User,
  Tag,
  Clock,
  Layers,
  Zap,
  Brain,
  CheckCircle2,
  AlertCircle,
  Hash,
  ExternalLink,
} from 'lucide-react';

// ─── helpers (same as parent page) ─────────────────────────────────────────

const PRIORITY_COLOR = {
  urgent: 'destructive',
  high:   'destructive',
  medium: 'default',
  low:    'secondary',
};

const STATUS_COLOR = {
  open:             'default',
  in_progress:      'default',
  review:           'outline',
  done:             'secondary',
  closed:           'secondary',
};

const STATUS_LABEL = {
  open:             'Open',
  in_progress:      'In Progress',
  review:           'In Review',
  done:             'Done',
  closed:           'Closed',
};

const STATUS_DOT = {
  open:        'bg-blue-500',
  in_progress: 'bg-yellow-400',
  review:      'bg-purple-500',
  done:        'bg-green-500',
  closed:      'bg-gray-400',
};

const fmt = (date) =>
  date ? new Date(date).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const pct = (score) =>
  score != null ? `${Math.round(score * 100)}%` : null;

// ─── Section heading ─────────────────────────────────────────────────────────

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <Icon className="h-3.5 w-3.5" />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

// ─── Task row ────────────────────────────────────────────────────────────────

const TaskRow = ({ task }) => (
  <div className="flex items-center justify-between py-1.5 px-3 rounded-md bg-gray-50 border text-sm">
    <span className="text-gray-700 truncate flex-1">{task.title}</span>
    <div className="flex items-center gap-2 ml-3 shrink-0">
      <Badge variant={PRIORITY_COLOR[task.priority] ?? 'default'} className="text-[10px] px-1.5 py-0.5">
        {task.priority}
      </Badge>
      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[task.status] ?? 'bg-gray-300'}`} />
      <span className="text-gray-500 text-xs capitalize">{(task.status ?? '').replace('_', ' ')}</span>
    </div>
  </div>
);

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function TicketDetailModal({
  ticket,
  onClose,
  isNew = false,       // has an unread assignment notification
  onAccept,
  onDismiss,
  accepting = false,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!ticket) return null;

  const ai = ticket.aiAnalysis;
  const hasTasks = ticket.tasks?.length > 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-gray-400 flex items-center gap-1">
                <Hash className="h-3 w-3" />{ticket.number}
              </span>
              <Badge variant={PRIORITY_COLOR[ticket.priority] ?? 'default'} className="text-xs">
                {ticket.priority}
              </Badge>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
                ticket.status === 'open' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                ticket.status === 'in_progress' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                ticket.status === 'review' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                ticket.status === 'done' ? 'border-green-300 text-green-700 bg-green-50' :
                'border-gray-300 text-gray-600 bg-gray-50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[ticket.status] ?? 'bg-gray-400'}`} />
                {STATUS_LABEL[ticket.status] ?? ticket.status}
              </span>
              {isNew && (
                <Badge className="bg-blue-500 text-white text-[11px]">🔔 Mới</Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {ticket.title || ticket.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">

          {/* Description */}
          {ticket.description && (
            <Section icon={Layers} title="Mô tả">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border">
                {ticket.description}
              </p>
            </Section>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <Section icon={User} title="Người báo cáo">
              <p className="text-sm text-gray-800 font-medium">
                {ticket.reporter?.name || ticket.reporter?.email || ticket.createdBy?.name || '—'}
              </p>
            </Section>
            <Section icon={User} title="Người được giao">
              <p className="text-sm text-gray-800 font-medium">
                {ticket.assignedTo?.name || ticket.assignedTo?.email || '—'}
              </p>
            </Section>
            <Section icon={Tag} title="Danh mục">
              <p className="text-sm text-gray-800 capitalize">{ticket.category || '—'}</p>
            </Section>
            <Section icon={Zap} title="Độ phức tạp">
              <p className="text-sm text-gray-800 capitalize">{ticket.complexity || '—'}</p>
            </Section>
            <Section icon={Clock} title="Ước tính (giờ)">
              <p className="text-sm text-gray-800">{ticket.estimatedEffort ?? '—'}</p>
            </Section>
            <Section icon={Tag} title="Nguồn">
              <p className="text-sm text-gray-800 capitalize">{ticket.source || '—'}</p>
            </Section>
          </div>

          {/* Labels */}
          {ticket.labels?.length > 0 && (
            <Section icon={Tag} title="Labels">
              <div className="flex flex-wrap gap-1.5">
                {ticket.labels.map((l) => (
                  <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border">
                    {l}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Section icon={Calendar} title="Ngày tạo">
              <p className="text-sm text-gray-700">{fmt(ticket.createdAt)}</p>
            </Section>
            <Section icon={Calendar} title="Cập nhật lần cuối">
              <p className="text-sm text-gray-700">{fmt(ticket.updatedAt)}</p>
            </Section>
          </div>

          {/* AI Analysis */}
          {ai?.processed && (
            <Section icon={Brain} title="Phân tích AI">
              <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 font-medium">Độ tin cậy</span>
                  <span className="text-xs font-bold text-purple-700">{pct(ai.confidenceScore)}</span>
                </div>

                {ai.suggestedAssignee?.userName && (
                  <div>
                    <span className="text-xs text-purple-600 font-medium">Người được đề xuất: </span>
                    <span className="text-xs text-purple-900 font-semibold">{ai.suggestedAssignee.userName}</span>
                    {ai.suggestedAssignee.score != null && (
                      <span className="text-xs text-purple-500 ml-1">({pct(ai.suggestedAssignee.score)})</span>
                    )}
                    {ai.suggestedAssignee.reasoning && (
                      <p className="text-xs text-purple-700 mt-0.5 italic">"{ai.suggestedAssignee.reasoning}"</p>
                    )}
                  </div>
                )}

                {ai.alternatives?.length > 0 && (
                  <div>
                    <p className="text-xs text-purple-500 mb-1">Lựa chọn thay thế:</p>
                    <div className="space-y-0.5">
                      {ai.alternatives.slice(0, 3).map((alt) => (
                        <div key={alt.userId?.toString() ?? alt.userName} className="flex items-center gap-2 text-xs text-purple-700">
                          <span className="font-medium">{alt.userName}</span>
                          {alt.score != null && <span className="text-purple-400">{pct(alt.score)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Tasks */}
          {hasTasks && (
            <Section icon={CheckCircle2} title={`Tasks (${ticket.tasks.length})`}>
              <div className="space-y-1.5">
                {ticket.tasks.map((t) => (
                  <TaskRow key={t._id} task={t} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {ticket.source === 'email' ? '📧 Từ email' :
             ticket.source === 'webhook' ? '🔗 Webhook' : '✍️ Tạo thủ công'}
          </span>

          <div className="flex items-center gap-2">
            {/* Accept / Dismiss — only when open + new assignment */}
            {isNew && ticket.status === 'open' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-gray-500"
                  onClick={onDismiss}
                >
                  <X className="h-3.5 w-3.5" />
                  Bỏ qua
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  disabled={accepting}
                  onClick={onAccept}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {accepting ? 'Đang xử lý...' : 'Nhận ticket'}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
