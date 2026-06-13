import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Register from "./pages/Register";
import { useAuthStore } from "./stores/useAuthStore";
import MainLayout from "./layouts/MainLayout";
import PlayList from "./pages/PlayList";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import AuthGoogle from "./pages/AuthGoogle";
import EditProfile from "./pages/EditProfile";
import { Toaster } from "react-hot-toast";
import ManageVideos from "./pages/ManageVideos";
import PlaylistVideos from "./pages/PlaylistVideos";
import "./index.css";
import { useThemeStore } from "./stores/useThemeStore";
import { useSocketStore } from "./stores/useSocketStore";
import { useUnreadNotificationStore } from "./stores/useUnReadNotificationStore";
import ManageVideosAmin from "./admin/pages/ManageVideos";
import ManageUsers from "./admin/pages/ManageUsers";
import ManageReports from "./admin/pages/ManageReports";
import AdminRoute from "./admin/components/AdminRoute";

const Home = lazy(() => import("./pages/Home"));
const ResultSearchVideo = lazy(() => import("./pages/ResultSearchVideo"));
const VideoWatch = lazy(() => import("./pages/VideoWatch"));
const Channel = lazy(() => import("./pages/Channel"));
const NotFound = lazy(() => import("./pages/NotFound"));

const MainLayoutAdmin = lazy(() => import("./admin/layout/MainLayoutAdmin"));
const Danshboard = lazy(() => import("./admin/pages/Danshboard"));
const Login = lazy(() => import("./pages/Login"));

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
      fetchCount();

      connect(user.id, (_payload) => {
        increment();
      });
    } else {
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
        <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<ResultSearchVideo />} />
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
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<MainLayoutAdmin />}>
                <Route path="dashboard" element={<Danshboard />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-videos" element={<ManageVideosAmin />} />
                <Route path="manage-reports" element={<ManageReports />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/redirect" element={<AuthGoogle />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
