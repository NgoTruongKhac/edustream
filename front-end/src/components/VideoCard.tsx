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
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-base-300">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Sử dụng neutral để badge luôn nổi bật trên mọi loại ảnh thumbnail */}
        <div className="absolute bottom-2 right-2 bg-neutral/90 text-neutral-content text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3 pr-2">
        {/* Avatar - Sử dụng class avatar của daisyUI để đồng bộ */}
        <div className="flex-shrink-0 mt-1">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={avatar} alt={channel} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-base-content line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="mt-1">
            <p className="text-sm text-base-content/70 hover:text-base-content transition-colors">
              {channel}
            </p>
            <p className="text-sm text-base-content/60">
              {views} • {formatDate(createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
