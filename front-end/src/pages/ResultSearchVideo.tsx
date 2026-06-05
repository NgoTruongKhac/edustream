import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Để đọc dữ liệu query string từ URL
import VideoCard from "@/components/VideoCard";
import { searchVideos } from "@/api/videoApi"; // Dùng hàm API search
import ModalPlaylist from "@/components/ModalPlaylist";

export default function ResultSearchVideo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy keyword và page từ URL params (?keyword=abc&page=0)
  const keyword = searchParams.get("keyword") || "";
  const pageParam = Number(searchParams.get("page")) || 0;

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Thực hiện gọi hàm API search với tham số từ URL
        const data = await searchVideos(keyword, pageParam);
        setVideos(data.content ?? []);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm video:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword, pageParam]); // Chạy lại Effect này khi keyword hoặc số trang thay đổi

  const openPlaylistModal = (videoId: number) => {
    setSelectedVideoId(videoId);
    (
      document.getElementById("modal_playlist") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Tiêu đề hiển thị theo từ khóa tìm kiếm */}
      <h2 className="text-xl sm:text-2xl font-bold mt-2 mb-6">
        Kết quả tìm kiếm "{keyword}"
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <div className="skeleton w-full h-full" />
              </div>
              <div className="flex gap-3 pr-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="skeleton w-10 h-10 rounded-full" />
                </div>
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="mt-1 flex flex-col gap-2">
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <div className="skeleton w-7 h-7 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          Không tìm thấy video nào phù hợp với từ khóa của bạn.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.id}
              thumbnail={video.thumbnail}
              duration={video.duration}
              userId={video.userId}
              avatar={video.avatar}
              title={video.title}
              channel={video.fullName || video.username}
              view={video.view}
              createdAt={video.createdAt}
              onBookmarkClick={openPlaylistModal}
            />
          ))}
        </div>
      )}

      {/* Chỉ hiện phân trang nếu có hơn 12 video */}
      {videos.length > 12 && (
        <div className="flex justify-center items-center mt-12 gap-1">
          <button
            disabled={pageParam === 0}
            onClick={() =>
              setSearchParams({ keyword, page: String(pageParam - 1) })
            }
            className="btn btn-sm btn-ghost gap-1.5 disabled:opacity-30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Trước
          </button>

          <div className="flex items-center gap-1 mx-1">
            {pageParam > 0 && (
              <button
                onClick={() =>
                  setSearchParams({ keyword, page: String(pageParam - 1) })
                }
                className="btn btn-sm btn-ghost min-w-[2.25rem]"
              >
                {pageParam}
              </button>
            )}

            <button className="btn btn-sm btn-primary min-w-[2.25rem] pointer-events-none">
              {pageParam + 1}
            </button>

            {videos.length >= 12 && (
              <button
                onClick={() =>
                  setSearchParams({ keyword, page: String(pageParam + 1) })
                }
                className="btn btn-sm btn-ghost min-w-[2.25rem]"
              >
                {pageParam + 2}
              </button>
            )}
          </div>

          <button
            disabled={videos.length < 12}
            onClick={() =>
              setSearchParams({ keyword, page: String(pageParam + 1) })
            }
            className="btn btn-sm btn-ghost gap-1.5 disabled:opacity-30"
          >
            Sau
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      <dialog id="modal_playlist" className="modal">
        {selectedVideoId && <ModalPlaylist videoId={selectedVideoId} />}
      </dialog>
    </main>
  );
}
