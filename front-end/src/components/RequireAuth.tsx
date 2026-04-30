import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  message: string;
  icon: LucideIcon;
}

export default function RequireAuth({ message, icon: Icon }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-base-100">
      {/* Icon lớn - Sử dụng màu base-content với độ mờ nhẹ để tạo sự tinh tế */}
      <div className="mb-6 opacity-80">
        <Icon className="w-20 h-20 text-base-content" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-base-content mb-2">
        Yêu cầu đăng nhập
      </h2>

      {/* Description */}
      <p className="text-base-content/60 mb-8 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Button - Sử dụng btn-outline kết hợp primary để tạo vẻ ngoài hiện đại */}
      <button
        onClick={() => navigate("/login")}
        className="btn btn-primary btn-outline px-8 rounded-xl flex items-center gap-2 hover:shadow-md transition-all normal-case"
      >
        Đăng nhập
      </button>
    </div>
  );
}
