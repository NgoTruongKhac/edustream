import { useAuthStore } from "@/stores/useAuthStore";
import RequireAuth from "@/components/RequireAuth";
import { MonitorPlay } from "lucide-react";

export default function Subscription() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <RequireAuth
        icon={MonitorPlay}
        message="Bạn cần đăng nhập để xem kênh đã đăng ký."
      />
    );
  }

  return <div className="p-4">Subscription</div>;
}
