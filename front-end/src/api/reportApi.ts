import api from "./apiClient";

export interface ReportRequestDto {
  userId?: number;
  videoId: number;
  violationType: string;
  reportStatus: string;
  description: string;
}

export const getReports = async (page: number = 0) => {
  const response = await api.get("/reports", { params: { page: page } });
  return response.data;
};

export const createReport = async (reportData: ReportRequestDto) => {
  const response = await api.post("/reports", reportData);
  return response.data;
};
