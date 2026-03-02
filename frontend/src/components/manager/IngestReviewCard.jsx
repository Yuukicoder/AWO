import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, UserCog, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useIngestStore from '@/stores/useIngestStore';

const PRIORITY_COLOR = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
};

const CATEGORY_COLOR = {
  bug: 'destructive',
  feature: 'default',
  support: 'secondary',
  documentation: 'outline',
  other: 'outline',
};

/**
 * IngestReviewCard
 * Props:
 *   ingest   – ingest payload document
 *   users    – active user list for reassign dropdown
 */
export default function IngestReviewCard({ ingest, users = [] }) {
  const { approveIngest, rejectIngest, actionLoading } = useIngestStore();
  const ai = ingest.aiAnalysis || {};

  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState(null); // null | 'reassign' | 'reject'
  const [selectedUserId, setSelectedUserId] = useState(ai.suggestedAssignee?.userId ?? '');
  const [rejectReason, setRejectReason] = useState('');

  const isLoading = actionLoading === ingest._id;

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleApprove = async () => {
    const res = await approveIngest(ingest._id);
    if (res.success) {
      toast.success(`✅ Ticket ${res.data?.data?.ticket?.number} đã được tạo`);
    } else {
      toast.error(res.message);
    }
  };

  const handleApproveWithAssign = async () => {
    if (!selectedUserId) { toast.warning('Chọn người nhận việc'); return; }
    const res = await approveIngest(ingest._id, { assignedTo: selectedUserId });
    if (res.success) {
      toast.success(`✅ Ticket ${res.data?.data?.ticket?.number} đã được tạo & assign`);
    } else {
      toast.error(res.message);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.warning('Vui lòng nhập lý do từ chối'); return; }
    const res = await rejectIngest(ingest._id, rejectReason);
    if (res.success) {
      toast.info('🚫 Đã từ chối ingest');
    } else {
      toast.error(res.message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Card className="p-5 space-y-4 border-l-4 border-l-blue-400">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs capitalize">{ingest.source}</Badge>
            {ai.priority && <Badge variant={PRIORITY_COLOR[ai.priority] || 'default'}>{ai.priority}</Badge>}
            {ai.category && <Badge variant={CATEGORY_COLOR[ai.category] || 'outline'}>{ai.category}</Badge>}
            {ai.isFallback && <Badge variant="outline" className="text-yellow-600 border-yellow-400">⚠ fallback</Badge>}
            {ai.confidenceScore != null && (
              <span className="text-xs text-muted-foreground">
                AI confidence: {Math.round(ai.confidenceScore * 100)}%
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug">{ai.title || '(no title)'}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{ai.description}</p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* AI Suggested assignee */}
      {ai.suggestedAssignee && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-md px-4 py-2.5 text-sm space-y-0.5">
          <p className="font-medium text-blue-700 dark:text-blue-300">🤖 Đề xuất giao cho</p>
          <p>
            <span className="font-semibold">{ai.suggestedAssignee.userName}</span>
            <span className="text-muted-foreground ml-2">{ai.suggestedAssignee.userEmail}</span>
            <Badge variant="secondary" className="ml-2 text-xs">{ai.suggestedAssignee.score}/100</Badge>
          </p>
          <p className="text-muted-foreground whitespace-pre-wrap text-xs">{ai.suggestedAssignee.reasoning}</p>
        </div>
      )}

      {/* Expanded: alternatives + labels */}
      {expanded && (
        <div className="space-y-3 text-sm">
          {ai.alternatives?.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">Phương án khác</p>
              <div className="space-y-1">
                {ai.alternatives.map((alt) => (
                  <div key={alt.userId} className="flex items-center gap-2 pl-2">
                    <span>{alt.userName}</span>
                    <span className="text-muted-foreground text-xs">{alt.userEmail}</span>
                    <Badge variant="outline" className="text-xs">{alt.score}/100</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ai.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ai.labels.map((l) => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            Received: {new Date(ingest.receivedAt).toLocaleString('vi-VN')}
            {ingest.processedAt && ` · Processed: ${new Date(ingest.processedAt).toLocaleString('vi-VN')}`}
          </p>
        </div>
      )}

      {/* Action area */}
      {mode === null && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={handleApprove} disabled={isLoading}>
            {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle size={14} className="mr-1" />}
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMode('reassign')} disabled={isLoading}>
            <UserCog size={14} className="mr-1" /> Assign cho người khác
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setMode('reject')} disabled={isLoading}>
            <XCircle size={14} className="mr-1" /> Từ chối
          </Button>
        </div>
      )}

      {/* Reassign panel */}
      {mode === 'reassign' && (
        <div className="space-y-2 pt-1">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border rounded-md px-3 py-1.5 text-sm bg-background"
          >
            <option value="">-- Chọn thành viên --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) — {u.role}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApproveWithAssign} disabled={isLoading}>
              {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Xác nhận & Tạo ticket
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)} disabled={isLoading}>
              Huỷ
            </Button>
          </div>
        </div>
      )}

      {/* Reject panel */}
      {mode === 'reject' && (
        <div className="space-y-2 pt-1">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full border rounded-md px-3 py-1.5 text-sm bg-background resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Xác nhận từ chối
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)} disabled={isLoading}>
              Huỷ
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
