import { Client, type StompSubscription } from "@stomp/stompjs";
import { create } from "zustand";

interface SocketStore {
  client: Client | null;
  isConnected: boolean;
  subscription: StompSubscription | null;
  connect: (userId: number, onNotification: (payload: unknown) => void) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,
  isConnected: false,
  subscription: null,

  connect: (userId, onNotification) => {
    // Tránh tạo nhiều kết nối khi gọi lại
    const existing = get().client;
    if (existing?.active) return;

    const client = new Client({
      // Dùng native WebSocket — không cần SockJS
      brokerURL: `ws://localhost:8080/ws?userId=${userId}`,

      reconnectDelay: 5000,

      onConnect: () => {
        console.log("🟢 WebSocket Connected!");
        set({ isConnected: true });

        const subscription = client.subscribe(
          `/topic/notification/${userId}`,
          (message) => {
            try {
              const payload = JSON.parse(message.body);
              onNotification(payload);
              console.log(payload);
            } catch {
              console.error("Failed to parse notification payload");
            }
          },
        );

        set({ subscription });
      },

      onDisconnect: () => {
        set({ isConnected: false, subscription: null });
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client, subscription } = get();
    subscription?.unsubscribe();
    client?.deactivate();
    set({ client: null, isConnected: false, subscription: null });
  },
}));
