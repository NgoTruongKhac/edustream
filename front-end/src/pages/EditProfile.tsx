import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Camera, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  uploadCoverImage,
  uploadAvatar,
  changeEmail,
  verifyChangeEmail,
  updateUser,
} from "@/api/userApi";
import { useShowModalStore } from "@/stores/useShowModal";
import { OTPModal } from "@/components/OTPModal";
export default function EditProfile() {
  const user = useAuthStore((state) => state.user);
  // Nếu Zustand store của bạn có hàm cập nhật user, hãy lấy ra để dùng. Ví dụ:
  const setUser = useAuthStore((state) => state.setUser);

  const isGoogleUser = user?.authProvider === "GOOGLE";

  // 1. Khởi tạo state để lưu trữ dữ liệu đang chỉnh sửa trên form
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    description: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const showModal = useShowModalStore((state) => state.showModal);
  const setShowModal = useShowModalStore((state) => state.setShowModal);

  const { logout } = useAuthStore();

  // 2. Cập nhật formData khi thông tin user được tải xong
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        username: user.username || "",
        description: user.description || "",
      });
    }
  }, [user]);

  // Xử lý Upload Ảnh Bìa
  const handleUploadCoverImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const toastId = toast.loading("Đang tải ảnh bìa lên...");

      const updatedUser = await uploadCoverImage(file);
      setUser(updatedUser); // Cập nhật lại user trong Zustand để UI đổi ảnh ngay

      toast.success("Cập nhật ảnh bìa thành công!", { id: toastId });
    } catch (error: any) {
      console.error("Lỗi khi upload ảnh bìa:", error);
      const message = error?.response?.data?.message || "Tải ảnh lên thất bại!";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = ""; // Reset input để có thể chọn lại cùng 1 file nếu cần
    }
  };

  // Xử lý Upload Avatar
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const toastId = toast.loading("Đang tải ảnh đại diện lên...");

      const updatedUser = await uploadAvatar(file);
      setUser(updatedUser); // Cập nhật lại user trong Zustand

      toast.success("Cập nhật ảnh đại diện thành công!", { id: toastId });
    } catch (error: any) {
      console.error("Lỗi khi upload avatar:", error);
      const message = error?.response?.data?.message || "Tải ảnh lên thất bại!";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // 3. Hàm xử lý thay đổi text ở input/textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Hoàn thiện handleUpdateUser
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn hành vi reload trang mặc định của thẻ <form>
    setIsUpdating(true);

    try {
      // Gọi API cập nhật
      const updatedUser = await updateUser(
        formData.fullName,
        formData.username,
        formData.description,
      );
      toast.success("cập nhật thành công!");
      setUser(updatedUser);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật thông tin:", error);

      const message = error?.response?.data?.message || "Cập nhật thất bại!";

      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeEmail = async () => {
    try {
      await changeEmail(newEmail);
      setIsEmailModalOpen(false);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  if (!user) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 px-4 py-2 sm:px-6 lg:px-10 font-sans">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-2 py-2 hover:bg-base-200 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <div className="mb-8 mt-2 text-center md:text-left">
          <h1 className="text-2xl font-bold text-base-content">
            Chỉnh sửa hồ sơ
          </h1>
        </div>

        <form className="flex flex-col gap-10" onSubmit={handleUpdateUser}>
          <div className="flex flex-col gap-6 pb-4">
            {/* Cover */}
            <div className="relative w-full h-40 bg-base-200 overflow-hidden group">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-base-content/60 gap-2">
                  <Camera size={28} />
                  <span className="text-sm font-medium">Thêm ảnh biểu ngữ</span>
                  <span className="text-xs text-base-content/50">
                    Tải ảnh nền cho hồ sơ của bạn
                  </span>
                </div>
              )}

              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadCoverImage}
                disabled={isUploadingImage}
              />

              <label
                htmlFor="banner-upload"
                className="absolute bottom-3 right-3 cursor-pointer p-2 rounded-full bg-base-content/40 text-base-100"
              >
                <Camera size={18} />
              </label>
            </div>

            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-32 h-32 group">
                <div className="avatar">
                  <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden">
                    <img src={user.avatar} alt="User Avatar" />
                  </div>
                </div>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadAvatar}
                  disabled={isUploadingImage}
                />

                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-base-content/20 text-base-100 rounded-full cursor-pointer"
                >
                  <Camera size={22} />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-base-content">
                {user.fullName}
              </h2>
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <label className="form-control w-full">
              <div className="label pt-0">
                <span className="label-text font-semibold text-base-content">
                  Họ và tên
                </span>
              </div>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200 text-base-content focus:input-primary"
              />
            </label>

            <label className="form-control w-full">
              <div className="label pt-0">
                <span className="label-text font-semibold text-base-content">
                  Tên định danh
                </span>
                <span className="label-text-alt text-base-content/50 italic">
                  (chỉ được thay đổi sau mỗi 30 ngày)
                </span>
              </div>
              <input
                name="username"
                value={`@${formData.username}`}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200 text-base-content focus:input-primary"
              />
            </label>

            {/* Email */}
            <label className="form-control w-full">
              <span className="label-text font-semibold text-base-content">
                Email
              </span>
              <input
                value={user.email}
                readOnly
                className="input input-bordered w-full bg-base-300 text-base-content/60 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="btn bg-primary text-primary-content mt-4 rounded-xl"
              >
                thay đổi Email
              </button>
            </label>

            {/* Provider */}
            <label className="form-control w-full">
              <span className="label-text font-semibold text-base-content">
                Phương thức đăng nhập
              </span>
              <input
                value={user.authProvider}
                readOnly
                className="input input-bordered w-full bg-base-300 text-base-content/60"
              />
            </label>
          </div>

          {/* Description */}
          <div className="w-full">
            <label className="form-control w-full">
              <div className="label pt-0 pb-2">
                <span className="label-text font-bold text-base-content text-base">
                  Mô tả bản thân
                </span>
                <span className="label-text-alt text-base-content/50 italic">
                  (Tối đa 500 ký tự){" "}
                </span>
              </div>
              {/* 6. Thay value = formData và thêm onChange */}
              <textarea
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full h-40 bg-base-200 text-base-content focus:textarea-primary"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost text-base-content hover:bg-base-200"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="btn bg-primary text-primary-content"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
      {isEmailModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-xl">
            <h3 className="font-bold text-lg mb-4">Thay đổi Email</h3>

            {/* Old Email */}
            <div className="form-control mb-4">
              <div className="label">
                <span className="label-text">Email hiện tại</span>
              </div>
              <p className="px-3 py-2 bg-base-200 rounded-lg text-base-content">
                {user.email}
              </p>
            </div>

            {/* New Email */}
            <input
              type="email"
              name="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Nhập email mới..."
              className="input input-bordered w-full"
              required
            />
            <div className="flex items-start gap-2 mt-3 p-3 bg-warning/20 border border-warning rounded-lg text-sm text-warning">
              <span>⚠️</span>
              <p>
                Bạn sẽ phải <span className="font-semibold">đăng nhập lại</span>{" "}
                sau khi thay đổi email, vì các phiên đăng nhập hiện tại sẽ không
                còn hợp lệ.
              </p>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="btn btn-ghost rounded-xl"
              >
                Hủy
              </button>

              <button
                type="submit"
                onClick={handleChangeEmail}
                disabled={isUpdatingEmail}
                className="btn bg-primary text-primary-content rounded-xl"
              >
                {isUpdatingEmail ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>

          {/* Click ngoài để đóng */}
          <div
            className="modal-backdrop"
            onClick={() => setIsEmailModalOpen(false)}
          ></div>
        </div>
      )}
      {showModal && (
        <dialog className="modal modal-open">
          <OTPModal
            verifyFn={verifyChangeEmail}
            onSuccess={() => {
              toast.success("Email đã được cập nhật thành công!");
              handleLogout();
            }}
          />
        </dialog>
      )}
    </div>
  );
}
