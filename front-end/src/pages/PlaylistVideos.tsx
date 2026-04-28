import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlaylistVideos } from "@/api/playlistApi";
import { ListVideo, Clock, Eye, ArrowLeft } from "lucide-react";

interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  fullName: string;
  username: string;
  avatar: string;
  createdAt: string;
  viewCount?: number;
}

interface PlayListVideoResponseDto {
  playlistId: string;
  playlistName: string;
  videoResponseDto: VideoResponseDto;
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function PlaylistVideos() {
  const { playlistVideo: playlistId } = useParams();

  const [items, setItems] = useState<PlayListVideoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const playlistName = items[0]?.playlistName ?? "Playlist";

  useEffect(() => {
    if (!playlistId) {
      setError(true);
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getPlaylistVideos(Number(playlistId));
        setItems(data.content ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [playlistId]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex-1 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-6 bg-neutral-200 rounded w-48 mb-6 animate-pulse" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-40 sm:w-48 aspect-video rounded-xl bg-neutral-200 shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-3 text-neutral-400">
        <ListVideo size={48} className="opacity-20" />
        <p className="text-base font-medium">Không tìm thấy playlist này.</p>
      </div>
    );
  }
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-2 py-2 hover:bg-neutral-100 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
            {playlistName}
          </h1>
          <span className="text-sm text-neutral-400 shrink-0">
            ({items.length} video)
          </span>
        </div>

        {/* Empty */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
            <ListVideo size={52} className="opacity-20" />
            <p className="text-base font-medium">Playlist này chưa có video.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => {
              const v = item.videoResponseDto;
              return (
                <Link
                  key={`${item.playlistId}-${v.id}-${index}`}
                  to={`/watch/${v.id}`}
                  className="flex gap-3 sm:gap-4 group p-2 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  {/* Index */}
                  <div className="hidden sm:flex items-center justify-center w-6 shrink-0 text-sm text-neutral-300 font-medium group-hover:text-primary transition-colors">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye size={20} className="text-neutral-300" />
                      </div>
                    )}
                    {/* Duration */}
                    {v.duration > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock size={9} />
                        {formatDuration(v.duration)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {v.title}
                    </h3>

                    <Link
                      to={`/@${v.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 mt-0.5 group/ch w-fit"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                        <img
                          src={
                            v.avatar ||
                            `https://ui-avatars.com/api/?name=${v.fullName}&background=random`
                          }
                          alt={v.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-neutral-500 group-hover/ch:text-primary transition-colors truncate">
                        {v.fullName}
                      </span>
                    </Link>

                    <p className="text-xs text-neutral-400">
                      {formatDate(v.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
