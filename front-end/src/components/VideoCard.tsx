import { Link } from "react-router-dom";
import { EllipsisVertical, Flag, Bookmark } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useState } from "react";
import ReportModal from "./ReportModal";

interface VideoCardProps {
  videoId: number;
  thumbnail: string;
  duration: number;
  userId: number;
  avatar: string;
  title: string;
  channel: string;
  channelLink: string;
  view: number;
  createdAt: string;
  onBookmarkClick?: (videoId: number) => void;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VideoCard({
  videoId,
  thumbnail,
  duration,
  userId,
  avatar,
  title,
  channel,
  channelLink,
  view,
  createdAt,
  onBookmarkClick,
}: VideoCardProps) {
  const currentUser = useAuthStore((state) => state.user);

  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Bạn cần đăng nhập!");
      return;
    }

    onBookmarkClick?.(videoId);
  };

  const handleFlagClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsReportOpen(true);
  };

  return (
    // 1. Chuyển đổi từ thẻ <div> sang thẻ ngữ nghĩa <article>
    <article className="flex flex-col gap-3 group">
      {/* Thumbnail & Duration */}
      <Link
        to={`/watch/${videoId}`}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-base-300 block"
      >
        <img
          src={thumbnail}
          alt={`Video bài giảng: ${title}`} // 2. Chuẩn hóa thuộc tính alt cho Thumbnail
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" // 3. Thêm Lazy load cho ảnh nằm ngoài màn hình đầu (Tối ưu Core Web Vitals)
        />
        <div className="absolute bottom-2 right-2 bg-neutral/90 text-neutral-content text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
          {formatDuration(duration)}
        </div>
      </Link>

      {/* Info */}
      <div className="flex gap-3 pr-2">
        {/* Avatar */}
        {/* 4. CHỈNH SỬA QUAN TRỌNG: Link Avatar trỏ về đúng trang Kênh (/@username hoặc /:username) */}
        <Link to={`/@${channelLink}`} className="flex-shrink-0 mt-1">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img
                src={avatar}
                alt={`Ảnh đại diện kênh ${channel}`} // 5. Tối ưu alt cho hình avatar
                loading="lazy"
              />
            </div>
          </div>
        </Link>

        {/* Text + Menu */}
        <div className="flex flex-1 min-w-0 justify-between items-start gap-1">
          <div className="flex flex-col min-w-0 flex-1">
            {/* Click vào tiêu đề dẫn sang trang watch */}
            <Link to={`/watch/${videoId}`}>
              <h3 className="text-base font-bold text-base-content line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>

            <div className="mt-1">
              {/* 6. CHỈNH SỬA QUAN TRỌNG: Tên kênh bọc trong thẻ Link hướng về đúng trang cá nhân của Tác giả */}
              <Link to={`/@${channel}`} className="inline-block">
                <p className="text-sm text-base-content/70 hover:text-primary transition-colors">
                  {channel}
                </p>
              </Link>
              <p className="text-sm text-base-content/60 mt-0.5">
                {view} lượt xem • {formatDate(createdAt)}
              </p>
            </div>
          </div>

          {/* Dropdown menu (Phần này bot tự động bỏ qua vì nằm trong nút tương tác) */}
          <div className="dropdown dropdown-top flex-shrink-0">
            <button
              tabIndex={0}
              onClick={(e) => e.preventDefault()}
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content mt-0.5"
              aria-label="Tùy chọn video"
            >
              <EllipsisVertical size={18} />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm bg-base-100 rounded-md shadow-lg border border-base-200 z-50 w-56 p-1.5 mt-1"
            >
              <li>
                <button
                  onClick={handleBookmarkClick}
                  className="flex items-center gap-2.5 text-sm text-base-content rounded-lg px-3 py-2 hover:bg-base-200"
                >
                  <Bookmark size={15} className="text-base-content/70" />
                  Thêm vào danh sách phát
                </button>
              </li>
              <li>
                <button
                  onClick={handleFlagClick}
                  className="flex items-center gap-2.5 text-sm text-error rounded-lg px-3 py-2 hover:bg-error/10"
                >
                  <Flag size={15} />
                  Báo cáo vi phạm
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        videoId={videoId}
        videoOwnerId={userId}
      />
    </article>
  );
}
