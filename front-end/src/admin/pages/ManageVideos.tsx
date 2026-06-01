import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Info,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Play,
} from "lucide-react";
import { getAllVideos } from "@/api/videoApi";
import VideoDetailModal from "../components/VideoDetailModal";
import ModalWatchVideo from "../components/ModalWatchVideo";
import toast from "react-hot-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type VideoType = "YOUTUBE" | "UPLOAD";
type VideoStatus = "ACCEPTED" | "REJECTED" | "PENDING";

export interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  duration: number;
  videoType: VideoType;
  videoStatus: VideoStatus;
  videoUrl?: string;
  videoYoutubeUrl?: string;
  videoYoutubeId?: string;
  fullName: string;
  username: string;
  avatar?: string;
  subscribersCount: number;
  categories: string[];
  hashtags: string[];
  createdAt: string;
}

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
  | "createdAt"
  | "videoType"
  | "videoStatus";
type SortDir = "asc" | "desc" | null;

// ─── Configs ─────────────────────────────────────────────────────────────────

const statusConfig: Record<VideoStatus, { label: string; badge: string }> = {
  ACCEPTED: { label: "Đã duyệt", badge: "badge-success" },
  REJECTED: { label: "Từ chối", badge: "badge-error" },
  PENDING: { label: "Chờ duyệt", badge: "badge-warning" },
};

const typeConfig: Record<VideoType, { label: string; badge: string }> = {
  YOUTUBE: { label: "YouTube", badge: "badge-error" },
  UPLOAD: { label: "Upload", badge: "badge-info" },
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

export default function ManageVideosAdmin() {
  const [data, setData] = useState<PageResponse<VideoResponseDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [watchVideo, setWatchVideo] = useState<VideoResponseDto | null>(null);
  const [detailVideo, setDetailVideo] = useState<VideoResponseDto | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: PageResponse<VideoResponseDto> = await getAllVideos(page);
      setData(res);
    } catch {
      setError("Không thể tải danh sách video.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const displayed = (() => {
    if (!data) return [];
    let list = [...data.content];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.fullName.toLowerCase().includes(q) ||
          v.username.toLowerCase().includes(q),
      );
    }

    if (sortField && sortDir) {
      list.sort((a, b) => {
        const va = a[sortField as keyof VideoResponseDto] ?? "";
        const vb = b[sortField as keyof VideoResponseDto] ?? "";
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

  const handleApprove = async (video: VideoResponseDto) => {
    // TODO: call approveVideo API
    toast.success(`Đã phê duyệt: ${video.title}`);
  };

  const handleDelete = (video: VideoResponseDto) => {
    // TODO: call deleteVideo API with confirm dialog
    toast.error(`Xoá video: ${video.title} (chưa triển khai)`);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-base-content">Quản lý video</h1>

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
            <button className="btn btn-sm btn-primary" onClick={fetchVideos}>
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
                      label="Kênh"
                      field="fullName"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="hidden lg:table-cell">
                    <SortHeader
                      label="Ngày đăng"
                      field="createdAt"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Loại"
                      field="videoType"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Trạng thái"
                      field="videoStatus"
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
                        <div className="flex items-center gap-3">
                          <div className="skeleton w-8 h-8 rounded-full shrink-0" />

                          <div className="space-y-1">
                            <div className="skeleton h-4 w-24" />
                            <div className="skeleton h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="skeleton h-4 w-24" />
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16 rounded-full" />
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16 rounded-full" />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="skeleton w-6 h-6 rounded" />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-base-content/40"
                    >
                      Không tìm thấy video nào
                    </td>
                  </tr>
                ) : (
                  displayed.map((video) => {
                    const status = statusConfig[video.videoStatus] ?? {
                      label: video.videoStatus,
                      badge: "badge-ghost",
                    };
                    const type = typeConfig[video.videoType] ?? {
                      label: video.videoType,
                      badge: "badge-ghost",
                    };
                    return (
                      <tr
                        key={video.id}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        {/* ID */}
                        <td className="text-base-content/50 text-xs font-mono">
                          #{video.id.slice(0, 6)}
                        </td>

                        {/* Thumbnail + title */}
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-10 rounded overflow-hidden bg-base-300 shrink-0 relative">
                              {video.thumbnail ? (
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-base-content/30">
                                  <Play className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-base-content text-sm line-clamp-2 max-w-[160px]">
                              {video.title}
                            </span>
                          </div>
                        </td>

                        {/* Avatar + fullName */}
                        <td>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={video.avatar} name={video.fullName} />

                            <div className="min-w-0">
                              <div className="font-medium text-sm text-base-content truncate max-w-[180px]">
                                {video.fullName}
                              </div>

                              <div className="text-xs text-base-content/60 truncate max-w-[180px]">
                                @{video.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* createdAt */}
                        <td className="hidden lg:table-cell text-base-content/60 text-sm">
                          {new Date(video.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>

                        {/* Type */}
                        <td>
                          <span className={`badge badge-sm ${type.badge}`}>
                            {type.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge badge-sm ${status.badge}`}>
                            {status.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {/* Xem video */}
                            <button
                              onClick={() => setWatchVideo(video)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Xem video"
                            >
                              <Play className="w-4 h-4 text-primary" />
                            </button>

                            {/* Xem chi tiết */}
                            <button
                              onClick={() => setDetailVideo(video)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Chi tiết"
                            >
                              <Info className="w-4 h-4 text-info" />
                            </button>

                            {/* Phê duyệt */}
                            <button
                              onClick={() => handleApprove(video)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Phê duyệt"
                              disabled={video.videoStatus === "ACCEPTED"}
                            >
                              <CheckCircle className="w-4 h-4 text-success" />
                            </button>

                            {/* Xoá */}
                            <button
                              onClick={() => handleDelete(video)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Xoá video"
                            >
                              <Trash2 className="w-4 h-4 text-error" />
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
              {data.totalElements.toLocaleString()} video
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

      {/* Modals */}
      {watchVideo && (
        <ModalWatchVideo
          video={watchVideo}
          onClose={() => setWatchVideo(null)}
        />
      )}
      {detailVideo && (
        <VideoDetailModal
          video={detailVideo}
          onClose={() => setDetailVideo(null)}
        />
      )}
    </div>
  );
}
