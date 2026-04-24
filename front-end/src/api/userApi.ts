import api from "./apiClient";

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getUserByUsername = async (username: string) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const updateUser = async (
  fullName: string,
  username: string,
  description: string,
) => {
  const response = await api.patch("/users", {
    fullName,
    username,
    description,
  });
  return response.data;
};
export const uploadCoverImage = async (file: File) => {
  const formData = new FormData();
  formData.append("coverImage", file);

  const response = await api.post("/users/upload-cover-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/users/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
