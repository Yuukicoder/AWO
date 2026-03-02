import { useEffect, useState } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import IngestReviewCard from '@/components/manager/IngestReviewCard';
import useIngestStore from '@/stores/useIngestStore';
import axiosInstance from '@/utils/axiosInstance';

const STATUS_TABS = [
  { label: 'Chờ duyệt', value: 'pending_review' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
  { label: 'Tất cả', value: '' },
];

export default function IngestReviewPage() {
  const { ingests, pagination, loading, filters, fetchIngests, setFilters } = useIngestStore();
  const [users, setUsers] = useState([]);

  // Fetch active users for reassign dropdown
  useEffect(() => {
    axiosInstance.get('/users', { params: { isActive: true } })
      .then((r) => setUsers(r.data?.data || r.data || []))
      .catch(() => {});
  }, []);

  // Fetch ingests on mount and whenever status filter changes
  useEffect(() => {
    fetchIngests();
  }, [filters.status]);

  const handleTabChange = (status) => {
    setFilters({ status });
  };

  const handleRefresh = () => fetchIngests();

  const pendingCount = ingests.filter((i) => i.status === 'pending_review').length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox size={22} /> AI Ingest Review
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Xem xét và phê duyệt các đề xuất từ AI trước khi tạo ticket
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap border-b pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
            {tab.value === 'pending_review' && pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                {pendingCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <RefreshCw size={20} className="animate-spin mr-2" /> Đang tải...
        </div>
      ) : ingests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
          <Inbox size={40} className="opacity-30" />
          <p className="text-sm">Không có ingest nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ingests.map((ingest) => (
            <IngestReviewCard key={ingest._id} ingest={ingest} users={users} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchIngests({ page: pagination.page - 1 })}
          >
            Trước
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchIngests({ page: pagination.page + 1 })}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
