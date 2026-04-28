import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import RequireAuth from "@/components/RequireAuth";
import { getPlaylists } from "@/api/playlistApi";
import { ListVideo, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaylistResponseDto {
  playlistId: string;
  playlistName: string;
  thumbnail: string;
  videoCount: number;
}

export default function PlayList() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState<PlaylistResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const data = await getPlaylists();
        setPlaylists(data.content ?? []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [user]);

  if (!user) {
    return (
      <RequireAuth
        icon={ListVideo}
        message="Bạn cần đăng nhập để xem playlist của mình."
      />
    );
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-bold text-neutral-900">
            Playlist của tôi
          </h1>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="w-full aspect-video rounded-xl bg-neutral-200" />
                <div className="h-3.5 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
            <ListVideo size={52} className="opacity-20" />
            <p className="text-base font-medium">Bạn chưa có playlist nào.</p>
            <p className="text-sm text-neutral-300">
              Hãy lưu video yêu thích để tạo playlist đầu tiên!
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {playlists.map((pl) => (
              <div
                key={pl.playlistId}
                className="flex flex-col cursor-pointer group"
                onClick={() => navigate(`/playlist/${pl.playlistId}`)}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-100">
                  {pl.thumbnail ? (
                    <img
                      src={pl.thumbnail}
                      alt={pl.playlistName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                      <PlayCircle
                        size={36}
                        className="text-neutral-300 group-hover:text-primary transition-colors"
                      />
                    </div>
                  )}

                  {/* Video count overlay */}
                  <div className="absolute bottom-0 right-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-1.5 py-1.5">
                    <ListVideo size={13} className="text-white" />
                    <span className="text-white text-xs font-medium">
                      {pl.videoCount} video
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {pl.playlistName}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {pl.videoCount} video
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
