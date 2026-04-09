import axios from "axios";
import Cookies from "js-cookie";

const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
// Tạo một instance axios chính cho các API thông thường
const api = axios.create({
  baseURL: `${SERVER_DOMAIN}/api/v1`,
  withCredentials: true, // Rất quan trọng để gửi cookie (bao gồm cả httpOnly refreshToken)
});

const refreshTokenApi = axios.create({
  baseURL: `${SERVER_DOMAIN}/api/v1`,
  withCredentials: true,
});

// 1. Request Interceptor: Gắn access token vào mỗi yêu cầu
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("access_token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Biến để theo dõi trạng thái làm mới token

let isRefreshing = false;

// Hàng đợi các request bị lỗi 401 trong khi đang làm mới token
interface FailedPromise {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedPromise[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor: Xử lý khi access token hết hạn

api.interceptors.response.use(
  (response) => {
    // Nếu request thành công, trả về response

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 401 và request này chưa được thử lại
    const isLoginOrRefreshRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginOrRefreshRequest
    ) {
      if (isRefreshing) {
        // Nếu đang trong quá trình làm mới token, thêm request vào hàng đợi

        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })

          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;

            return axios(originalRequest);
          })

          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true; // Đánh dấu là đã thử lại

      isRefreshing = true;

      try {
        // Gọi API để làm mới token

        const { data } = await refreshTokenApi.post("/auth/refresh-token");

        const newAccessToken = data.accessToken;

        console.log(`new access token: ${newAccessToken}`); // Lưu access token mới vào cookie

        Cookies.set("access_token", newAccessToken); // Cập nhật header cho các request sau này

        api.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;

        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken; // Thực thi lại các request trong hàng đợi với token mới

        processQueue(null, newAccessToken); // Gửi lại request ban đầu đã thất bại

        return api(originalRequest);
      } catch (refreshError) {
        // Nếu làm mới token thất bại (ví dụ: refresh token cũng hết hạn)

        processQueue(refreshError, null); // Xóa token và chuyển hướng người dùng về trang đăng nhập

        Cookies.remove("access_token");

        console.error("Session expired. Please login again."); // Ví dụ: window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } // Nếu không phải lỗi 401, trả về lỗi

    return Promise.reject(error);
  },
);

export default api;
