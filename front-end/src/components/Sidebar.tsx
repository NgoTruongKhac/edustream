import {
  Home,
  ListVideo,
  MonitorPlay,
  Settings,
  HelpCircle,
  User,
  AlignJustify,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
    isActive
      ? "bg-primary-500 text-white"
      : "text-neutral-700 hover:bg-neutral-100"
  }`;

const menus = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/playlist", label: "Playlist", icon: ListVideo },
  { to: "/subscriptions", label: "Kênh đăng ký", icon: MonitorPlay },
  { to: "/profile", label: "Hồ sơ", icon: User },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-60 md:hidden"
        />
      )}
      <div
        className={`
    flex flex-col justify-between bg-[#f8faff] p-3
    
    fixed top-0 left-0 h-full w-[200px] shadow-2xl z-70 
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    
    md:w-[200px] md:shrink-0 md:flex 
    md:h-[calc(100vh-64px)] md:sticky md:top-16
    md:border-r md:border-neutral-100 md:shadow-none md:translate-x-0 md:z-auto
  `}
      >
        <div className="space-y-1 relative">
          {/* Nút đóng Sidebar (Chỉ hiển thị trên Mobile) */}
          <div className="flex items-center justify-between px-3 py-2 mb-2 md:hidden border-b border-neutral-200">
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <AlignJustify className="w-5 h-5" />
            </button>
          </div>

          {menus.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={navClass}
              onClick={onClose}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Menu phía dưới */}
        <div className="space-y-1 border-t border-neutral-200 pt-3">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-xl font-medium transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
          </a>
        </div>
      </div>
    </>
  );
}
