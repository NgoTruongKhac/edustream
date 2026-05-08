import { create } from "zustand";
import {
  getNumberUnreadNotifications,
  markAllReadNotifications,
} from "@/api/notificationApi";

interface UnreadNotificationStore {
  count: number;
  fetchCount: () => Promise<void>;
  increment: () => void;
  reset: () => Promise<void>;
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

    reset: async () => {
      try {
        await markAllReadNotifications();
        const data = await getNumberUnreadNotifications();
        set({
          count: data.numberUnreadNotifications ?? 0,
        });
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    },
  }),
);
