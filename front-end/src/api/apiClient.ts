import axios from "axios";
import Cookies from "js-cookie";

const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

const api = axios.create({
  baseURL: `${SERVER_DOMAIN}/api/v1`,
  withCredentials: true,
});

const refreshTokenApi = axios.create({
  baseURL: `${SERVER_DOMAIN}/api/v1`,
  withCredentials: true,
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ===== REFRESH CONTROL =====
let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
};

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      // ===== CASE: đang refresh =====
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest); // ✅ dùng api instance
        });
      }

      // ===== CASE: bắt đầu refresh =====
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshTokenApi.post("/auth/refresh-token");

        const newAccessToken = data.accessToken;

        // ✅ lưu token mới
        Cookies.set("accessToken", newAccessToken);

        // ✅ xử lý queue
        processQueue(null, newAccessToken);

        // ✅ retry request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, undefined);

        Cookies.remove("accessToken");

        // 👉 redirect login nếu cần
        // window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
