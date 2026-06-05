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
      intervalIdRef.current = null; // FIX 2: luôn reset về null
    }
  }, []);

  const startTracking = useCallback(() => {
    if (viewTrackedRef.current) return;
    if (intervalIdRef.current) return; // đang đếm rồi, không tạo thêm

    intervalIdRef.current = setInterval(() => {
      viewTimerRef.current += 1;
      console.log("[ViewTrack] seconds watched:", viewTimerRef.current); // debug

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
    stopTracking(); // FIX 2: hàm này đã reset intervalIdRef về null
  }, [videoId, stopTracking]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  // FIX 3: YouTube tracking — parse playerState đúng cách
  useEffect(() => {
    if (video?.videoType !== "YOUTUBE") return;

    const handleYoutubeMessage = (event: MessageEvent) => {
      try {
        // Bỏ qua message không phải string hoặc không parse được JSON
        if (typeof event.data !== "string") return;
        if (event.data.includes("initialDelivery")) return;

        const data = JSON.parse(event.data);
        let playerState: number | undefined;

        if (
          data.event === "infoDelivery" &&
          typeof data.info?.playerState === "number"
        ) {
          playerState = data.info.playerState;
        } else if (
          data.event === "onStateChange" &&
          typeof data.info === "number"
        ) {
          playerState = data.info;
        }

        if (playerState === undefined) return;

        console.log("[ViewTrack] YouTube playerState:", playerState);

        if (playerState === 1) {
          // PLAYING
          startTracking();
        } else if (playerState === 2 || playerState === 0) {
          // PAUSED | ENDED
          stopTracking();
        }
      } catch {
        // Bỏ qua message không phải JSON của YouTube
      }
    };

    window.addEventListener("message", handleYoutubeMessage);
    return () => window.removeEventListener("message", handleYoutubeMessage);

    // FIX 1: thêm startTracking và stopTracking vào deps
  }, [video, videoId, startTracking, stopTracking]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để thực hiện tính năng này!");
      return;
    }

    if (!video || !videoId) return;

    // 1. Lưu lại trạng thái cũ đề phòng API lỗi thì Rollback
    const previousIsLiked = video.liked;
    const previousLikeCount = video.likeCount;

    // 2. Cập nhật UI ngay lập tức (Optimistic Update)
    setVideo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isLiked: !prev.liked, // Đảo trạng thái true <-> false
        likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1, // Tăng hoặc Giảm số lượng
      };
    });

    try {
      // 3. Gọi API gửi lên server
      const updatedVideo = await likeVideo(Number(videoId));

      // Đồng bộ lại dữ liệu chuẩn từ server trả về
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

      // 4. Nếu lỗi, hoàn tác (Rollback) UI về trạng thái cũ trước khi bấm
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

  const embedUrl = `https://www.youtube.com/embed/${video?.videoYoutubeId}?autoplay=1&rel=0&enablejsapi=1`;

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
                  onPlay={startTracking}
                  onPause={stopTracking}
                  onEnded={stopTracking}
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
                  <button
                    onClick={handleLike}
                    className={`btn btn-sm btn-ghost join-item gap-1.5 px-4 rounded-l-full hover:bg-base-200 active:scale-95 transition-all
      ${video.liked ? "text-primary " : ""}`} // Thay đổi màu nút khi đã like
                  >
                    <ThumbsUp
                      size={16}
                      className={video.liked ? "fill-primary text-primary" : ""}
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
          </div>

          {/* ===== RIGHT: Related Videos ===== */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
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
                    onClick={() => navigate(`/watch/${v.id}`)} // Chuyển trang mượt mà bằng React Router
                  >
                    {/* Thumbnail */}
                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-base-300 shrink-0">
                      <img
                        src={
                          v.thumbnail ||
                          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80"
                        }
                        alt={v.title}
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
                      <h3 className="text-sm font-semibold text-base-content line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {v.title}
                      </h3>

                      {/* Channel Name */}
                      <p className="text-xs text-base-content/60 mt-1 hover:text-base-content transition-colors">
                        {v.fullName}
                      </p>

                      {/* Meta info: Date */}
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
          </div>
        </div>
      </div>

      <dialog id="modal_playlist" className="modal">
        {selectedVideoId && <ModalPlaylist videoId={selectedVideoId} />}
      </dialog>
    </div>
  );
}
