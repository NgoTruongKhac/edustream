import { useAuthStore } from "@/stores/useAuthStore";
import RequireAuth from "@/components/RequireAuth";
import { User } from "lucide-react";

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <RequireAuth
        icon={User}
        message="Bạn cần đăng nhập để xem lịch sử của mình."
      />
    );
  }

  return <div className="p-4">PlayList</div>;
}
