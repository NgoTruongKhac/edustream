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

function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  return (
    <>
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
          <Route path="/subscriptions" element={<Subscription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/:username" element={<Channel />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<AuthGoogle />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
