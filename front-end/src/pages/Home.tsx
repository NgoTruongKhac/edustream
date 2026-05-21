import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { filterVideos } from "@/api/videoApi";
import ModalPlaylist from "@/components/ModalPlaylist";

const CATEGORIES = [
  { label: "Tất cả", value: "" },
  { label: "Toán học", value: "toan-hoc" },
  { label: "Khoa học", value: "khoa-hoc" },
  { label: "Lập trình", value: "lap-trinh" },
  { label: "Tiếng Anh", value: "tieng-anh" },
  { label: "Lịch sử", value: "lich-su" },
  { label: "Nghệ thuật", value: "nghe-thuat" },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const params: any = { sortBy };
        if (selectedCategory) params.category = selectedCategory;
        const data = await filterVideos(params);
        setVideos(data.content ?? []);
      } catch (err) {
        console.error("Lỗi khi tải video:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedCategory, sortBy]);
  const openPlaylistModal = (videoId: number) => {
    setSelectedVideoId(videoId);

    (
      document.getElementById("modal_playlist") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Categories + Sort Filter */}
      <div className="flex items-center gap-3 w-full border-b border-transparent">
        {/* Thanh lọc danh mục */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap btn btn-sm h-9 rounded-lg font-medium transition-all border-none ${
                selectedCategory === cat.value
                  ? "btn-primary text-primary-content shadow-sm"
                  : "bg-base-200 hover:bg-base-300 text-base-content/80 hover:text-base-content"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="pb-4 flex-shrink-0">
          <select
            className="select select-sm h-9 rounded-lg bg-base-200 border-none font-medium text-base-content/80"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mt-4 mb-6">
        Video phổ biến
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          Không có video nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.id}
              thumbnail={video.thumbnail}
              duration={video.duration}
              avatar={video.avatar}
              title={video.title}
              channel={video.fullName || video.username}
              views=""
              createdAt={video.createdAt}
              onBookmarkClick={openPlaylistModal}
            />
          ))}
        </div>
      )}
      <dialog id="modal_playlist" className="modal">
        {selectedVideoId && <ModalPlaylist videoId={selectedVideoId} />}
      </dialog>
    </main>
  );
}
