import { create } from "zustand";
import { getCurrentUser } from "@/api/userApi";
import { login as loginApi } from "@/api/authApi";
import Cookies from "js-cookie";

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  fetchCurrentUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  fetchCurrentUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      set({
        user: currentUser,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
  login: async (email, password) => {
    try {
      const { accessToken, refreshToken } = await loginApi(email, password);

      Cookies.set("access_token", accessToken);
      Cookies.set("refresh_token", refreshToken);

      await get().fetchCurrentUser();
    } catch (error) {
      console.log(error);
    }
  },
  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({
      user: null,
      isAuthenticated: false,
    });
  },
  isLoading: true,
  checkAuthStatus: async () => {
    try {
      const accessToken = Cookies.get("access_token");
      if (accessToken) {
        // Lấy hàm fetchCurrentUser từ trong store
        await get().fetchCurrentUser();
      }
    } catch (error) {
      // Bỏ qua lỗi vì fetchCurrentUser đã xử lý set state
      console.error("Auth check failed:", error);
    } finally {
      // Luôn dừng loading sau khi kiểm tra xong
      set({ isLoading: false });
    }
  },
}));
