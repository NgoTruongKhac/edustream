import { Search, Settings } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar bg-white shadow-soft px-4 sm:px-6 py-3 sticky top-0 z-50">
      {/* 1. Phần Logo (Bên trái) */}
      <div className="navbar-start">
        <a
          href="/"
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src={logo_full}
            alt="logo full"
            className="h-10 w-auto object-contain"
          />
        </a>
      </div>

      {/* 2. Phần Input Search (Ở giữa) */}
      <div className="navbar-center hidden lg:flex w-full max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            className="input w-full pl-11 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100 rounded-xl transition-all"
          />
        </div>
      </div>

      {/* 3. Phần Icons và Nút xác thực (Bên phải) */}
      <div className="navbar-end flex items-center gap-1 sm:gap-2">
        {/* Nút tìm kiếm (Chỉ hiện ở mobile) */}
        <button className="btn btn-ghost btn-circle lg:hidden text-neutral-600 hover:text-primary hover:bg-primary-50">
          <Search className="w-5 h-5" />
        </button>

        {/* Nút Cài đặt */}
        <button
          className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary-50 transition-colors"
          title="Cài đặt"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Cụm nút Đăng nhập / Đăng ký */}
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <Link to={"/login"}>
            <button className="btn btn-ghost text-neutral-700 hover:text-primary hover:bg-primary-50 font-medium rounded-xl">
              Đăng nhập
            </button>
          </Link>

          <Link to={"/register"}>
            <button className="btn bg-primary text-white border-none hover:bg-primary-600 shadow-sm font-medium rounded-xl">
              Đăng ký
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
