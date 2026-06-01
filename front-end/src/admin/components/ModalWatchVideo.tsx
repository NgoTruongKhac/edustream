import { useState } from "react";
import { X } from "lucide-react";
import { acceptVideo, rejectVideo } from "@/api/videoApi"; // Đường dẫn file chứa API video của bạn
import toast from "react-hot-toast";

// Định nghĩa cấu trúc danh sách vi phạm dựa trên mã bạn cung cấp
const VIOLATION_TYPES = [
  { enum: "ADULT_CONTENT", label: "Nội dung khiêu dâm" },
  {
    enum: "VIOLENT_OR_GRAPHIC_CONTENT",
    label: "Nội dung bạo lực hoặc phản cảm",
  },
  {
    enum: "HATEFUL_OR_ABUSIVE_CONTENT",
    label: "Nội dung lăng mạ hoặc kích động thù hận",
  },
  {
    enum: "HARMFUL_OR_DANGEROUS_ACTS",
    label: "Hành động gây hại hoặc nguy hiểm",
  },
  {
    enum: "SELF_HARM_OR_SUICIDE",
    label: "Hành vi tự tử, tự hủy hoại bản thân",
  },
  { enum: "MISINFORMATION", label: "Thông tin sai lệch" },
  { enum: "COPYRIGHT_INFRINGEMENT", label: "Vi phạm bản quyền" },
];

interface VideoResponseDto {
  id: string;
  title: string;
  thumbnail?: string;
  videoType: "YOUTUBE" | "UPLOAD";
  userId: number;
  videoUrl?: string;
  videoYoutubeId?: string;
  videoYoutubeUrl?: string;
}

interface Props {
  video: VideoResponseDto;
  onClose: () => void;
  onSuccess?: () => void; // Callback để làm mới danh sách sau khi duyệt thành công
}

export default function ModalWatchVideo({ video, onClose, onSuccess }: Props) {
  const [action, setAction] = useState<"ACCEPT" | "REJECT" | null>(null);
  const [violationType, setViolationType] = useState<string>(""); // Chuyển thành chuỗi string rỗng
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const embedUrl = video.videoYoutubeId
    ? `https://www.youtube.com/embed/${video.videoYoutubeId}?autoplay=1`
    : video.videoYoutubeUrl?.replace("watch?v=", "embed/") + "?autoplay=1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;

    setLoading(true);
    setError(null);
    const videoIdNum = Number(video.id);

    try {
      if (action === "ACCEPT") {
        await acceptVideo(videoIdNum);
        toast.success("Đã chấp nhận video thành công!");
      } else {
        if (!violationType) {
          setError("Vui lòng chọn loại vi phạm!");
          setLoading(false);
          return;
        }
        if (!reason.trim()) {
          setError("Vui lòng nhập lý do từ chối chi tiết!");
          setLoading(false);
          return;
        }

        // Gọi API rejectVideo truyền payload theo đúng định dạng ViolationRequestDto (violationType dạng string)
        await rejectVideo(videoIdNum, {
          videoId: videoIdNum,
          violationType: violationType, // Chuỗi string (ví dụ: "ADULT_CONTENT")
          reason: reason.trim(),
        });
        toast.success("Đã từ chối video thành công!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-xl w-full p-0 overflow-y-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200 sticky top-0 z-10">
          <h3 className="font-semibold text-base-content truncate max-w-[calc(100%-2rem)]">
            Kiểm duyệt: {video.title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-y-auto">
          {/* Trình phát Video */}
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

          {/* Form Hành Động */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="form-control">
              <label className="label font-medium text-base-content">
                Quyết định kiểm duyệt:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 hover:bg-base-200 transition">
                  <input
                    type="radio"
                    name="action"
                    className="radio radio-success"
                    checked={action === "ACCEPT"}
                    onChange={() => {
                      setAction("ACCEPT");
                      setError(null);
                    }}
                    disabled={loading}
                  />
                  <span className="text-success font-semibold">
                    Chấp nhận video
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 hover:bg-base-200 transition">
                  <input
                    type="radio"
                    name="action"
                    className="radio radio-error"
                    checked={action === "REJECT"}
                    onChange={() => {
                      setAction("REJECT");
                      setError(null);
                    }}
                    disabled={loading}
                  />
                  <span className="text-error font-semibold">
                    Từ chối video
                  </span>
                </label>
              </div>
            </div>

            {/* Vùng hiển thị bổ sung nếu bấm chọn "Từ chối" */}
            {action === "REJECT" && (
              <div className="p-4 bg-base-200 border border-base-300 rounded-xl space-y-4 animate-fadeIn">
                <div className="form-control">
                  <label className="label font-medium text-sm">
                    Chọn loại vi phạm:
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 bg-base-100 border border-base-300 rounded-lg">
                    {VIOLATION_TYPES.map((item) => (
                      <label
                        key={item.enum}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-base-200 rounded cursor-pointer text-sm"
                      >
                        <input
                          type="radio"
                          name="violationType"
                          className="radio radio-xs radio-primary"
                          value={item.enum} // Giá trị enum chuỗi string (VD: "ADULT_CONTENT")
                          checked={violationType === item.enum}
                          onChange={(e) => setViolationType(e.target.value)}
                          disabled={loading}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-medium text-sm">
                    Lý do từ chối chi tiết:
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-20 text-sm"
                    placeholder="Nhập lý do cụ thể gửi tới người đăng video..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="text-error text-sm font-medium bg-error/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Thanh điều hướng nút xử lý cuối form */}
            <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={`btn ${action === "REJECT" ? "btn-error" : "btn-primary"}`}
                disabled={!action || loading}
              >
                {loading && <span className="loading loading-spinner"></span>}
                Xác nhận gửi
              </button>
            </div>
          </form>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={loading ? undefined : onClose}
      />
    </dialog>
  );
}
