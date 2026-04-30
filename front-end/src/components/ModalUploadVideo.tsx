import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import {
  createVideoUpload,
  confirmVideoUpload,
  type VideoUploadRequestDto,
} from "@/api/videoApi";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Toán học",
  "Văn học",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "Lập trình",
  "Khoa học máy tính",
];

// ─── Utils ───────────────────────────────────────────────────────────────────

/** Chụp thumbnail từ file video tại giây thứ 1, trả về File */
function captureVideoThumbnail(videoFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const videoEl = document.createElement("video");
    videoEl.muted = true;
    videoEl.preload = "metadata";

    const objectUrl = URL.createObjectURL(videoFile);
    videoEl.src = objectUrl;

    videoEl.addEventListener("loadeddata", () => {
      videoEl.currentTime = 1; // tua đến giây thứ 1
    });

    videoEl.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Không thể tạo canvas context"));
        return;
      }
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Không thể tạo thumbnail blob"));
            return;
          }
          // Đặt tên file thumbnail dựa trên tên video gốc
          const thumbName =
            videoFile.name.replace(/\.[^.]+$/, "") + "_thumb.jpg";
          resolve(new File([blob], thumbName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    });

    videoEl.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể load video để chụp thumbnail"));
    });
  });
}

/** Upload file lên S3 bằng presigned URL (PUT, không kèm auth header) */
async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload thất bại: ${res.status}`);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ModalUploadVideo() {
  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
    // Reset thumbnail nếu chọn video mới
    if (file) setThumbnailFile(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailFile(e.target.files?.[0] ?? null);
  };

  const removeHashtag = (tag: string) =>
    setHashtags((prev) => prev.filter((t) => t !== tag));

  const addHashtag = () => {
    const raw = newHashtag.trim().replace(/^#+/, "");
    if (!raw) return;
    const tag = `#${raw}`;
    if (!hashtags.includes(tag)) setHashtags((prev) => [...prev, tag]);
    setNewHashtag("");
  };

  const toggleCategory = (cat: string) =>
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const removeCategory = (cat: string) =>
    setCategories((prev) => prev.filter((c) => c !== cat));

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!videoFile) return;
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề video!");
      return;
    }

    setIsSubmitting(true);
    try {
      // ── Bước 1: Chuẩn bị thumbnail ────────────────────────────────────────
      // Nếu người dùng không chọn ảnh → tự chụp từ video
      setUploadProgress("Đang chuẩn bị thumbnail...");
      let finalThumbnailFile: File;
      if (thumbnailFile) {
        finalThumbnailFile = thumbnailFile;
      } else {
        finalThumbnailFile = await captureVideoThumbnail(videoFile);
      }

      // ── Bước 2: Gọi API tạo video & lấy presigned URLs ──────────────────
      setUploadProgress("Đang khởi tạo upload...");
      const requestDto: VideoUploadRequestDto = {
        title: title.trim(),
        description: description.trim(),
        fileName: videoFile.name,
        contentType: videoFile.type,
        thumbnailFileName: finalThumbnailFile.name,
        thumbnailContentType: finalThumbnailFile.type,
        hashtags,
        categories,
      };

      const uploadResponse = await createVideoUpload(requestDto);
      const { videoInfo, presignedUrl, thumbnailPresignedUrl } = uploadResponse;

      // ── Bước 3: Upload video lên S3 qua presigned URL ────────────────────
      setUploadProgress("Đang upload video...");
      await uploadToS3(presignedUrl, videoFile);

      // ── Bước 4: Upload thumbnail lên S3 qua presigned URL ───────────────
      if (thumbnailPresignedUrl) {
        setUploadProgress("Đang upload thumbnail...");
        await uploadToS3(thumbnailPresignedUrl, finalThumbnailFile);
      }

      // ── Bước 5: Xác nhận upload → đổi status sang PUBLISHED ─────────────
      setUploadProgress("Đang xác nhận...");
      await confirmVideoUpload(videoInfo.id);

      toast.success("Video đã được chia sẻ thành công!");

      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setTitle("");
      setDescription("");
      setHashtags([]);
      setCategories([]);

      // Đóng modal
      (
        document.getElementById("upload-video-modal") as HTMLDialogElement
      )?.close();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="modal-box w-full max-w-2xl p-0 overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
        <h3 className="font-semibold text-base-content text-base">
          Tải lên video của bạn
        </h3>
        <form method="dialog">
          <button className="btn btn-ghost btn-sm btn-circle text-base-content">
            ✕
          </button>
        </form>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* Video Upload */}
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">
              Tải lên video
            </span>
          </label>
          <input
            type="file"
            accept="video/*"
            id="video-upload"
            className="hidden"
            onChange={handleVideoChange}
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:bg-base-200/40 transition"
          >
            <UploadCloud className="w-6 h-6 opacity-70" />
            {videoFile ? (
              <span className="text-sm text-success font-medium">
                {videoFile.name}
              </span>
            ) : (
              <>
                <span className="text-sm text-base-content/70">
                  Nhấn để chọn video hoặc kéo thả vào đây
                </span>
                <span className="text-xs text-base-content/40">
                  MP4, WebM...
                </span>
              </>
            )}
          </label>
        </div>

        {/* Thumbnail Upload */}
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">
              Tải lên ảnh thumbnail{" "}
              <span className="text-base-content/40 font-normal">
                (tuỳ chọn — tự động chụp nếu bỏ qua)
              </span>
            </span>
          </label>
          <input
            type="file"
            accept="image/*"
            id="thumbnail-upload"
            className="hidden"
            onChange={handleThumbnailChange}
          />
          <label
            htmlFor="thumbnail-upload"
            className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:bg-base-200/40 transition"
          >
            <ImageIcon className="w-6 h-6 opacity-70" />
            {thumbnailFile ? (
              <span className="text-sm text-success font-medium">
                {thumbnailFile.name}
              </span>
            ) : (
              <span className="text-sm text-base-content/70">
                Chọn ảnh thumbnail
              </span>
            )}
          </label>
        </div>

        {/* Title */}
        <div className="form-control gap-1.5 text-base-content">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Tiêu đề</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full text-sm"
            placeholder="Nhập tiêu đề video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-control gap-1.5 text-base-content">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Mô tả</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full text-sm resize-none"
            rows={4}
            placeholder="Nhập mô tả video..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Hashtags */}
        <div className="form-control gap-1.5 text-base-content">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Hashtag</span>
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-base-300 rounded-xl min-h-10 bg-base-200/40">
            {hashtags.map((tag) => (
              <div
                key={tag}
                className="badge badge-primary gap-1 pr-1 text-xs font-medium"
              >
                {tag}
                <button
                  onClick={() => removeHashtag(tag)}
                  className="w-3.5 h-3.5 rounded-full bg-primary-content/20 hover:bg-primary-content/40 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-2 h-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="input input-bordered input-sm flex items-center gap-1.5 grow">
              <span className="text-base-content/40 font-bold text-sm">#</span>
              <input
                type="text"
                className="grow text-sm"
                placeholder="Thêm hashtag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHashtag()}
              />
            </label>
            <button
              className="btn btn-sm btn-outline bg-primary text-primary-content"
              onClick={addHashtag}
              disabled={!newHashtag.trim()}
            >
              Thêm
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="form-control gap-1.5 text-base-content">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Danh mục</span>
            <span className="label-text-alt text-xs opacity-50">
              {categories.length} đã chọn
            </span>
          </label>
          <select
            className="select select-bordered w-full text-sm"
            onChange={(e) => {
              if (e.target.value) toggleCategory(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Chọn danh mục...
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} disabled={categories.includes(cat)}>
                {cat} {categories.includes(cat) ? "✓" : ""}
              </option>
            ))}
          </select>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border border-base-300 rounded-xl bg-base-200/40">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="badge badge-secondary gap-1 pr-1 text-xs font-medium"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="w-3.5 h-3.5 rounded-full bg-secondary-content/20 hover:bg-secondary-content/40 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-2 h-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-100">
        {/* Progress text */}
        {uploadProgress && (
          <span className="text-xs text-base-content/50 mr-auto">
            {uploadProgress}
          </span>
        )}
        <form method="dialog">
          <button
            className="btn btn-ghost btn-sm text-base-content"
            disabled={isSubmitting}
          >
            Huỷ
          </button>
        </form>
        <button
          className="btn bg-primary text-primary-content btn-sm"
          disabled={!videoFile || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Chia sẻ"
          )}
        </button>
      </div>
    </div>
  );
}
