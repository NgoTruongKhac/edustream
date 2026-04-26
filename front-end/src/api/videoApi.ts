import api from "./apiClient";

export interface VideoYoutubeRequestDto {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  videoYoutubeUrl: string;
  videoYoutubeId: string;
  hashtags: string[];
  categories: string[];
}

export const createVideoYoutube = async (data: VideoYoutubeRequestDto) => {
  const response = await api.post("/videos/youtube", data);
  return response.data;
};

export const getVideosByCurrentUser = async (page: number = 0) => {
  const response = await api.get("/videos", { params: { page } });
  return response.data;
};

export const getVideosByUsername = async (
  username: string,
  page: number = 0,
) => {
  const response = await api.get(`/videos/${username}`, { params: { page } });
  return response.data;
};

export const getVideoById = async (videoId: number) => {
  const repsponse = await api.get(`/videos/watch/${videoId}`);
  return repsponse.data;
};
