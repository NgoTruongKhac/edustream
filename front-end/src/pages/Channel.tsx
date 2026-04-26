import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserByUsername } from "@/api/userApi";
import { getVideosByUsername } from "@/api/videoApi";
import VideoCard from "@/components/VideoCard";
import { useAuthStore } from "@/stores/useAuthStore";

// --- Types ---
interface VideoResponseDto {
  id: number;
  title: string;
  thumbnail: string;
  duration: number;
  videoType: "YOUTUBE" | "UPLOAD";
  fullName: string;
  avatar: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}

// Định nghĩa Interface dựa theo UserResponseDto.java
interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  description: string;
  email: string;
  avatar: string;
  coverImage: string;
  authProvider: string;
  providerId: string;
}

export default function Channel() {
  const { username } = useParams<{ username: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [videos, setVideos] = useState<VideoResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username || !username.startsWith("@")) {
        setLoading(false);
        return;
      }

      const actualUsername = username.substring(1);

      try {
        setLoading(true);
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

  useEffect(() => {
    if (!username || !username.startsWith("@")) return;
    const actualUsername = username.substring(1);
    fetchVideos(actualUsername, 0, true);
  }, [username]);

  const fetchVideos = async (
    actualUsername: string,
    page: number,
    replace = false,
  ) => {
    setVideosLoading(true);
    try {
      const data: PageResponse<VideoResponseDto> = await getVideosByUsername(
        actualUsername,
        page,
      );
      setVideos((prev) =>
        replace ? data.content : [...prev, ...data.content],
      );
      setCurrentPage(data.number);
      setIsLastPage(data.last);
    } catch (error) {
      console.error("Lỗi khi tải danh sách video:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!username || !username.startsWith("@")) return;
    fetchVideos(username.substring(1), currentPage + 1);
  };

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
      {user?.coverImage && (
        <div className="w-full h-25 sm:h-[100px] md:h-[200px] bg-neutral-200">
          <img
            src={user?.coverImage}
            alt="Channel Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

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
              <span>100 N người đăng ký</span>
              <span>•</span>
              <span>{videos.length} video</span>
            </div>

            {user.description && (
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2 max-w-3xl">
                {user.description}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              {currentUser ? (
                <>
                  <Link
                    to={"/edit-profile"}
                    className="btn bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition"
                  >
                    chỉnh sửa hồ sơ
                  </Link>

                  <Link
                    to={"/manage-videos"}
                    className="btn bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition"
                  >
                    quản lý video
                  </Link>
                </>
              ) : (
                <button className="btn bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition">
                  Đăng ký
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Thanh Điều Hướng Tabs */}
        <div className="flex items-center border-b border-neutral-200 mt-8 font-medium text-sm">
          <button className="pb-3 px-4 border-b-2 border-neutral-900 text-neutral-900">
            Video
          </button>
        </div>

        {/* 4. Danh sách Video */}
        <div className="mt-6 pb-8">
          {videosLoading && videos.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              Đang tải video...
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              Kênh này chưa có video nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6">
                {videos.map((video) => (
                  <VideoCard
                    videoId={video.id}
                    key={video.id}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    avatar={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                    }
                    title={video.title}
                    channel={user.fullName}
                    views=""
                    createdAt={video.createdAt}
                  />
                ))}
              </div>

              {/* Load more */}
              {!isLastPage && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={videosLoading}
                    className="btn bg-primary-500 text-white btn-sm rounded-xl px-6"
                  >
                    {videosLoading ? "Đang tải..." : "Xem thêm"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
