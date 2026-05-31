import { X, Tag, Hash, Users, Clock, Link2 } from "lucide-react";

interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  duration: number;
  videoType: "YOUTUBE" | "UPLOAD";
  videoStatus: "ACCEPTED" | "REJECTED" | "PENDING";
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

interface Props {
  video: VideoResponseDto;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  ACCEPTED: { label: "Đã duyệt", badge: "badge-success" },
  REJECTED: { label: "Từ chối", badge: "badge-error" },
  PENDING: { label: "Chờ duyệt", badge: "badge-warning" },
};

const typeConfig: Record<string, { label: string; badge: string }> = {
  YOUTUBE: { label: "YouTube", badge: "badge-error" },
  UPLOAD: { label: "Upload", badge: "badge-info" },
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2 border-b border-base-200 last:border-0">
      <span className="text-xs text-base-content/50 w-32 shrink-0 pt-0.5 font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 text-sm text-base-content break-all">
        {children}
      </div>
    </div>
  );
}

export default function VideoDetailModal({ video, onClose }: Props) {
  const status = statusConfig[video.videoStatus] ?? {
    label: video.videoStatus,
    badge: "badge-ghost",
  };
  const type = typeConfig[video.videoType] ?? {
    label: video.videoType,
    badge: "badge-ghost",
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg text-base-content">
              Chi tiết video
            </h3>
            <p className="text-xs text-base-content/40 font-mono mt-0.5">
              #{video.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail */}
        {video.thumbnail && (
          <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-base-300">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-0">
          <Row label="Tiêu đề">{video.title}</Row>

          <Row label="Mô tả">
            <span className="whitespace-pre-wrap">
              {video.description || (
                <span className="text-base-content/30 italic">
                  Không có mô tả
                </span>
              )}
            </span>
          </Row>

          <Row label="Loại video">
            <span className={`badge badge-sm ${type.badge}`}>{type.label}</span>
          </Row>

          <Row label="Trạng thái">
            <span className={`badge badge-sm ${status.badge}`}>
              {status.label}
            </span>
          </Row>

          <Row label="Thời lượng">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-base-content/40" />
              {formatDuration(video.duration)}
            </span>
          </Row>

          <Row label="Kênh">
            <div className="flex items-center gap-2">
              {video.avatar ? (
                <img
                  src={video.avatar}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-base-300"
                  alt={video.fullName}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-base-300">
                  {video.fullName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{video.fullName}</p>
                <p className="text-xs text-base-content/50">
                  @{video.username}
                </p>
              </div>
            </div>
          </Row>

          <Row label="Subscribers">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-base-content/40" />
              {video.subscribersCount.toLocaleString()}
            </span>
          </Row>

          <Row label="Ngày đăng">
            {new Date(video.createdAt).toLocaleString("vi-VN")}
          </Row>

          {video.videoUrl && (
            <Row label="Video URL">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="link link-primary flex items-center gap-1 text-xs"
              >
                <Link2 className="w-3 h-3" /> {video.videoUrl}
              </a>
            </Row>
          )}

          {video.videoYoutubeUrl && (
            <Row label="YouTube URL">
              <a
                href={video.videoYoutubeUrl}
                target="_blank"
                rel="noreferrer"
                className="link link-error flex items-center gap-1 text-xs"
              >
                <Link2 className="w-3 h-3" /> {video.videoYoutubeUrl}
              </a>
            </Row>
          )}

          {video.categories?.length > 0 && (
            <Row label="Danh mục">
              <div className="flex flex-wrap gap-1">
                {video.categories.map((c) => (
                  <span key={c} className="badge badge-sm badge-ghost gap-1">
                    <Tag className="w-2.5 h-2.5" /> {c}
                  </span>
                ))}
              </div>
            </Row>
          )}

          {video.hashtags?.length > 0 && (
            <Row label="Hashtag">
              <div className="flex flex-wrap gap-1">
                {video.hashtags.map((h) => (
                  <span key={h} className="badge badge-sm badge-outline gap-1">
                    {h}
                  </span>
                ))}
              </div>
            </Row>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
