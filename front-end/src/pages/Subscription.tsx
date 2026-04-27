import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import RequireAuth from "@/components/RequireAuth";
import SubscriberCard from "@/components/SubscriberCard";
import { getSubscription } from "@/api/subscriptionApi";
import { MonitorPlay } from "lucide-react";

type UserResponseDto = {
  id: number;
  fullName: string;
  username: string;
  description?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  authProvider?: string;
  providerId?: string;
};

type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
};

export default function Subscription() {
  const user = useAuthStore((state) => state.user);
  const [subscriptions, setSubscriptions] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const data: PageResponse<UserResponseDto> = await getSubscription();
        setSubscriptions(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Lỗi lấy danh sách đăng ký:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user, page]);

  if (!user) {
    return (
      <RequireAuth
        icon={MonitorPlay}
        message="Bạn cần đăng nhập để xem kênh đã đăng ký."
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-base-content mb-6">
        Tất cả kênh đã đăng ký
      </h1>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-5 px-4">
              <div className="w-20 h-20 rounded-full bg-base-300 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-base-300 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-base-300 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-base-300 rounded animate-pulse w-3/4" />
              </div>
              <div className="w-24 h-9 bg-base-300 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/50">
          <MonitorPlay className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Bạn chưa đăng ký kênh nào</p>
          <p className="text-sm mt-1">
            Hãy khám phá và đăng ký các kênh bạn yêu thích!
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-base-200">
            {subscriptions.map((sub) => (
              <SubscriberCard key={sub.id} user={sub} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="btn btn-ghost btn-sm no-animation cursor-default">
                {page + 1} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
