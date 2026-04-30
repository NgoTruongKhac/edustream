import { Mail, Lock, ArrowLeft } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/utils/validationSchema";
import { useAuthStore } from "@/stores/useAuthStore";
import { loginWithGoogle } from "@/api/authApi";

import z from "zod";
import { Link } from "react-router-dom";

type LoginFormData = z.infer<typeof loginSchema>;
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const login = useAuthStore((state) => state.login);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);

      window.location.replace("/");
    } catch (error: any) {
      if (error.response?.data) {
        setError("password", {
          type: "manual",
          message: error.response.data.message,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* --- CỘT TRÁI: FORM ĐĂNG NHẬP --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 bg-base-100 lg:shadow-none z-10 rounded-t-3xl mt-12 lg:mt-0 lg:rounded-none">
        {/* Logo hiển thị trên Mobile (bị ẩn phần intro bên phải nên cần hiện ở đây) */}
        <div className="lg:hidden flex justify-center mb-8">
          <img src={logo_full} alt="logo" className="h-10 w-auto" />
        </div>
        <Link
          to={"/"}
          className="inline-flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-colors mb-3 mt-1"
        >
          <ArrowLeft size={18} className="opacity-80" />
          <span>Trang chủ</span>
        </Link>

        <div className="w-full max-w-sm mx-auto lg:mx-0 pl-10 pr-10  pt-10 pb-10 border border-primary rounded-2xl">
          <h2 className="text-3xl font-bold text-base-content mb-2">
            Đăng nhập
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input Email */}
            <div className="form-control">
              <label className="label py-1">
                <span
                  className="label-text font-medium text-base-content
                "
                >
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
                  placeholder="ví dụ: tenban@email.com"
                  {...register("email")}
                  className="input w-full pl-11 bg-base-100 border-base-50 text-base-content placeholder:text-base focus:bg-base-100 focus:border-primary focus:ring-1 focus:ring-primary-100 rounded-xl transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Input Password */}
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
                  placeholder="••••••••"
                  className="input w-full pl-11 pr-11 bg-base-100 border-base text-base-content focus:bg-base-100 focus:border-primary focus:ring-1 focus:ring-primary-100 rounded-xl transition-all"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quên mật khẩu & Ghi nhớ */}
            <div className="flex items-center justify-between mt-2">
              <label className="cursor-pointer label p-0 gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="label-text text-base-content">
                  Ghi nhớ tôi
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-primary font-medium hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              className="btn w-full bg-primary text-primary-content border-none hover:bg-primary/90 rounded-xl mt-2 text-base font-medium"
            >
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-sm my-6 text-base-content">
            hoặc tiếp tục với
          </div>

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

          {/* Chuyển hướng Đăng ký */}
          <p className="text-center text-base-content mt-8">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      {/* --- CỘT PHẢI: GIỚI THIỆU & LOGO (Chỉ hiện trên màn hình lớn) --- */}
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
            Nền tảng hàng đầu <br /> cho sự sáng tạo
          </h1>
          <p className="text-lg text-primary-800/80 leading-relaxed">
            Kết nối tri thức, chia sẻ đam mê và cùng nhau xây dựng những giá trị
            tuyệt vời. Khám phá các tính năng ưu việt dành riêng cho bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
