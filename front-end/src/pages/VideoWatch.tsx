import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getVideoById,
  getRelatedVideos,
  trackVideoView,
  likeVideo,
} from "@/api/videoApi";
import Comment from "@/components/Comment";
import { ThumbsUp, Share2, Bookmark, Eye } from "lucide-react";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuthStore } from "@/stores/useAuthStore";
import ModalPlaylist from "@/components/ModalPlaylist";
import toast from "react-hot-toast";
import YouTube from "react-youtube";
import { SEO } from "@/components/SEO"; // 1. Import component SEO của bạn

// --- Types ---
interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration: number;
  view: number;
  likeCount: number;
  liked: boolean;
  videoType: "YOUTUBE" | "UPLOAD";
  videoUrl: string;
  videoYoutubeUrl: string;
  videoYoutubeId: string;
  fullName: string;
  username: string;
  avatar: string;
  createdAt: string;
}

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
  const navigate = useNavigate();

  const [video, setVideo] = useState<VideoResponseDto | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const viewTimerRef = useRef<number>(0);
  const viewTrackedRef = useRef<boolean>(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const getDeviceIdentifier = useCallback((): string => {
    if (currentUser?.id) return String(currentUser.id);
    let anonymousId = localStorage.getItem("anonymous_device_id");
    if (!anonymousId) {
      anonymousId =
        "anon_" + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem("anonymous_device_id", anonymousId);
    }
    return anonymousId;
  }, [currentUser]);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchVideoData = async () => {
      setLoading(true);
      setError(false);
      try {
        const numId = Number(videoId);

        // Gọi đồng thời cả 2 API để tối ưu hóa thời gian load trang
        const [videoData, relatedData] = await Promise.all([
          getVideoById(numId),
          getRelatedVideos(numId, 0),
        ]);

        setVideo(videoData);
        // Do cấu trúc trả về là PageResponse nên danh sách video nằm trong thuộc tính content
        setRelatedVideos(relatedData.content || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu video:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
    // Cuộn lên đầu trang khi người dùng chuyển sang xem video mới
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [videoId]);

  const stopTracking = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (viewTrackedRef.current) return;

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      viewTimerRef.current += 1;
      console.log("[ViewTrack] seconds watched:", viewTimerRef.current);

      if (viewTimerRef.current >= 5) {
        viewTrackedRef.current = true;
        stopTracking();

        const identifier = getDeviceIdentifier();
        console.log("[ViewTrack] Firing view event, identifier:", identifier);

        trackVideoView(Number(videoId), identifier)
          .then(() => console.log("[ViewTrack] Success"))
          .catch((err) => console.error("[ViewTrack] Error:", err));
      }
    }, 1000);
  }, [videoId, getDeviceIdentifier, stopTracking]);

  // Reset khi đổi video
  useEffect(() => {
    viewTimerRef.current = 0;
    viewTrackedRef.current = false;
    stopTracking();
  }, [videoId, stopTracking]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để thực hiện tính năng này!");
      return;
    }

    if (!video || !videoId) return;

    const previousIsLiked = video.liked;
    const previousLikeCount = video.likeCount;

    setVideo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isLiked: !prev.liked,
        likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
      };
    });

    try {
      const updatedVideo = await likeVideo(Number(videoId));

      if (updatedVideo) {
        setVideo((prev) =>
          prev
            ? {
                ...prev,
                likeCount: updatedVideo.likeCount,
                isLiked: updatedVideo.isLiked,
              }
            : null,
        );
      }
    } catch (err) {
      console.error("Lỗi khi toggle like video:", err);
      toast.error("Thao tác thất bại. Vui lòng thử lại!");

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              isLiked: previousIsLiked,
              likeCount: previousLikeCount,
            }
          : null,
      );
    }
  };

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

  const handleOpenModalPlaylist = () => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập!");
      return;
    }

    setSelectedVideoId(Number(videoId));

    (
      document.getElementById("modal_playlist") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <>
      {/* 2. Nhúng Component SEO tại đây ngay sau khi dữ liệu đã sẵn sàng */}
      <SEO
        title={video.title}
        description={
          video.description?.substring(0, 160) ||
          `Xem video bài giảng trực tuyến từ giảng viên ${video.fullName} tại EduStream.`
        }
        image={video.thumbnail}
        url={`https://edustream.com/watch/${video.id}`} // Khắc phục bug canonical rác của CSR
        type="video.other"
      />

      {/* 3. Thay đổi div bọc lớn bên ngoài thành thẻ ngữ nghĩa <main> */}
      <main className="flex-1 bg-base-100 min-h-screen">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ===== LEFT: Video Player + Info (Chuyển thành thẻ <article>) ===== */}
            <article className="flex-1 min-w-0">
              {/* --- Video Player --- */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                {video.videoType === "YOUTUBE" ? (
                  <YouTube
                    videoId={video.videoYoutubeId}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                    opts={{
                      playerVars: {
                        autoplay: 1,
                        rel: 0,
                      },
                    }}
                    onPlay={startTracking}
                    onPause={stopTracking}
                    onEnd={stopTracking}
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={video.thumbnail || undefined}
                    onPlay={startTracking}
                    onPause={stopTracking}
                    onEnded={stopTracking}
                  >
                    Trình duyệt của bạn không hỗ trợ phát video.
                  </video>
                )}
              </div>

              {/* --- Title (Bắt buộc giữ h1 duy nhất cho trang xem video) --- */}
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
                        alt={`Ảnh đại diện kênh ${video.fullName}`} // Tối ưu alt ảnh cho SEO Image
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
                    <button
                      onClick={handleLike}
                      className={`btn btn-sm btn-ghost join-item gap-1.5 px-4 rounded-l-full hover:bg-base-200 active:scale-95 transition-all
        ${video.liked ? "text-primary " : ""}`}
                    >
                      <ThumbsUp
                        size={16}
                        className={
                          video.liked ? "fill-primary text-primary" : ""
                        }
                      />
                      <span className="text-sm font-medium">
                        {video.likeCount}
                      </span>
                    </button>
                  </div>

                  <button className="btn btn-sm btn-ghost border border-neutral-200 rounded-full gap-1.5 px-4 shrink-0">
                    <Share2 size={16} />
                    <span className="text-sm">Chia sẻ</span>
                  </button>

                  <button
                    onClick={handleOpenModalPlaylist}
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
                  {"\n\n"}
                  {video.description}
                </div>

                <p className="text-xs font-bold text-primary mt-2 uppercase tracking-wide">
                  {descExpanded ? "Ẩn bớt" : "Xem thêm"}
                </p>
              </div>
              <Comment videoId={Number(videoId)} />
            </article>

            {/* ===== RIGHT: Related Videos (Chuyển thành thẻ <aside>) ===== */}
            <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
              {/* Thẻ liên quan đổi sang H2 theo cấp phân rã sau H1 tiêu đề video */}
              <h2 className="text-base font-semibold text-base-content mb-4">
                Video liên quan
              </h2>
              <div className="flex flex-col gap-3">
                {relatedVideos.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    Không có video liên quan nào.
                  </p>
                ) : (
                  relatedVideos.map((v) => (
                    <div
                      key={v.id}
                      className="flex gap-3 cursor-pointer group"
                      onClick={() => navigate(`/watch/${v.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-base-300 shrink-0">
                        <img
                          src={
                            v.thumbnail ||
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80"
                          }
                          alt={`Thumbnail video: ${v.title}`} // Tối ưu alt cho hình ảnh liên quan
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Badge thời lượng */}
                        <span className="absolute bottom-1 right-1 bg-neutral/90 text-neutral-content text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {Math.floor(v.duration / 60)}:
                          {String(v.duration % 60).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col justify-start flex-1 min-w-0 pt-0.5">
                        {/* Tiêu đề danh sách con giữ ở thẻ H3 là chuẩn ngữ nghĩa */}
                        <h3 className="text-sm font-semibold text-base-content line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {v.title}
                        </h3>

                        <p className="text-xs text-base-content/60 mt-1 hover:text-base-content transition-colors">
                          {v.fullName}
                        </p>

                        <p className="text-xs text-base-content/50">
                          {new Date(v.createdAt).toLocaleDateString("vi-VN", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>

        <dialog id="modal_playlist" className="modal">
          {selectedVideoId && <ModalPlaylist videoId={selectedVideoId} />}
        </dialog>
      </main>
    </>
  );
}
