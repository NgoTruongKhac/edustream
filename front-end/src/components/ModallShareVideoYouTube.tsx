import {
  createVideoYoutube,
  type VideoYoutubeRequestDto,
} from "@/api/videoApi";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

// ─── Utils ───────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseDuration(iso: string): number {
  // Converts ISO 8601 duration (e.g. "PT3H39M18S") to total seconds
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  return h * 3600 + m * 60 + s;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function extractHashtags(description: string): string[] {
  const matches = description.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g) ?? [];
  return [...new Set(matches)];
}

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

const API_KEY = import.meta.env.VITE_API_KEY as string;

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoInfo {
  title: string;
  description: string;
  durationSeconds: number;
  hashtags: string[];
  thumbnailUrl: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ModalShareVideoYouTube() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVideo = async (inputUrl: string) => {
    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
      setError("Link YouTube không hợp lệ.");
      setVideo(null);
      return;
    }
    setLoading(true);
    setError("");
    setVideo(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`,
      );
      const data = await res.json();
      if (!data.items?.length) {
        setError("Không tìm thấy video.");
        setLoading(false);
        return;
      }
      const item = data.items[0];
      const desc: string = item.snippet.description ?? "";
      const tags = extractHashtags(desc);
      const durationSec = parseDuration(item.contentDetails.duration ?? "");
      setVideo({
        title: item.snippet.title ?? "",
        description: desc,
        durationSeconds: durationSec,
        hashtags: tags,
        thumbnailUrl:
          item.snippet.thumbnails?.maxres?.url ??
          item.snippet.thumbnails?.high?.url ??
          item.snippet.thumbnails?.medium?.url ??
          "",
      });
      setHashtags(tags);
    } catch {
      setError("Lỗi khi tải thông tin video.");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setVideo(null);
      setError("");
      setHashtags([]);
      setCategories([]);
      setNewHashtag("");
      return;
    }
    debounceRef.current = setTimeout(() => fetchVideo(val.trim()), 700);
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

  // Hàm xử lý khi bấm nút "Chia sẻ"
  const handleSubmit = async () => {
    if (!video) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Không thể xác định Video ID.");
      return;
    }

    // 1. Chuẩn bị payload chuẩn với DTO
    const payload: VideoYoutubeRequestDto = {
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnailUrl,
      duration: video.durationSeconds,
      videoYoutubeUrl: url,
      videoYoutubeId: videoId,
      hashtags: hashtags.map((t) => t.replace(/^#/, "")),
      categories: categories,
    };

    setIsSubmitting(true);
    setError("");

    try {
      // 2. Gọi API
      await createVideoYoutube(payload);

      // 3. Xử lý thành công
      toast.success("Chia sẻ video thành công!");

      // Reset form
      setUrl("");
      setVideo(null);
      setHashtags([]);
      setCategories([]);

      // (Tuỳ chọn): Nếu bạn dùng Modal của daisyUI, bạn có thể đóng modal bằng code:
      const modal = document.getElementById(
        "modal_share_video_youtube",
      ) as HTMLDialogElement;
      if (modal) modal.close();
    } catch (err) {
      console.error(err);
      setError("Lưu video thất bại. Vui lòng kiểm tra lại hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-box w-full max-w-2xl p-0 overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-10 h-10 fill-red-600 hover:fill-red-700 transition duration-200 cursor-pointer"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-base-content text-base">
            Chia sẻ video YouTube
          </h3>
        </div>
        <form method="dialog">
          <button className="btn btn-ghost btn-sm btn-circle">✕</button>
        </form>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* URL Input */}
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium text-sm">Link YouTube</span>
          </label>
          <label
            className={`input input-bordered flex items-center gap-2 w-full ${error ? "input-error" : ""}`}
          >
            <svg
              className="w-4 h-4 opacity-50 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <input
              type="text"
              className="grow text-sm"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
            />
            {loading && (
              <span className="loading loading-spinner loading-xs opacity-50" />
            )}
          </label>
          {error && <p className="text-error text-xs mt-0.5">{error}</p>}
        </div>

        {/* Video Info */}
        {video && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Thumbnail */}
            {video.thumbnailUrl && (
              <div className="w-90 rounded-xl overflow-hidden border border-base-300 aspect-video bg-base-200">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="form-control gap-1.5">
              <label className="label py-0">
                <span className="label-text font-medium text-sm">Tiêu đề</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full text-sm"
                value={video.title}
                readOnly
              />
            </div>

            {/* Duration */}
            <div className="form-control gap-1.5">
              <label className="label py-0">
                <span className="label-text font-medium text-sm">
                  Thời lượng
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <svg
                  className="w-4 h-4 opacity-50 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <input
                  type="text"
                  className="grow text-sm"
                  value={`${formatDuration(video.durationSeconds)}  (${video.durationSeconds} giây)`}
                  readOnly
                />
              </label>
            </div>

            {/* Description */}
            <div className="form-control gap-1.5">
              <label className="label py-0">
                <span className="label-text font-medium text-sm">Mô tả</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full text-sm resize-none"
                rows={4}
                value={video.description}
                readOnly
              />
            </div>

            {/* Hashtags */}
            <div className="form-control gap-1.5">
              <label className="label py-0">
                <span className="label-text font-medium text-sm">Hashtag</span>
                <span className="label-text-alt text-xs opacity-50">
                  {hashtags.length} tags
                </span>
              </label>
              {hashtags.length > 0 ? (
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
                        aria-label={`Xoá ${tag}`}
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
              ) : (
                <p className="text-xs text-base-content/40 italic px-1">
                  Không có hashtag trong mô tả.
                </p>
              )}
              {/* Add custom hashtag */}
              <div className="flex gap-2">
                <label className="input input-bordered input-sm flex items-center gap-1.5 grow">
                  <span className="text-base-content/40 font-bold text-sm">
                    #
                  </span>
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
                  className="btn btn-sm btn-outline bg-primary-500 text-white"
                  onClick={addHashtag}
                  disabled={!newHashtag.trim()}
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="form-control gap-1.5">
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
                  <option
                    key={cat}
                    value={cat}
                    disabled={categories.includes(cat)}
                  >
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
                        aria-label={`Xoá ${cat}`}
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
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-100">
        <form method="dialog">
          <button className="btn btn-ghost btn-sm">Huỷ</button>
        </form>
        <button
          className="btn bg-primary-500 text-white btn-sm"
          disabled={!video || loading || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            "Chia sẻ"
          )}
        </button>
      </div>
    </div>
  );
}
