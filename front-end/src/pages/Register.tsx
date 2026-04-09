import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* --- CỘT TRÁI: FORM ĐĂNG KÝ --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 bg-white shadow-soft lg:shadow-none z-10 rounded-t-3xl mt-12 lg:mt-0 lg:rounded-none">
        {/* Logo hiển thị trên Mobile */}
        <div className="lg:hidden flex justify-center mb-8">
          <img src={logo_full} alt="logo" className="h-10 w-auto" />
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0 lg:pl-10 pt-10 pb-10 xl:pl-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Đăng Ký</h2>

          <form className="space-y-4">
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
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="input w-full pl-11 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
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
                  type="email"
                  placeholder="ví dụ: tenban@email.com"
                  className="input w-full pl-11 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu mạnh"
                  className="input w-full pl-11 pr-11 bg-neutral-50 border-neutral-200 text-neutral-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Đồng ý điều khoản */}
            <div className="flex items-start mt-2 pt-2">
              <label className="cursor-pointer flex gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary rounded mt-1"
                />
                <span className="label-text text-neutral-600 text-sm leading-relaxed">
                  Tôi đồng ý với các{" "}
                  <a href="#" className="text-primary hover:underline">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            {/* Nút Đăng ký */}
            <button className="btn w-full bg-primary text-white border-none hover:bg-primary-600 rounded-xl mt-4 text-base font-medium">
              Tạo tài khoản
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
    </div>
  );
}
