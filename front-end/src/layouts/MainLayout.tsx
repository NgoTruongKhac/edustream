import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  // Quản lý trạng thái đóng/mở Sidebar trên Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans relative">
      {/* Navbar ở trên cùng */}
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Truyền state và hàm đóng vào Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
