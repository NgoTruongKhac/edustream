import { Link } from "react-router-dom";

interface VideoCardProps {
  videoId: number;
  thumbnail: string;
  duration: number;
  avatar: string;
  title: string;
  channel: string;
  views: string;
  createdAt: string;
}

// --- Helpers ---
const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VideoCard({
  videoId,
  thumbnail,
  duration,
  avatar,
  title,
  channel,
  views,
  createdAt,
}: VideoCardProps) {
  return (
    <Link to={`/watch/${videoId}`} className="flex flex-col gap-3 group">
      {/* Thumbnail & Duration */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-200">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-md">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3 pr-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <img
              src={avatar}
              alt={channel}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 hover:text-neutral-700">
            {channel}
          </p>
          <p className="text-sm text-neutral-500">
            {views} • {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
