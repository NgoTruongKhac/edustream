import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  message: string;
  icon: LucideIcon;
}

export default function RequireAuth({ message, icon: Icon }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon lớn */}
      <div className="mb-6">
        <Icon className="w-20 h-20 text-neutral-800" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
        Yêu cầu đăng nhập
      </h2>

      {/* Description */}
      <p className="text-neutral-500 mb-6 max-w-md">{message}</p>

      {/* Button */}
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-2 btn rounded-lg border border-neutral-300 text-blue-600 hover:bg-blue-50 transition"
      >
        Đăng nhập
      </button>
    </div>
  );
}
