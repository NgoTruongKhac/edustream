import api from "./apiClient";
export const createPlaylist = async (playlistName: string) => {
  const response = await api.post("/playlists", { playlistName });
  return response.data;
};
export const createPlaylistVideo = async (
  playlistId: number,
  videoId: number,
) => {
  const response = await api.post("/playlists/videos", { playlistId, videoId });
  return response.data;
};
export const getPlaylists = async (videoId?: number) => {
  const response = await api.get("/playlists", {
    params: { videoId },
  });
  return response.data;
};
export const getPlaylistVideos = async (playlistId: number) => {
  const response = await api.get(`/playlists/${playlistId}`);
  return response.data;
};
export const changePlaylistName = async () => {};
