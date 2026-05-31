import api from "./apiClient";

export const getReports = async (page: number = 0) => {
  const repsponse = await api.get("/reports", { params: { page: page } });
  return repsponse.data;
};
