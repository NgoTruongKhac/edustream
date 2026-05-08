import api from "./apiClient";

export const getNumberUnreadNotifications = async () => {
  const response = await api.get("/notifications/un-read/count");
  return response.data;
};
export const getNotificationsByUser = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markAllReadNotifications = async () => {
  const response = await api.patch("/notifications");
  return response.data;
};
