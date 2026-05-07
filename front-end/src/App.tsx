import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import PlayList from "./pages/PlayList";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import AuthGoogle from "./pages/AuthGoogle";
import NotFound from "./pages/NotFound";
import Channel from "./pages/Channel";
import EditProfile from "./pages/EditProfile";
import { Toaster } from "react-hot-toast";
import ManageVideos from "./pages/ManageVideos";
import VideoWatch from "./pages/VideoWatch";
import PlaylistVideos from "./pages/PlaylistVideos";
import "./index.css";
import { useThemeStore } from "./stores/useThemeStore";
import { useSocketStore } from "./stores/useSocketStore";
import { useUnreadNotificationStore } from "./stores/useUnReadNotificationStore";

function App() {
  const { checkAuthStatus, user, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const { connect, disconnect } = useSocketStore();
  const { fetchCount, increment } = useUnreadNotificationStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // 1. Lấy số unread hiện tại từ API
      fetchCount();

      // 2. Kết nối WebSocket và lắng nghe notification mới
      connect(user.id, (_payload) => {
        // Mỗi khi nhận notification mới → tăng badge lên 1
        increment();
        // Nếu muốn toast: toast.success("Bạn có thông báo mới!")
      });
    } else {
      // Logout → ngắt kết nối
      disconnect();
    }

    return () => {
      // Cleanup khi unmount (hiếm gặp với App root)
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Gán thuộc tính data-theme cho thẻ <html>
    document.documentElement.setAttribute("theme", theme);
  }, [theme]);
  return (
    <>
      <div data-theme={theme}>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/playlist" element={<PlayList />} />
            <Route
              path="/playlist/:playlistVideo"
              element={<PlaylistVideos />}
            />
            <Route path="/subscriptions" element={<Subscription />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/:username" element={<Channel />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/manage-videos" element={<ManageVideos />} />
            <Route path="/watch/:videoId" element={<VideoWatch />} />
          </Route>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/redirect" element={<AuthGoogle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
