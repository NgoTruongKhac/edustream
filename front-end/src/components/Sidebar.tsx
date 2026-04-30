import {
  Home,
  ListVideo,
  MonitorPlay,
  Settings,
  HelpCircle,
  SquarePlay,
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
      ? "bg-primary text-primary-content"
      : "text-base-content hover:bg-base-200"
  }`;

const menus = [
  { to: "/", label: "Trang chủ", icon: Home, end: true },
  { to: "/playlist", label: "Playlist", icon: ListVideo },
  { to: "/subscriptions", label: "Kênh đăng ký", icon: MonitorPlay },
  { to: "/manage-videos", label: "Video của tôi", icon: SquarePlay },
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
          flex flex-col justify-between
          bg-base-100 text-base-content p-3
          
          fixed top-0 left-0 h-full w-[200px] shadow-2xl z-70 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          
          md:w-[200px] md:shrink-0 md:flex 
          md:h-[calc(100vh-64px)] md:sticky md:top-16
          md:border-r md:border-base-300 md:shadow-none md:translate-x-0 md:z-auto
        `}
      >
        <div className="space-y-1 relative">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-3 py-2 mb-2 md:hidden border-b border-base-300">
            <button
              onClick={onClose}
              className="p-1.5 text-base-content hover:bg-base-200 rounded-lg transition-colors"
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

        {/* Bottom menu */}
        <div className="space-y-1 border-t border-base-300 pt-3">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-base-content hover:bg-base-200 rounded-xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-base-content hover:bg-base-200 rounded-xl font-medium transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
          </a>
        </div>
      </div>
    </>
  );
}
