import { Search, Bell, User, AlignJustify, LogOut } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  // Lấy thông tin user từ Zustand store
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="navbar bg-white shadow-soft px-4 sm:px-6 py-3 sticky top-0 z-50">
      {/* 1. Phần Logo (Bên trái) */}
      <div className="navbar-start">
        <button
          onClick={onOpenSidebar}
          className="btn btn-ghost btn-circle md:hidden"
        >
          <AlignJustify className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src={logo_full}
            alt="logo full"
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      {/* 2. Phần Input Search (Ở giữa) - Ẩn trên mobile, hiện từ màn lg */}
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

        {/* Icon Bell hiển thị khi đã đăng nhập (Giữ nguyên, tự động hoạt động trên cả mobile và desktop) */}
        {user && (
          <button
            className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary-50 transition-colors"
            title="Cài đặt"
          >
            <Bell className="w-5 h-5" />
          </button>
        )}

        {/* --- CẬP NHẬT: Xử lý Avatar và Menu Đăng nhập/Đăng ký --- */}
        {user ? (
          <div className="ml-2 dropdown dropdown-end">
            {/* Avatar trigger */}
            <div tabIndex={0} role="button" className="cursor-pointer">
              <div className="avatar hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary-300 shadow-sm">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`
                    }
                    alt="User Avatar"
                  />
                </div>
              </div>
            </div>

            {/* Dropdown content */}
            <div
              tabIndex={0}
              className="dropdown-content mt-3 w-50 z-[100]
               bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName,
                          )}&background=random`
                        }
                        alt="Avatar"
                      />
                    </div>
                  </div>

                  {/* text */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="font-semibold text-neutral-800 text-sm truncate">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <ul className="menu p-2 w-full">
                <li>
                  <Link
                    to={`@${user.username}`}
                    className="flex items-center gap-2 text-neutral-700
                     hover:text-primary hover:bg-primary-50
                     font-medium rounded-lg px-3 py-2"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left
                     text-red-500 hover:text-red-600 hover:bg-red-50
                     font-medium rounded-lg px-3 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Link to={"/login"}>
                <button className="btn btn-ghost text-neutral-700 hover:text-primary hover:bg-primary-50 font-medium rounded-xl">
                  Đăng nhập
                </button>
              </Link>

              <Link to={"/register"}>
                <button className="btn bg-primary-500 text-white border-none hover:bg-primary-600 shadow-sm font-medium rounded-xl">
                  Đăng ký
                </button>
              </Link>
            </div>

            <div className="dropdown dropdown-end sm:hidden ml-1">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary-50"
              >
                <User className="w-5 h-5" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-soft bg-white rounded-box w-48 mt-4 z-[1]"
              >
                <li>
                  <Link
                    to={"/login"}
                    className="text-neutral-700 hover:text-primary hover:bg-primary-50 font-medium"
                  >
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/register"}
                    className="text-primary hover:bg-primary-50 font-medium mt-1"
                  >
                    Đăng ký
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
