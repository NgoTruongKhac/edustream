// ModalRegister.tsx
import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/utils/validationSchema";
import { register as signup, verifyOtp, loginWithGoogle } from "@/api/authApi";
import { useShowModalStore } from "@/stores/useShowModal";
import z from "zod";
import { OTPModal } from "@/components/OTPModal";
import Cookies from "js-cookie";

type RegisterFormData = z.infer<typeof registerSchema>;

const openModal = (id: string) =>
  (document.getElementById(id) as HTMLDialogElement)?.showModal();
const closeModal = (id: string) =>
  (document.getElementById(id) as HTMLDialogElement)?.close();

export default function ModalRegister() {
  const showModal = useShowModalStore((state) => state.showModal);
  const setShowModal = useShowModalStore((state) => state.setShowModal);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      await signup(data.fullName, data.email, data.password);
      setIsLoading(false);
      setShowModal(true);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-box w-full max-w-sm p-10">
      {/* Nút đóng */}
      <form method="dialog">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
          ✕
        </button>
      </form>

      <h2 className="text-2xl font-bold text-base-content mb-2">Đăng Ký</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium text-base-content">
              Họ và tên
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              placeholder="Nguyễn Văn A"
              className="input w-full pl-11 bg-base-100 border-base text-base-content placeholder:text-base-50 focus:bg-base focus:border-primary focus:ring-1 focus:ring-primary-100 rounded-xl transition-all"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium text-base-content">
              Email
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="ví dụ: tenban@email.com"
              className="input w-full pl-11 bg-base-100 border-base text-base-content placeholder:text-base focus:bg-base focus:border-primary focus:ring-1 focus:ring-primary-100 rounded-xl transition-all"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium text-base-content">
              Mật khẩu
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Tạo mật khẩu mạnh"
              className="input w-full pl-11 pr-11 bg-base-100 border-base text-base-content focus:bg-base-100 focus:border-primary focus:ring-1 focus:ring-primary-100 rounded-xl transition-all"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn w-full bg-primary text-primary-content border-none hover:bg-primary/90 rounded-xl mt-4 text-base font-medium"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Tạo tài khoản"
          )}
        </button>
      </form>
      {/* Divider */}
      <div className="divider text-sm my-4 text-base-content">hoặc</div>

      {/* Nút Đăng nhập Google */}
      <button
        onClick={() => loginWithGoogle()}
        className="btn w-full bg-base-100 border border-base hover:bg-base-200 text-base-content rounded-xl gap-3 font-medium"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Đăng nhập với Google
      </button>

      {/* Chuyển sang đăng nhập */}
      <p className="text-center text-base-content mt-8">
        Đã có tài khoản?{" "}
        <button
          className="text-primary font-semibold hover:underline cursor-pointer"
          onClick={() => {
            closeModal("modal_register");
            openModal("modal_login");
          }}
        >
          Đăng nhập ngay
        </button>
      </p>

      {/* OTP Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <OTPModal
            verifyFn={async (otp) => {
              const { accessToken, refreshToken } = await verifyOtp(otp);
              Cookies.set("accessToken", accessToken);
              Cookies.set("refreshToken", refreshToken);
            }}
            onSuccess={() => window.location.replace("/")}
          />
        </dialog>
      )}
    </div>
  );
}
