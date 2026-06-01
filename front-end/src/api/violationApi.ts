import api from "./apiClient";

export interface ViolationRequestDto {
  userId?: number;
  videoId: number;
  violationType: string;
  reason: string;
}

export const createViolation = async (data: ViolationRequestDto) => {
  const response = await api.post("/violations", data);
  return response.data;
};

export const blockUser = async (userId: number) => {
  const response = await api.patch(`/violations/block/${userId}`);
  return response.data;
};
