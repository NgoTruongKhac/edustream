import { useAuthStore } from "@/stores/useAuthStore";
import { Outlet, Navigate } from "react-router";

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
