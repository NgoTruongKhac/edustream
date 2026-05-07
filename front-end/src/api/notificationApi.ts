import api from "./apiClient";

export const getNumberUnreadNotifications = async () => {
  const response = await api.get("/notifications/un-read/count");
  return response.data;
};
