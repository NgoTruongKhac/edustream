import { create } from "zustand";
import { getNumberUnreadNotifications } from "@/api/notificationApi";

interface UnreadNotificationStore {
  count: number;
  fetchCount: () => Promise<void>;
  increment: () => void;
  reset: () => void;
}

export const useUnreadNotificationStore = create<UnreadNotificationStore>(
  (set) => ({
    count: 0,

    fetchCount: async () => {
      try {
        const data = await getNumberUnreadNotifications();
        // API trả về { numberUnreadNotifications: number }
        set({ count: data.numberUnreadNotifications ?? 0 });
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    },

    // Gọi khi nhận được notification mới qua WebSocket
    increment: () => set((state) => ({ count: state.count + 1 })),

    // Gọi khi user bấm "đánh dấu đã đọc tất cả"
    reset: () => set({ count: 0 }),
  }),
);
