import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { filterVideos } from "@/api/videoApi";
import ModalPlaylist from "@/components/ModalPlaylist";
import { SEO } from "@/components/SEO"; // 1. Import component SEO

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
  { label: "Lượt xem nhiều nhất", value: "mostviewed" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostviewed">(
    "newest",
  );
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const currentTitle =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
    "Danh sách video";

  // Tìm nhãn (label) danh mục hiện tại để đưa vào thẻ Meta SEO
  const currentCategoryLabel =
    CATEGORIES.find((cat) => cat.value === selectedCategory)?.label || "Tất cả";

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
    <>
      {/* 2. Tích hợp cấu hình SEO động theo danh mục đang chọn */}
      <SEO
        title={
          selectedCategory
            ? `Bài giảng ${currentCategoryLabel} trực tuyến`
            : "Nền Tảng Chia Sẻ Video Bài Giảng Trực Tuyến"
        }
        description={`Khám phá các video bài giảng ${currentCategoryLabel.toLowerCase()} chất lượng cao tại EduStream. Nền tảng chia sẻ kiến thức trực tuyến từ các chuyên gia hàng đầu.`}
        image="https://edustream.com/default-banner.jpg" // Điền URL ảnh banner đại diện nền tảng của bạn tại đây
        url={
          selectedCategory
            ? `https://edustream.com/?category=${selectedCategory}`
            : "https://edustream.com"
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Categories + Sort Filter (Sử dụng thẻ ngữ nghĩa <section>) */}
        <section
          aria-label="Bộ lọc video"
          className="flex items-center gap-3 w-full border-b border-transparent"
        >
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
              aria-label="Sắp xếp video"
              className="cursor-pointer select select-sm h-9 rounded-lg bg-base-200 border-none font-medium text-base-content/80 w-auto min-w-max whitespace-nowrap pr-8"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "mostviewed")
              }
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="whitespace-nowrap"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* 3. Đổi h2 thành h1 tại Trang Chủ để báo hiệu cho Bot biết đây là tiêu đề chính của trang */}
        <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-6 capitalize">
          {selectedCategory
            ? `Video ${currentCategoryLabel} - ${currentTitle}`
            : `Video ${currentTitle}`}
        </h1>

        {/* Khung chứa danh sách video */}
        <section aria-label="Danh sách bài giảng">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  {/* Thumbnail skeleton */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <div className="skeleton w-full h-full" />
                  </div>

                  {/* Info */}
                  <div className="flex gap-3 pr-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="skeleton w-10 h-10 rounded-full" />
                    </div>

                    {/* Text */}
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-4 w-4/5" />

                      <div className="mt-1 flex flex-col gap-2">
                        <div className="skeleton h-3 w-1/2" />
                        <div className="skeleton h-3 w-2/3" />
                      </div>
                    </div>

                    {/* Menu button */}
                    <div className="flex-shrink-0 pt-1">
                      <div className="skeleton w-7 h-7 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              Không có video nào thuộc danh mục này.
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
                  channel={video.fullName}
                  channelLink={video.username}
                  view={video.view}
                  createdAt={video.createdAt}
                  onBookmarkClick={openPlaylistModal}
                />
              ))}
            </div>
          )}
        </section>

        <dialog id="modal_playlist" className="modal">
          {selectedVideoId && <ModalPlaylist videoId={selectedVideoId} />}
        </dialog>
      </main>
    </>
  );
}
