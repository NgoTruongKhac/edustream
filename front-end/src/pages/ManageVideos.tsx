import ModalShareVideoYouTube from "@/components/ModallShareVideoYouTube";
import RequireAuth from "@/components/RequireAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import { getVideosByCurrentUser } from "@/api/videoApi";
import {
  Link,
  CloudUpload,
  Filter,
  ListFilter,
  Pencil,
  Trash2,
  SquarePlay,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import ModalUploadVideo from "@/components/ModalUploadVideo";

// --- Types ---
interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  videoType: "YOUTUBE" | "UPLOAD";
  videoYoutubeUrl: string;
  fullName: string;
  avatar: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-indexed)
  last: boolean;
}

// --- Helpers ---
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

export default function ManageVideos() {
  const user = useAuthStore((state) => state.user);

  const [videos, setVideos] = useState<VideoResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (page: number, replace = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: PageResponse<VideoResponseDto> =
        await getVideosByCurrentUser(page);

      setVideos((prev) =>
        replace ? data.content : [...prev, ...data.content],
      );
      setCurrentPage(data.number);
      setIsLastPage(data.last);
    } catch (err) {
      setError("Không thể tải danh sách video. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVideos(0, true);
    }
  }, [user]);

  if (!user) {
    return (
      <RequireAuth
        icon={SquarePlay}
        message="Bạn cần đăng nhập để đăng tải video."
      />
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-base-content">
              Quản lý Video
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {/* Nút Chia sẻ từ YouTube - Sử dụng style ghost hoặc outline để tạo sự phân cấp */}
            <button
              onClick={() =>
                (
                  document.getElementById(
                    "modal_share_video_youtube",
                  ) as HTMLDialogElement
                )?.showModal()
              }
              className="btn btn-outline btn-ghost border-base-300 shadow-sm rounded-xl px-5 normal-case text-base-content"
            >
              <Link size={18} />
              Chia sẻ từ YouTube
            </button>

            {/* Nút Tải lên Video - Sử dụng màu Primary làm điểm nhấn chính */}
            <button
              onClick={() =>
                (
                  document.getElementById(
                    "modal_upload_video",
                  ) as HTMLDialogElement
                )?.showModal()
              }
              className="btn btn-primary shadow-md rounded-xl px-5 normal-case"
            >
              <CloudUpload size={18} />
              Tải lên Video
            </button>
          </div>
        </div>

        {/* --- Video List Section --- */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-base-content">
              Tất cả video
            </h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm btn-circle text-base-content">
                <Filter size={20} />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle text-base-content">
                <ListFilter size={20} />
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={() => fetchVideos(0, true)}
                className="mt-3 btn btn-sm btn-outline btn-error"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && videos.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <SquarePlay size={48} className="mx-auto mb-3 opacity-30" />
              <p>Bạn chưa có video nào.</p>
            </div>
          )}

          {/* Table */}
          {videos.length > 0 && (
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[900px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-base-content tracking-wider mb-2">
                  <div className="col-span-5">Video</div>
                  <div className="col-span-2">Loại</div>
                  <div className="col-span-3">Ngày tải lên</div>
                  <div className="col-span-2 text-center">Thao tác</div>
                </div>

                {/* Video Rows */}
                <div className="flex flex-col gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-xl p-3 grid grid-cols-12 gap-4 items-center hover:shadow-soft transition-shadow bg-base-100"
                    >
                      {/* Col 1: Video Info */}
                      <div className="col-span-5 flex gap-4 items-center">
                        <div className="relative w-36 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-900">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-base-content text-[10px] font-medium px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content text-base mb-1 line-clamp-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <img
                              src={video.avatar}
                              alt={video.fullName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <p className="text-sm text-base-content">
                              {video.fullName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Video Type */}
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                            video.videoType === "YOUTUBE"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              video.videoType === "YOUTUBE"
                                ? "bg-red-500"
                                : "bg-blue-600"
                            }`}
                          />
                          {video.videoType === "YOUTUBE" ? "YouTube" : "Upload"}
                        </span>
                      </div>

                      {/* Col 3: Date */}
                      <div className="col-span-3 text-base-content text-sm font-medium">
                        {formatDate(video.createdAt)}
                      </div>

                      {/* Col 4: Actions */}
                      <div className="col-span-2 flex justify-center gap-1">
                        <button className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-primary">
                          <Pencil size={18} />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Load more / Loading indicator */}
          <div className="flex justify-center mt-6">
            {isLoading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              !isLastPage &&
              videos.length > 0 && (
                <button
                  onClick={() => fetchVideos(currentPage + 1)}
                  className="btn bg-primary text-primary-content btn-sm rounded-xl px-6"
                >
                  Xem thêm
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <dialog id="modal_share_video_youtube" className="modal">
        <ModalShareVideoYouTube />
      </dialog>
      <dialog id="modal_upload_video" className="modal">
        <ModalUploadVideo />
      </dialog>
    </div>
  );
}
