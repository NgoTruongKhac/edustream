import api from "./apiClient";

export const blockUser = async (userId: number) => {
  const response = await api.patch(`/violations/block/${userId}`);
  return response.data;
};
