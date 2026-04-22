import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserByUsername } from "@/api/userApi";
import VideoCard from "@/components/VideoCard";
import { useAuthStore } from "@/stores/useAuthStore";

// Mock data giả lập api getVideoByUsername
const MOCK_VIDEOS = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    duration: "12:45",
    title: "Giải Tích 1: Giới Hạn Hàm Số - Lý Thuyết...",
    views: "124N lượt xem",
    time: "2 ngày trước",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    duration: "45:20",
    title: "Khám Phá Cấu Trúc Nguyên Tử: Từ...",
    views: "89N lượt xem",
    time: "1 tuần trước",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    duration: "1:15:00",
    title: "Khóa Học Python Cơ Bản Dành Cho Người...",
    views: "250N lượt xem",
    time: "1 tháng trước",
  },
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1546410531-bea5aad14e00?w=600&q=80",
    duration: "18:30",
    title: "5 Phương Pháp Luyện Nghe Tiếng Anh Hiệu...",
    views: "500N lượt xem",
    time: "3 tháng trước",
  },
];

// Định nghĩa Interface dựa theo UserResponseDto.java
interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  description: string;
  email: string;
  avatar: string;
  authProvider: string;
  providerId: string;
}

export default function Channel() {
  // Lấy username từ URL. VD URL là /@7clouds -> username = "7clouds"
  // Biến username lúc này sẽ chứa cả dấu @ (Ví dụ: "@ngotruongkhac")
  const { username } = useParams<{ username: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // 1. Kiểm tra xem param có hợp lệ (bắt đầu bằng @) không
      if (!username || !username.startsWith("@")) {
        setLoading(false);
        return;
      }

      // 2. Cắt bỏ dấu @ ở đầu tiên để lấy username thật ("ngotruongkhac")
      const actualUsername = username.substring(1);

      try {
        setLoading(true);
        // 3. Gọi API với username không có @
        const userData = await getUserByUsername(actualUsername);
        setUser(userData);
      } catch (error) {
        console.error("Lỗi khi tải thông tin kênh:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-neutral-500">
        Đang tải thông tin kênh...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 text-center text-neutral-500">
        Không tìm thấy người dùng này.
      </div>
    );
  }
  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* 1. Phần Ảnh Bìa (Banner - Giả lập) */}
      <div className="w-full h-25 sm:h-[100px] md:h-[200px] bg-neutral-200">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"
          alt="Channel Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. Thông tin Channel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-6">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
            }
            alt={user.fullName}
            className="w-25 h-25 sm:w-37 sm:h-37 rounded-full object-cover shadow-sm border border-neutral-100"
          />

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {user.fullName}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-neutral-600 mt-1 gap-x-2">
              <span className="font-medium text-neutral-900">
                @{user.username}
              </span>
              <span>•</span>
              <span>100 N người đăng ký</span> {/* Giả lập số liệu */}
              <span>•</span>
              <span>120 video</span>
            </div>

            {user.description && (
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2 max-w-3xl">
                {user.description}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              {currentUser ? (
                <Link
                  to={"/edit-profile"}
                  className="btn bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition"
                >
                  tuỳ chỉnh hồ sơ
                </Link>
              ) : (
                <button className="btn bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition">
                  Đăng ký
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Thanh Điều Hướng Tabs (Chỉ giữ Video) */}
        <div className="flex items-center border-b border-neutral-200 mt-8 font-medium text-sm">
          <button className="pb-3 px-4 border-b-2 border-neutral-900 text-neutral-900">
            Video
          </button>
        </div>

        {/* 4. Danh sách Video */}
        <div className="mt-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
            {MOCK_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                thumbnail={video.thumbnail}
                duration={video.duration}
                // Tận dụng thông tin user thực tế truyền vào cho VideoCard
                avatar={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                }
                title={video.title}
                channel={user.fullName}
                views={video.views}
                time={video.time}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
