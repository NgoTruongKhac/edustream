import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Camera } from "lucide-react";

export default function EditProfile() {
  const user = useAuthStore((state) => state.user);
  const [bannerPreview, setBannerPreview] = useState("");

  // Khởi tạo state cho form
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    description: "",
    avatar: "",
    provider: "Email", // Trường provider theo yêu cầu
  });

  // Đồng bộ dữ liệu từ store vào form khi user đã load xong
  useEffect(() => {
    if (user) {
      setFormData({
        username: `@${user.username}` || "",
        fullName: user.fullName || "",
        email: user.email || "",
        description: user.description || "",
        // Avatar mặc định nếu chưa có
        avatar:
          user.avatar ||
          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
        provider: "Google", // Giả lập provider
      });
    }
  }, [user]);

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ở đây bạn sẽ gọi API để cập nhật profile
    console.log("Dữ liệu cần cập nhật:", formData);
  };

  // Hiển thị loading nếu chưa lấy được thông tin user
  if (!user) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    // Đặt nền chung cho toàn bộ trang
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-10 font-sans">
      <div className="container mx-auto max-w-5xl">
        {/* Tiêu đề trang - đặt ngoài phần nội dung trắng */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-2xl font-extrabold text-neutral-900">
            Chỉnh sửa hồ sơ
          </h1>
        </div>

        {/* Phần nội dung chính - Phẳng, không shadow, không border */}
        <div className="">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Khu vực Avatar - Không border-b, dùng spacing */}
            {/* Banner + Avatar */}
            <div className="flex flex-col gap-6 pb-4">
              {/* Banner */}
              <div className="relative w-full h-44 bg-neutral-200 overflow-hidden group">
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Hidden input */}
                <input id="banner-upload" type="file" className="hidden" />

                {/* Camera button */}
                <label
                  htmlFor="banner-upload"
                  className="absolute bottom-3 right-3 cursor-pointer
                 p-2 rounded-full bg-black/50 text-white
                 opacity-0 group-hover:opacity-100 transition"
                >
                  <Camera size={18} />
                </label>
              </div>

              {/* Avatar + Info */}
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative w-28 h-28 group">
                  <div className="avatar">
                    <div className="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                      <img src={formData.avatar} alt="User Avatar" />
                    </div>
                  </div>

                  {/* Hidden input */}
                  <input id="avatar-upload" type="file" className="hidden" />

                  {/* Overlay camera */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center
                   bg-black/40 text-white rounded-full cursor-pointer
                   opacity-0 group-hover:opacity-100 transition"
                  >
                    <Camera size={22} />
                  </label>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    {formData.fullName}
                  </h2>

                  <span className="text-xs text-neutral-500">
                    Định dạng hỗ trợ: JPG, PNG, GIF (Tối đa 2MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Các trường thông tin (Grid 2 cột) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <label className="form-control w-full">
                <div className="label pt-0">
                  <span className="label-text font-semibold text-neutral-700">
                    Họ và tên
                  </span>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên..."
                  className="input input-bordered w-full focus:input-primary transition-colors bg-base-50"
                />
              </label>

              {/* Username */}
              <label className="form-control w-full">
                <div className="label pt-0">
                  <span className="label-text font-semibold text-neutral-700">
                    Tên đăng nhập
                  </span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập username..."
                  className="input input-bordered w-full focus:input-primary transition-colors bg-base-50"
                />
              </label>

              {/* Email */}
              <label className="form-control w-full">
                <div className="label pt-0">
                  <span className="label-text font-semibold text-neutral-700">
                    Địa chỉ Email
                  </span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="input input-bordered w-full bg-neutral-100 text-neutral-600 cursor-not-allowed border-neutral-200"
                />
              </label>

              {/* Provider (Chỉ đọc) */}
              <label className="form-control w-full">
                <div className="label pt-0">
                  <span className="label-text font-semibold text-neutral-700">
                    Phương thức đăng nhập (Provider)
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.provider}
                  readOnly
                  className="input input-bordered w-full bg-neutral-100 text-neutral-600 cursor-not-allowed border-neutral-200"
                />
              </label>
            </div>

            {/* Description - Cân đối hơn bằng cách giới hạn chiều rộng và căn giữa */}
            {/* Description - Layout Flat & Balanced */}
            <div className="w-full">
              <label className="form-control w-full">
                {/* Label nằm trên */}
                <div className="label pt-0 pb-2">
                  <span className="label-text font-bold text-neutral-700 text-base">
                    Mô tả bản thân
                  </span>
                  <span className="label-text-alt text-neutral-400 italic">
                    (Tối đa 500 ký tự)
                  </span>
                </div>

                {/* TextArea nằm dưới */}
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Viết một chút về bản thân bạn..."
                  className="textarea textarea-bordered w-full h-40 focus:textarea-primary transition-all bg-neutral-50 border-neutral-200 text-base resize-none"
                ></textarea>
              </label>
            </div>

            {/* Khu vực Nút hành động - Không border-t, dùng spacing */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-2">
              <button
                type="button"
                className="btn btn-ghost text-neutral-700 hover:bg-neutral-100 px-6"
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary text-white px-8">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
