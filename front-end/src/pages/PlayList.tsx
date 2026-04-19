import { useAuthStore } from "@/stores/useAuthStore";
import RequireAuth from "@/components/RequireAuth";
import { ListVideo } from "lucide-react";

export default function PlayList() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <RequireAuth
        icon={ListVideo}
        message="Bạn cần đăng nhập để xem playlist của mình."
      />
    );
  }

  return <div className="p-4">PlayList</div>;
}
