import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Play,
} from "lucide-react";
import ReportDetailModal, {
  type ReportResponseDto,
} from "../components/ReportDetailModal";
import toast from "react-hot-toast";
import { getReports, acceptReport, rejectReport } from "@/api/reportApi";
import ConfirmActionModal from "../components/ConfirmActionModal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

type SortField =
  | "id"
  | "title"
  | "fullName"
  | "username"
  | "violationType"
  | "reportStatus"
  | "createdAt";
type SortDir = "asc" | "desc" | null;

// ─── Configs ─────────────────────────────────────────────────────────────────

const violationConfig: Record<string, { label: string; badge: string }> = {
  ADULT_CONTENT: { label: "Khiêu dâm", badge: "badge-error" },
  VIOLENT_OR_GRAPHIC_CONTENT: {
    label: "Bạo lực / Phản cảm",
    badge: "badge-error",
  },
  HATEFUL_OR_ABUSIVE_CONTENT: {
    label: "Lăng mạ / Thù hận",
    badge: "badge-warning",
  },
  HARMFUL_OR_DANGEROUS_ACTS: {
    label: "Gây hại / Nguy hiểm",
    badge: "badge-warning",
  },
  SELF_HARM_OR_SUICIDE: {
    label: "Tự tử / Tự hủy hoại",
    badge: "badge-warning",
  },
  MISINFORMATION: { label: "Thông tin sai lệch", badge: "badge-info" },
  COPYRIGHT_INFRINGEMENT: { label: "Vi phạm bản quyền", badge: "badge-ghost" },
};
const reportStatusConfig: Record<string, { label: string; badge: string }> = {
  PENDING: {
    label: "Chờ xử lý",
    badge: "badge-warning",
  },
  RESOLVED: {
    label: "Đã xử lý",
    badge: "badge-success",
  },
  REJECTED: {
    label: "Từ chối",
    badge: "badge-error",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-base-300 shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-base-300 shrink-0">
      {initials}
    </div>
  );
}

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField | null;
  dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const isActive = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold text-xs tracking-wide hover:text-primary transition-colors"
    >
      {label}
      {isActive ? (
        dir === "asc" ? (
          <ArrowUp className="w-3 h-3 text-primary" />
        ) : (
          <ArrowDown className="w-3 h-3 text-primary" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ManageReports() {
  const [data, setData] = useState<PageResponse<ReportResponseDto> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [detailReport, setDetailReport] = useState<ReportResponseDto | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState<{
    report: ReportResponseDto;
    type: "accept" | "reject";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: PageResponse<ReportResponseDto> = await getReports(page);
      setData(res);
    } catch {
      setError("Không thể tải danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const displayed = (() => {
    if (!data) return [];
    let list = [...data.content];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q),
      );
    }

    if (sortField && sortDir) {
      list.sort((a, b) => {
        const va = a[sortField as keyof ReportResponseDto] ?? "";
        const vb = b[sortField as keyof ReportResponseDto] ?? "";
        const cmp = String(va).localeCompare(String(vb), "vi", {
          numeric: true,
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  })();

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const handleResolve = (report: ReportResponseDto) => {
    if (report.reportStatus !== "PENDING") {
      toast.error("Báo cáo này đã được xử lý từ trước.");
      return;
    }
    setConfirmModal({ report, type: "accept" });
  };

  const handleReject = (report: ReportResponseDto) => {
    if (report.reportStatus !== "PENDING") {
      toast.error("Báo cáo này đã được xử lý từ trước.");
      return;
    }
    setConfirmModal({ report, type: "reject" });
  };
  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { report, type } = confirmModal;

    setActionLoading(true);
    try {
      if (type === "accept") {
        await acceptReport(report.id);
        toast.success(`Đã giải quyết báo cáo #${report.id}`);
      } else {
        await rejectReport(report.id);
        toast.success(`Đã bác bỏ báo cáo #${report.id}`);
      }

      setConfirmModal(null); // Đóng modal sau khi thành công
      fetchReports(); // Reload lại danh sách dữ liệu mới nhất
    } catch (error) {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-base-content">
            Quản lý báo cáo
          </h1>
        </div>

        <label className="input input-bordered input-sm flex items-center gap-2 w-full max-w-xs">
          <Search className="w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Tìm tiêu đề, tên, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow"
          />
        </label>
      </div>

      {/* Table Card */}
      <div className="bg-base-100 border border-base-300 rounded-md overflow-hidden shadow-sm">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-base-content/60">
            <AlertCircle className="w-10 h-10 text-error" />
            <p>{error}</p>
            <button className="btn btn-sm btn-primary" onClick={fetchReports}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-base-200 text-base-content/70">
                <tr>
                  <th className="w-12">
                    <SortHeader
                      label="ID"
                      field="id"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="min-w-[180px]">
                    <SortHeader
                      label="Video"
                      field="title"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Tài khoản"
                      field="fullName"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Loại vi phạm"
                      field="violationType"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Trạng thái"
                      field="reportStatus"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="hidden lg:table-cell">
                    <SortHeader
                      label="Ngày gửi"
                      field="createdAt"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right text-xs tracking-wide font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td>
                        <div className="skeleton h-4 w-8" />
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="skeleton w-16 h-10 rounded shrink-0" />
                          <div className="skeleton h-4 w-28" />
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                          <div className="space-y-1">
                            <div className="skeleton h-4 w-24" />
                            <div className="skeleton h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-28 rounded-full" />
                      </td>
                      <td>
                        <div className="skeleton h-5 w-24 rounded-full" />
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="skeleton h-4 w-24" />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <div className="skeleton w-6 h-6 rounded" />
                          <div className="skeleton w-6 h-6 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-base-content/40"
                    >
                      Không tìm thấy báo cáo nào
                    </td>
                  </tr>
                ) : (
                  displayed.map((report) => {
                    const violation = violationConfig[report.violationType] ?? {
                      label: report.violationType,
                      badge: "badge-ghost",
                    };
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        {/* ID */}
                        <td className="text-base-content/50 text-xs font-mono">
                          #{report.id}
                        </td>

                        {/* Thumbnail + title */}
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-10 rounded overflow-hidden bg-base-300 shrink-0">
                              {report.thumbnail ? (
                                <img
                                  src={report.thumbnail}
                                  alt={report.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-base-content/30">
                                  <Play className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-base-content text-sm line-clamp-2 max-w-[160px]">
                              {report.title}
                            </span>
                          </div>
                        </td>

                        {/* Avatar + fullName + username */}
                        <td>
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar
                              src={report.avatar}
                              name={report.fullName}
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-base-content truncate max-w-[120px]">
                                {report.fullName}
                              </div>
                              <div className="text-xs text-base-content/60 truncate max-w-[120px]">
                                @{report.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Violation type */}
                        <td>
                          <span className={`badge badge-sm ${violation.badge}`}>
                            {violation.label}
                          </span>
                        </td>
                        <td>
                          {(() => {
                            const status = reportStatusConfig[
                              report.reportStatus
                            ] ?? {
                              label: report.reportStatus,
                              badge: "badge-ghost",
                            };

                            return (
                              <span
                                className={`badge badge-sm ${status.badge}`}
                              >
                                {status.label}
                              </span>
                            );
                          })()}
                        </td>

                        {/* createdAt */}
                        <td className="hidden lg:table-cell text-base-content/60 text-sm">
                          {new Date(report.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {/* Xem chi tiết */}
                            <button
                              onClick={() => setDetailReport(report)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-info" />
                            </button>

                            {/* Đã giải quyết */}
                            <button
                              onClick={() => handleResolve(report)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Đánh dấu đã giải quyết"
                            >
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            </button>

                            {/* Bác bỏ báo cáo */}
                            <button
                              onClick={() => handleReject(report)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Bác bỏ báo cáo"
                            >
                              <XCircle className="w-4 h-4 text-error" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-base-300 flex-wrap gap-2">
            <p className="text-xs text-base-content/50">
              Trang {data.page + 1} / {data.totalPages} &middot;{" "}
              {data.totalElements.toLocaleString()} báo cáo
            </p>

            <div className="join">
              <button
                className="join-item btn btn-sm btn-ghost"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: data.totalPages }, (_, i) => i)
                .filter((i) => Math.abs(i - page) <= 2)
                .map((i) => (
                  <button
                    key={i}
                    className={`join-item btn btn-sm ${i === page ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}

              <button
                className="join-item btn btn-sm btn-ghost"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {detailReport && (
        <ReportDetailModal
          report={detailReport}
          onClose={() => setDetailReport(null)}
        />
      )}
      {confirmModal && (
        <ConfirmActionModal
          report={confirmModal.report}
          actionType={confirmModal.type}
          isLoading={actionLoading}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
