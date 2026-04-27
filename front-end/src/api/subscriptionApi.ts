import api from "./apiClient";

export const subscribe = async (username: string) => {
  const response = await api.post("/subscribe", { username });

  return response.data;
};

export const unsubscribe = async (username: string) => {
  const response = await api.delete("/subscribe", {
    data: { username },
  });
  return response.data;
};

export const checkSubscription = async (username: string) => {
  const response = await api.get(`/subscribe/check/${username}`);
  return response.data.isSubscribed; // Trả về thẳng boolean (true/false)
};

export const getSubscription = async () => {
  const response = await api.get("/subscribe");
  return response.data;
};
