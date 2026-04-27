import { useState, useEffect } from "react";
import {
  subscribe,
  unsubscribe,
  checkSubscription,
} from "@/api/subscriptionApi";
import toast from "react-hot-toast";

type Props = {
  username: string;
  size?: "sm" | "md" | "lg";
};

const SubscribeButton = ({ username, size = "md" }: Props) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Khởi tạo là true để chờ check api xong
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false); // Trạng thái khi đang bấm nút

  // 1. Tự động kiểm tra trạng thái khi component được render
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await checkSubscription(username);
        setIsSubscribed(status);
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái subscribe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [username]);

  // 2. Xử lý logic khi bấm nút
  const handleSubscribeClick = async () => {
    setIsActionLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe(username);
        setIsSubscribed(false);
        toast.success("Đã huỷ đăng ký kênh");
      } else {
        await subscribe(username);
        setIsSubscribed(true);
        toast.success("Đăng ký thành công");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Render giao diện
  // Nếu đang fetch trạng thái ban đầu, hiện khung xương (skeleton) hoặc ẩn để tránh nháy chữ
  if (isLoading) {
    return (
      <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
    );
  }

  return (
    <button
      onClick={handleSubscribeClick}
      disabled={isActionLoading}
      className={`btn rounded-xl text-sm font-medium transition disabled:opacity-70 
        ${
          isSubscribed
            ? "bg-gray-200 text-gray-800 hover:bg-gray-300" // Style khi đã đăng ký (Hủy đăng ký)
            : "bg-primary-500 text-white hover:bg-primary-600" // Style khi chưa đăng ký
        }
      `}
    >
      {isActionLoading
        ? "Đang xử lý..."
        : isSubscribed
          ? "Huỷ đăng ký"
          : "Đăng ký"}
    </button>
  );
};

export default SubscribeButton;
