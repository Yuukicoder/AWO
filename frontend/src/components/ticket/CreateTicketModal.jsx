import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, Loader2, AlertCircle } from 'lucide-react';
import ingestService from '@/services/ingest.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' },
  { value: 'high',   label: 'High',   color: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' },
];

const PRIORITY_SELECTED = {
  low:    'bg-gray-700 text-white border-gray-700',
  medium: 'bg-blue-600 text-white border-blue-600',
  high:   'bg-orange-500 text-white border-orange-500',
  urgent: 'bg-red-600 text-white border-red-600',
};

const CATEGORIES = [
  { value: 'bug',           label: '🐛 Bug' },
  { value: 'feature',       label: '✨ Feature' },
  { value: 'support',       label: '🛠️ Support' },
  { value: 'documentation', label: '📄 Documentation' },
  { value: 'other',         label: '📦 Other' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'other',
  dueDate: '',
  labelsRaw: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CreateTicketModal
 * Self-contained modal for creating a new ticket from the NavBar.
 * Props:
 *   onClose  – called when the modal should be dismissed
 *   onCreated(ticket) – optional callback after successful creation
 */
export default function CreateTicketModal({ onClose, onCreated }) {
  const { user } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const firstInputRef = useRef(null);
  const backdropRef = useRef(null);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setPriority = (value) =>
    setForm((prev) => ({ ...prev, priority: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Tiêu đề không được để trống';
    if (form.title.trim().length > 500) errs.title = 'Tiêu đề không vượt quá 500 ký tự';
    if (form.dueDate && new Date(form.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      errs.dueDate = 'Ngày hết hạn không được ở trong quá khứ';
    }
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const tags = form.labelsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      rawText: `${form.title.trim()}${form.description.trim() ? '\n\n' + form.description.trim() : ''}`,
      description: form.description.trim(),
      priority: form.priority,
      category: form.category,
      labels: tags,
      dueDate: form.dueDate || undefined,
      requestedBy: user?.name,
      createdBy: user?._id,
      reporter: user
        ? { email: user.email, name: user.name, userId: user._id }
        : undefined,
    };

    try {
      const res = await ingestService.submitManual(payload);
      const ingestId = res.data?.data?.ingestId;
      toast.success('Yêu cầu đã được gửi! AI đang phân tích và chờ manager duyệt.');
      onCreated?.(res.data?.data);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Có lỗi xảy ra, thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close on backdrop click ───────────────────────────────────────────────

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-ticket-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 id="create-ticket-title" className="text-base font-semibold text-gray-900">
            Tạo yêu cầu mới
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-title" className="text-sm font-medium text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                ref={firstInputRef}
                id="ticket-title"
                value={form.title}
                onChange={set('title')}
                placeholder="Mô tả ngắn gọn vấn đề..."
                maxLength={500}
                className={errors.title ? 'border-red-400 focus-visible:ring-red-300' : ''}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-desc" className="text-sm font-medium text-gray-700">
                Mô tả chi tiết
              </label>
              <textarea
                id="ticket-desc"
                value={form.description}
                onChange={set('description')}
                placeholder="Cung cấp thêm thông tin chi tiết, bước tái hiện, hoặc ngữ cảnh..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Độ ưu tiên</p>
              <div className="flex gap-2 flex-wrap">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.priority === p.value
                        ? PRIORITY_SELECTED[p.value]
                        : p.color
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-category" className="text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                id="ticket-category"
                value={form.category}
                onChange={set('category')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-due" className="text-sm font-medium text-gray-700">
                Ngày hết hạn <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
              </label>
              <Input
                id="ticket-due"
                type="date"
                value={form.dueDate}
                onChange={set('dueDate')}
                min={new Date().toISOString().split('T')[0]}
                className={errors.dueDate ? 'border-red-400 focus-visible:ring-red-300' : ''}
              />
              {errors.dueDate && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" /> {errors.dueDate}
                </p>
              )}
            </div>

            {/* Labels */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-labels" className="text-sm font-medium text-gray-700">
                Nhãn <span className="text-gray-400 font-normal">(tuỳ chọn, cách nhau bằng dấu phẩy)</span>
              </label>
              <Input
                id="ticket-labels"
                value={form.labelsRaw}
                onChange={set('labelsRaw')}
                placeholder="backend, auth, critical..."
              />
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0 bg-gray-50 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-9 text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 text-sm bg-black hover:bg-gray-900 text-white min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
