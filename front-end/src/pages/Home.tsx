import VideoCard from "@/components/VideoCard";

// Mock data (giữ nguyên như cũ)
const CATEGORIES = [
  "Tất cả",
  "Toán học",
  "Khoa học",
  "Lập trình",
  "Tiếng Anh",
  "Lịch sử",
  "Nghệ thuật",
];

const MOCK_VIDEOS = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    duration: "12:45",
    avatar: "https://ui-avatars.com/api/?name=Toan+Hoc&background=random",
    title: "Giải Tích 1: Giới Hạn Hàm Số - Lý Thuyết...",
    channel: "Toán Học Academy",
    views: "124N lượt xem",
    time: "2 ngày trước",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    duration: "45:20",
    avatar: "https://ui-avatars.com/api/?name=Khoa+Hoc&background=random",
    title: "Khám Phá Cấu Trúc Nguyên Tử: Từ...",
    channel: "Khoa Học Vui",
    views: "89N lượt xem",
    time: "1 tuần trước",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    duration: "1:15:00",
    avatar: "https://ui-avatars.com/api/?name=Code&background=random",
    title: "Khóa Học Python Cơ Bản Dành Cho Người...",
    channel: "Code With Me",
    views: "250N lượt xem",
    time: "1 tháng trước",
  },
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1546410531-bea5aad14e00?w=600&q=80",
    duration: "18:30",
    avatar: "https://ui-avatars.com/api/?name=English&background=random",
    title: "5 Phương Pháp Luyện Nghe Tiếng Anh Hiệu...",
    channel: "English Daily",
    views: "500N lượt xem",
    time: "3 tháng trước",
  },
];

export default function Home() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Wrapper chứa Categories và Icon Menu */}
      <div className="flex items-center gap-3 w-full border-b border-transparent">
        {/* Thanh lọc danh mục (Cuộn ngang) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide flex-1">
          {CATEGORIES.map((category, index) => (
            <button
              key={index}
              className={`whitespace-nowrap btn btn-sm h-9 rounded-lg font-medium transition-all border-none ${
                index === 1 // Demo: Set cứng "Toán học"
                  ? "btn-primary text-primary-content shadow-sm"
                  : "bg-base-200 hover:bg-base-300 text-base-content/80 hover:text-base-content"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mt-4 mb-6">
        Video phổ biến
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
        {MOCK_VIDEOS.map((video) => (
          <VideoCard
            key={video.id}
            thumbnail={video.thumbnail}
            duration={video.duration}
            avatar={video.avatar}
            title={video.title}
            channel={video.channel}
            views={video.views}
            time={video.time}
          />
        ))}
      </div>
    </main>
  );
}
