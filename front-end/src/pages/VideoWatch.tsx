import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVideoById } from "@/api/videoApi";
import Comment from "@/components/Comment";
import { ThumbsUp, Share2, Bookmark, Eye } from "lucide-react";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuthStore } from "@/stores/useAuthStore";
import ModalPlaylist from "@/components/ModalPlaylist";

// --- Types ---
interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration: number;
  videoType: "YOUTUBE" | "UPLOAD";
  videoUrl: string;
  videoYoutubeUrl: string;
  videoYoutubeId: string;
  fullName: string;
  username: string;
  avatar: string;
  createdAt: string;
}

// --- Mock data cho video liên quan ---
const RELATED_VIDEOS = [
  {
    id: "r1",
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
    duration: 765,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80",
    title: "Giải Tích 1: Giới Hạn Hàm Số - Lý Thuyết Đầy Đủ",
    channel: "Toán Học Online",
    views: "124N",
    createdAt: "2024-03-10T00:00:00Z",
  },
  {
    id: "r2",
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80",
    duration: 2720,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80",
    title: "Khám Phá Cấu Trúc Nguyên Tử: Từ Cơ Bản Đến Nâng Cao",
    channel: "Khoa Học Vui",
    views: "89N",
    createdAt: "2024-02-20T00:00:00Z",
  },
  {
    id: "r3",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    duration: 4500,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80",
    title: "Khóa Học Python Cơ Bản Dành Cho Người Mới Bắt Đầu",
    channel: "Code Việt",
    views: "250N",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "r4",
    thumbnail:
      "https://images.unsplash.com/photo-1546410531-bea5aad14e00?w=400&q=80",
    duration: 1110,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&q=80",
    title: "5 Phương Pháp Luyện Nghe Tiếng Anh Hiệu Quả Nhất",
    channel: "English Hub",
    views: "500N",
    createdAt: "2023-12-01T00:00:00Z",
  },
  {
    id: "r5",
    thumbnail:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&q=80",
    duration: 930,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80",
    title: "Lịch Sử Việt Nam: Thời Kỳ Dựng Nước Và Giữ Nước",
    channel: "Sử Việt",
    views: "320N",
    createdAt: "2024-04-01T00:00:00Z",
  },
];

// --- Helpers ---
const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function VideoWatch() {
  const { videoId } = useParams();

  const [video, setVideo] = useState<VideoResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchVideo = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getVideoById(Number(videoId));
        setVideo(data);
      } catch (err) {
        console.error("Lỗi khi tải video:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const embedUrl = `https://www.youtube.com/embed/${video?.videoYoutubeId}?autoplay=1&rel=0`;

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // --- Error / not found state ---
  if (error || !video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-base-100 gap-3 text-neutral-500">
        <Eye size={48} className="opacity-20" />
        <p className="text-lg font-medium">Không tìm thấy video này.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-100 min-h-screen">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== LEFT: Video Player + Info ===== */}
          <div className="flex-1 min-w-0">
            {/* --- Video Player --- */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
              {video.videoType === "YOUTUBE" ? (
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={video.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={video.thumbnail || undefined}
                >
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              )}
            </div>

            {/* --- Title --- */}
            <h1 className="text-lg sm:text-xl font-bold text-base-content mt-4 leading-snug">
              {video.title}
            </h1>

            {/* --- Channel Info + Actions --- */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* LEFT: Channel + Subscribe */}
              <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
                <Link
                  to={`/@${video.username}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                    <img
                      src={
                        video.avatar ||
                        `https://ui-avatars.com/api/?name=${video.fullName}&background=random`
                      }
                      alt={video.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-base-content text-sm truncate">
                      {video.fullName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(video.createdAt)}
                    </p>
                  </div>
                </Link>
                {currentUser?.username === video.username ? (
                  <button className="btn btn-sm bg-primary text-primary-content hover:bg-primary rounded-xl">
                    quản lý video
                  </button>
                ) : (
                  <SubscribeButton size="sm" username={video.username} />
                )}
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:overflow-visible">
                <div className="join rounded-full border border-neutral-200 shrink-0">
                  <button className="btn btn-sm btn-ghost join-item gap-1.5 px-4 rounded-l-full">
                    <ThumbsUp size={16} />
                    <span className="text-sm font-medium">64 N</span>
                  </button>
                </div>

                <button className="btn btn-sm btn-ghost border border-neutral-200 rounded-full gap-1.5 px-4 shrink-0">
                  <Share2 size={16} />
                  <span className="text-sm">Chia sẻ</span>
                </button>

                <button
                  onClick={() =>
                    (
                      document.getElementById(
                        "modal_playlist",
                      ) as HTMLDialogElement
                    )?.showModal()
                  }
                  className="btn btn-sm btn-ghost border border-neutral-200 rounded-full gap-1.5 px-4 shrink-0"
                >
                  <Bookmark size={16} />
                  <span className="text-sm">Lưu</span>
                </button>
              </div>
            </div>
            {/* --- Description Box --- */}
            <div
              className="mt-4 bg-base-200 hover:bg-base-300 transition-colors rounded-xl p-4 cursor-pointer"
              onClick={() => setDescExpanded((prev) => !prev)}
            >
              <div
                className={`text-sm text-base-content/80 whitespace-pre-line ${
                  descExpanded ? "" : "line-clamp-2"
                }`}
              >
                Video được đăng tải bởi{" "}
                <span className="font-semibold text-base-content">
                  {video.fullName}
                </span>
                .{"\n"}
                Ngày đăng tải:{" "}
                <span className="font-semibold text-base-content">
                  {formatDate(video.createdAt)}
                </span>
              </div>

              <p className="text-xs font-bold text-primary mt-2 uppercase tracking-wide">
                {descExpanded ? "Ẩn bớt" : "Xem thêm"}
              </p>
            </div>
            <Comment videoId={Number(videoId)} />
          </div>

          {/* ===== RIGHT: Related Videos ===== */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
            <h2 className="text-base font-semibold text-base-content mb-4">
              Video liên quan
            </h2>
            <div className="flex flex-col gap-3">
              {RELATED_VIDEOS.map((v) => (
                <div
                  key={v.id}
                  className="flex gap-3 cursor-pointer group"
                  onClick={() =>
                    (window.location.href = `/watch?videoId=${v.id}`)
                  }
                >
                  {/* Thumbnail */}
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-base-300 shrink-0">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge thời lượng - Dùng neutral để luôn tương phản tốt trên ảnh */}
                    <span className="absolute bottom-1 right-1 bg-neutral/90 text-neutral-content text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {Math.floor(v.duration / 60)}:
                      {String(v.duration % 60).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-start flex-1 min-w-0 pt-0.5">
                    <h3 className="text-sm font-semibold text-base-content line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {v.title}
                    </h3>

                    {/* Channel Name */}
                    <p className="text-xs text-base-content/60 mt-1 hover:text-base-content transition-colors">
                      {v.channel}
                    </p>

                    {/* Meta info: Views & Date */}
                    <p className="text-xs text-base-content/50">
                      {new Date(v.createdAt).toLocaleDateString("vi-VN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <dialog id="modal_playlist" className="modal">
        <ModalPlaylist />
      </dialog>
    </div>
  );
}
