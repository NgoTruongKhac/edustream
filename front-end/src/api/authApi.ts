import api from "./apiClient";
import Cookies from "js-cookie";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (
  fullName: string,
  email: string,
  password: string,
) => {
  const response = await api.post("/auth/register", {
    fullName,
    email,
    password,
  });
  return response.data;
};

export const verifyOtp = async (otp: string) => {
  const response = await api.post("/auth/verify-register", { otp });
  return response.data;
};

export const logout = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

export const loginWithGoogle = () => {
  window.location.href = `${
    import.meta.env.VITE_SERVER_DOMAIN
  }/login/oauth2/google`;
};
