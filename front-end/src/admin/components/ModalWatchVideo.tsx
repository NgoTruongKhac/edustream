import { X } from "lucide-react";

interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail?: string;
  videoType: "YOUTUBE" | "UPLOAD";
  videoUrl?: string;
  videoYoutubeId?: string;
  videoYoutubeUrl?: string;
}

interface Props {
  video: VideoResponseDto;
  onClose: () => void;
}

export default function ModalWatchVideo({ video, onClose }: Props) {
  const embedUrl = video.videoYoutubeId
    ? `https://www.youtube.com/embed/${video.videoYoutubeId}?autoplay=1`
    : video.videoYoutubeUrl?.replace("watch?v=", "embed/") + "?autoplay=1";

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-xl w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
          <h3 className="font-semibold text-base-content truncate max-w-[calc(100%-2rem)]">
            {video.title}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video w-full bg-black">
          {video.videoType === "YOUTUBE" ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              poster={video.thumbnail || undefined}
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
