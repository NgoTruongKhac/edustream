import { useState } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon } from "lucide-react";
import { updateVideo, type VideoUpdateRequestDto } from "@/api/videoApi";

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

async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload thất bại: ${res.status}`);
}

export interface VideoEditData {
  id: number;
  title: string;
  description: string;
  categories: string[];
  hashtags: string[];
  thumbnail: string;
}

interface Props {
  video: VideoEditData;
  onSuccess?: () => void;
}

export default function ModalEditVideo({ video, onSuccess }: Props) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [hashtags, setHashtags] = useState<string[]>(video.hashtags ?? []);
  const [categories, setCategories] = useState<string[]>(
    video.categories ?? [],
  );
  const [newHashtag, setNewHashtag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề video!");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestDto: VideoUpdateRequestDto = {
        title: title.trim(),
        description: description.trim(),
        hashtags,
        categories,
        ...(thumbnailFile && {
          thumbnailFileName: thumbnailFile.name,
          thumbnailContentType: thumbnailFile.type,
        }),
      };

      setUploadProgress("Đang cập nhật thông tin...");
      const response = await updateVideo(video.id, requestDto);

      if (thumbnailFile && response.thumbnailPresignedUrl) {
        setUploadProgress("Đang upload thumbnail...");
        await uploadToS3(response.thumbnailPresignedUrl, thumbnailFile);
      }

      toast.success("Cập nhật video thành công!");
      onSuccess?.();
      (
        document.getElementById("modal_edit_video") as HTMLDialogElement
      )?.close();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const XIcon = () => (
    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="modal-box w-full max-w-2xl p-0 overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
        <h3 className="font-semibold text-base-content text-base">
          Chỉnh sửa thông tin video
        </h3>
        <form method="dialog">
          <button className="btn btn-ghost btn-sm btn-circle text-base-content">
            ✕
          </button>
        </form>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
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

        {/* Thumbnail */}
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">
              Ảnh thumbnail{" "}
              <span className="text-base-content/40 font-normal">
                (để trống nếu không thay đổi)
              </span>
            </span>
          </label>

          {/* Preview ảnh hiện tại */}
          {!thumbnailFile && video.thumbnail && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-base-300">
              <img
                src={video.thumbnail}
                alt="Thumbnail hiện tại"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                Thumbnail hiện tại
              </span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            id="edit-thumbnail-upload"
            className="hidden"
            onChange={handleThumbnailChange}
          />
          <label
            htmlFor="edit-thumbnail-upload"
            className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:bg-base-200/40 transition"
          >
            <ImageIcon className="w-6 h-6 opacity-70" />
            {thumbnailFile ? (
              <span className="text-sm text-success font-medium">
                {thumbnailFile.name}
              </span>
            ) : (
              <span className="text-sm text-base-content/70">
                Nhấn để chọn ảnh thumbnail mới
              </span>
            )}
          </label>
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
            <div className="flex flex-wrap gap-2 p-3 rounded-xl">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="badge badge-primary gap-1 pr-1 text-xs font-medium"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="w-3.5 h-3.5 rounded-full bg-secondary-content/20 hover:bg-secondary-content/40 flex items-center justify-center transition-colors"
                  >
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hashtags */}
        <div className="form-control gap-1.5 text-base-content">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Hashtag</span>
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-10">
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
                  <XIcon />
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-100">
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
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </div>
  );
}
