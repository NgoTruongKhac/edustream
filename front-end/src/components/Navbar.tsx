import {
  Search,
  Bell,
  User,
  AlignJustify,
  LogOut,
  Palette,
} from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { themes } from "@/utils/themes";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const setTheme = useThemeStore((state) => state.setTheme);
  const themeNow = useThemeStore((s) => s.theme);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="navbar bg-base-100 shadow-soft px-4 sm:px-6 py-3 sticky top-0 z-50">
      {/* LEFT */}
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

      {/* CENTER */}
      <div className="navbar-center hidden lg:flex w-full max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            className="input w-full pl-11 
            bg-base-200 border-base-400 border 
            text-base-content placeholder:text-base-content/50
            focus:bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
            rounded-xl transition-all"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-end flex items-center gap-1 sm:gap-2">
        {/* Mobile search */}
        <button className="btn btn-ghost btn-circle lg:hidden text-neutral-600 hover:text-primary hover:bg-primary/10">
          <Search className="w-5 h-5" />
        </button>

        <div className="dropdown dropdown-end">
          {/* Trigger */}
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle text-base-content hover:text-primary hover:bg-primary/10 transition-colors"
            title="Theme"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-sm bg-base-100 rounded-box z-[100] mt-3 w-44 p-2 shadow border border-base-300"
          >
            {themes.map((theme, key) => (
              <li key={key}>
                <button
                  onClick={() => setTheme(theme)}
                  className={`flex items-center gap-2 ${
                    themeNow === theme ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  {/* preview màu */}
                  <div
                    data-theme={theme}
                    className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
                  >
                    <div className="bg-base-content size-1.5 rounded-full"></div>
                    <div className="bg-primary size-1.5 rounded-full"></div>
                    <div className="bg-secondary size-1.5 rounded-full"></div>
                    <div className="bg-accent size-1.5 rounded-full"></div>
                  </div>

                  <span className="text-sm capitalize">{theme}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {user && (
          <button
            className="btn btn-ghost btn-circle text-base-content hover:text-primary hover:bg-primary/10 transition-colors"
            title="Cài đặt"
          >
            <Bell className="w-5 h-5" />
          </button>
        )}

        {user ? (
          <div className="ml-2 dropdown dropdown-end">
            <div tabIndex={0} role="button" className="cursor-pointer">
              <div className="avatar hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary shadow-sm">
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

            {/* DROPDOWN */}
            <div
              tabIndex={0}
              className="dropdown-content mt-3 w-50 z-[100]
              bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden"
            >
              {/* HEADER */}
              <div className="px-4 py-3 border-b border-base-300">
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

                  <div className="flex flex-col justify-center min-w-0">
                    <span className="font-semibold text-base-content text-sm truncate">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-base-content/60 truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* MENU */}
              <ul className="menu p-2 w-full">
                <li>
                  <Link
                    to={`@${user.username}`}
                    className="flex items-center gap-2 text-base-content
                    hover:text-primary hover:bg-primary/10
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
                    text-error hover:text-error hover:bg-error/10
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
                <button className="btn btn-ghost text-base-content hover:text-primary hover:bg-primary/10 font-medium rounded-xl">
                  Đăng nhập
                </button>
              </Link>

              <Link to={"/register"}>
                <button className="btn bg-primary text-primary-content border-none hover:bg-primary/90 shadow-sm font-medium rounded-xl">
                  Đăng ký
                </button>
              </Link>
            </div>

            <div className="dropdown dropdown-end sm:hidden ml-1">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary/10"
              >
                <User className="w-5 h-5" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-soft bg-base-100 rounded-box w-48 mt-4 z-[1]"
              >
                <li>
                  <Link
                    to={"/login"}
                    className="text-base-content hover:text-primary hover:bg-primary/10 font-medium"
                  >
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/register"}
                    className="text-primary hover:bg-primary/10 font-medium mt-1"
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
