import { useEffect, useRef, useState } from "react";
import {
  createPlaylist,
  createPlaylistVideo,
  getPlaylists,
} from "@/api/playlistApi";
import { ListVideo, Plus, Check, X, Loader2, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface PlaylistResponseDto {
  playlistId: string;
  playlistName: string;
  thumbnail: string;
  videoCount: number;
  inPlaylist: boolean;
}

export default function ModalPlaylist() {
  const { videoId } = useParams();

  const [playlists, setPlaylists] = useState<PlaylistResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        // Gửi kèm videoId để Backend kiểm tra
        const data = await getPlaylists(Number(videoId));
        const list = data.content ?? [];
        setPlaylists(list);

        // QUAN TRỌNG: Cập nhật state 'added' từ dữ liệu Backend trả về
        const alreadyAdded = new Set<string>(
          list
            .filter((pl: PlaylistResponseDto) => pl.inPlaylist)
            .map((pl: PlaylistResponseDto) => pl.playlistId),
        );
        setAdded(alreadyAdded);
      } catch {
        toast.error("Không thể tải danh sách playlist.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [videoId]);

  useEffect(() => {
    if (showNewInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showNewInput]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!videoId || added.has(playlistId)) return;
    setAddingTo(playlistId);
    try {
      await createPlaylistVideo(Number(playlistId), Number(videoId));
      setAdded((prev) => new Set(prev).add(playlistId));
      toast.success("Đã thêm vào playlist!");
    } catch {
      toast.error("Thêm vào playlist thất bại.");
    } finally {
      setAddingTo(null);
    }
  };

  const handleCreatePlaylist = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const created = await createPlaylist(trimmed);
      setPlaylists((prev) => [created, ...prev]);
      setNewName("");
      setShowNewInput(false);
      toast.success("Đã tạo playlist mới!");
    } catch {
      toast.error("Tạo playlist thất bại.");
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    (document.getElementById("modal_playlist") as HTMLDialogElement)?.close();
    setShowNewInput(false);
    setNewName("");
  };

  return (
    <div className="modal-box w-full max-w-sm rounded-2xl p-0 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-base">
        <div className="flex items-center gap-2">
          <ListVideo size={18} className="text-primary" />
          <h3 className="font-semibold text-base-content text-base">
            Lưu vào playlist
          </h3>
        </div>
        <button
          onClick={closeModal}
          className="btn btn-ghost btn-xs btn-circle text-base hover:text-base-50"
        >
          <X size={16} />
        </button>
      </div>

      {/* Playlist list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-base">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : playlists.length === 0 ? (
          <p className="text-center text-sm text-base-content py-10">
            Bạn chưa có playlist nào.
          </p>
        ) : (
          playlists.map((pl) => {
            const isAdded = added.has(pl.playlistId);
            const isAdding = addingTo === pl.playlistId;
            const isInPlaylist = pl.inPlaylist || added.has(pl.playlistId);
            console.log(isInPlaylist);
            return (
              <button
                key={pl.playlistId}
                onClick={() => handleAddToPlaylist(pl.playlistId)}
                disabled={isAdded || isAdding}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors text-left
                  ${isAdded ? "bg-primary/5 cursor-default" : "hover:bg-neutral-50 cursor-pointer"}`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                  {pl.thumbnail ? (
                    <img
                      src={pl.thumbnail}
                      alt={pl.playlistName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ListVideo size={16} className="text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Name + count */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {pl.playlistName}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {pl.videoCount} video
                  </p>
                </div>

                {/* Status icon */}
                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    {isAdding ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-primary"
                      />
                    ) : (
                      <Bookmark
                        size={16}
                        className={
                          isInPlaylist
                            ? "text-primary fill-primary"
                            : "text-base-content"
                        }
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer: create new */}
      <div className="px-5 py-4 border-t border-base">
        {showNewInput ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreatePlaylist();
                if (e.key === "Escape") {
                  setShowNewInput(false);
                  setNewName("");
                }
              }}
              placeholder="Tên playlist mới..."
              className="input input-sm input-bordered flex-1 rounded-xl text-sm"
              maxLength={100}
            />
            <button
              onClick={handleCreatePlaylist}
              disabled={!newName.trim() || creating}
              className="btn btn-sm text-primary-content bg-primary rounded-xl px-3"
            >
              {creating ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Tạo"
              )}
            </button>
            <button
              onClick={() => {
                setShowNewInput(false);
                setNewName("");
              }}
              className="btn btn-sm btn-ghost btn-circle"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="btn btn-sm btn-ghost w-full gap-2 text-primary rounded-xl"
          >
            <Plus size={16} />
            Tạo playlist mới
          </button>
        )}
      </div>
    </div>
  );
}
