import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/utils/validationSchema";
import { register as signup } from "@/api/authApi";
import { useShowModalStore } from "@/stores/useShowModal";

import z from "zod";
import { OTPModal } from "@/components/OTPModal";

type LoginFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const showModal = useShowModalStore((state) => state.showModal);
  const setShowModal = useShowModalStore((state) => state.setShowModal);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      console.log("register");
      setIsLoading(true);
      await signup(data.fullName, data.email, data.password);
      setIsLoading(false);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* --- CỘT TRÁI: FORM ĐĂNG KÝ --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 bg-white shadow-soft lg:shadow-none z-10 rounded-t-3xl mt-12 lg:mt-0 lg:rounded-none">
        {/* Logo hiển thị trên Mobile */}
        <div className="lg:hidden flex justify-center mb-8">
          <img src={logo_full} alt="logo" className="h-10 w-auto" />
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0 pl-10 pr-10  pt-10 pb-10 border rounded-2xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Đăng Ký</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Input Full Name */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-neutral-700">
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
                  className="input w-full pl-11 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm p-0 m-0">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Input Email */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-neutral-700">
                  Email
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="ví dụ: tenban@email.com"
                  className="input w-full pl-11 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm p-0 m-0">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Input Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-neutral-700">
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
                  className="input w-full pl-11 pr-11 bg-neutral-50 border-neutral-200 text-neutral-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm p-0 m-0">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            {/* Nút Đăng ký */}
            <button
              type="submit"
              className="btn w-full bg-primary text-white border-none hover:bg-primary-600 rounded-xl mt-4 text-base font-medium"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>

          {/* Chuyển hướng Đăng nhập */}
          <p className="text-center text-neutral-600 mt-8">
            Đã có tài khoản?{" "}
            <a
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>

      {/* --- CỘT PHẢI: GIỚI THIỆU & LOGO --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-50 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-200/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-primary-300/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center max-w-lg">
          <img
            src={logo_full}
            alt="logo full"
            className="h-16 w-auto mx-auto mb-8 drop-shadow-md"
          />
          <h1 className="text-4xl font-bold text-primary-900 mb-6 leading-tight">
            Bắt đầu hành trình <br /> của bạn
          </h1>
          <p className="text-lg text-primary-800/80 leading-relaxed">
            Đăng ký tài khoản ngay hôm nay để trải nghiệm toàn bộ tính năng và
            tham gia vào cộng đồng năng động của chúng tôi.
          </p>
        </div>
      </div>
      {showModal && (
        <dialog className="modal modal-open">
          <OTPModal />
        </dialog>
      )}
    </div>
  );
}
