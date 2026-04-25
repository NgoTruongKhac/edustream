import ModalShareVideoYouTube from "@/components/ModallShareVideoYouTube";
import RequireAuth from "@/components/RequireAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Link,
  CloudUpload,
  Filter,
  ListFilter,
  Pencil,
  Trash2,
  SquarePlay,
} from "lucide-react";
import { useState } from "react";

// --- Mock Data ---

const videos = [
  {
    id: 1,
    title: "Đại số tuyến tính - Bài 1: Ma trận",
    teacher: "Nguyễn Văn A",
    category: "Toán học",
    dotColor: "bg-blue-600",
    date: "24 Thg 10, 2023",
    views: "1.2K",
    status: "Công khai",
    duration: "12:45",
    thumbnail:
      "https://images.unsplash.com/photo-1632559646095-c49646c25229?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Phân tích tác phẩm Chí Phèo - Phần 1",
    teacher: "Trần Thị B",
    category: "Văn học",
    dotColor: "bg-red-500",
    date: "22 Thg 10, 2023",
    views: "856",
    status: "Công khai",
    duration: "45:20",
    thumbnail:
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Cấu trúc tế bào động vật và thực vật",
    teacher: "Lê Văn C",
    category: "Khoa học",
    dotColor: "bg-indigo-500",
    date: "20 Thg 10, 2023",
    views: "0",
    status: "Riêng tư",
    duration: "28:15",
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=200&auto=format&fit=crop",
  },
];

export default function ManageVideos() {
  const user = useAuthStore((state) => state.user);
  const [openModalShareVideoYoutube, setOpenModalShareVideoYoutube] =
    useState(false);

  if (!user) {
    return (
      <RequireAuth
        icon={SquarePlay}
        message="Bạn cần đăng nhập để đăng tải video."
      />
    );
  }
  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-8 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Quản lý Video
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                document.getElementById("modal_share_video_youtube").showModal()
              }
              className="btn bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-xl px-5"
            >
              <Link size={18} />
              Chia sẻ từ YouTube
            </button>
            <button className="btn bg-primary-500 hover:bg-primary-600 text-white border-none shadow-sm rounded-xl px-5">
              <CloudUpload size={18} />
              Tải lên Video
            </button>
          </div>
        </div>
        {/* --- Video List Section --- */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Tất cả video</h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm btn-circle text-gray-600">
                <Filter size={20} />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle text-gray-600">
                <ListFilter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[900px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <div className="col-span-5">Video</div>
                <div className="col-span-2">Danh mục</div>
                <div className="col-span-2">Ngày tải lên</div>
                <div className="col-span-2">Lượt xem</div>
                <div className="col-span-1 text-center">Thao tác</div>
              </div>

              {/* Video Rows */}
              <div className="flex flex-col gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-xl p-3 grid grid-cols-12 gap-4 items-center hover:shadow-soft transition-shadow"
                  >
                    {/* Col 1: Video Info */}
                    <div className="col-span-5 flex gap-4 items-center">
                      <div className="relative w-36 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-900">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                          {video.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Giáo viên: {video.teacher}
                        </p>
                      </div>
                    </div>

                    {/* Col 2: Category */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-sm font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${video.dotColor}`}
                        ></span>
                        {video.category}
                      </span>
                    </div>

                    {/* Col 3: Date */}
                    <div className="col-span-2 text-gray-600 text-sm font-medium">
                      {video.date}
                    </div>

                    {/* Col 4: Views & Status */}
                    <div className="col-span-2 flex items-center gap-4">
                      <span className="text-gray-700 text-sm font-medium">
                        {video.views}
                      </span>
                      {video.status === "Công khai" ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          Công khai
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Riêng tư
                        </span>
                      )}
                    </div>

                    {/* Col 5: Actions */}
                    <div className="col-span-1 flex justify-center gap-1">
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
        </div>
      </div>
      <dialog id="modal_share_video_youtube" className="modal">
        <ModalShareVideoYouTube />
      </dialog>
    </div>
  );
}
