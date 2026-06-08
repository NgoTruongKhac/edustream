import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore"; // Điều chỉnh lại đường dẫn cho đúng dự án của bạn

interface AdminRouteProps {
  // Bạn có thể truyền component Forbidden tùy biến vào đây nếu muốn
  forbiddenElement?: React.ReactNode;
}

export default function AdminRoute({ forbiddenElement }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // 1. Chờ kiểm tra trạng thái đăng nhập (tránh việc nhảy sang trang Forbidden khi chưa kịp load xong user)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    ); // Hoặc một loading spinner của bạn
  }

  // 2. Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu đã đăng nhập nhưng role KHÔNG PHẢI là ADMIN
  if (user.role !== "ADMIN") {
    return forbiddenElement ? (
      <>{forbiddenElement}</>
    ) : (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <p className="mt-4 text-xl font-semibold text-gray-700">
          Forbidden - Bạn không có quyền truy cập trang này!
        </p>
      </div>
    );
  }

  // 4. Nếu hợp lệ, cho phép render các route con bên trong thông qua <Outlet />
  return <Outlet />;
}
