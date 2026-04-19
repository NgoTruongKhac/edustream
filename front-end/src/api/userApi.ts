import api from "./apiClient";

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getUserByUsername = async (username: string) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};
