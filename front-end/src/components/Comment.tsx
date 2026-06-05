import { useEffect, useRef, useState } from "react";
import {
  ThumbsUp,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  createComment,
  getComments,
  likeComment,
  replyComment,
  getRepliesByCommentId, // Import thêm API mới
  type CommentResponseDto,
} from "@/api/commentApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  videoId: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarCircle({
  src,
  name,
  size = 10,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0 border border-base`}
    >
      <img
        src={
          src ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        }
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function ReplyItem({
  reply,
  onLike,
}: {
  reply: CommentResponseDto;
  onLike: (id: number) => void;
}) {
  return (
    <div className="flex gap-2.5 mt-3">
      <AvatarCircle src={reply.avatar} name={reply.fullName} size={8} />
      <div className="flex-1 min-w-0">
        <div className="bg-base-100 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-base-content">
            {reply.fullName}
          </p>
          <p className="text-sm text-base-content mt-0.5 break-words">
            {reply.content}
          </p>
        </div>
        <button
          onClick={() => onLike(reply.id)}
          className={`flex items-center gap-1 mt-1 ml-2 text-xs transition-colors ${
            reply.likedByMe
              ? "text-primary font-semibold"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <ThumbsUp size={12} strokeWidth={reply.likedByMe ? 2.5 : 2} />
          <span>{reply.likeCount > 0 ? reply.likeCount : "Thích"}</span>
        </button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  videoId,
  onLike,
  onReplySubmit,
  onFetchReplies, // Thêm prop để báo cho cha fetch dữ liệu
}: {
  comment: CommentResponseDto;
  videoId: number;
  onLike: (id: number) => void;
  onReplySubmit: (parentId: number, content: string) => Promise<void>;
  onFetchReplies: (commentId: number) => Promise<void>;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lấy replyCount thực tế từ Backend trả về
  const replyCount = comment.replyCount ?? 0;

  const handleToggleReplies = async () => {
    const isOpening = !showReplies;
    setShowReplies(isOpening);

    // Nếu đang mở và chưa có dữ liệu replies trong state thì mới gọi API
    if (isOpening && (!comment.replies || comment.replies.length === 0)) {
      setLoadingReplies(true);
      try {
        await onFetchReplies(comment.id);
      } finally {
        setLoadingReplies(false);
      }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReplySubmit(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  useEffect(() => {
    if (showReplyInput) textareaRef.current?.focus();
  }, [showReplyInput]);

  return (
    <div className="flex gap-3">
      <AvatarCircle src={comment.avatar} name={comment.fullName} size={10} />

      <div className="flex-1 min-w-0">
        <div className="bg-base-200 rounded-xl px-4 py-3">
          <p className="text-sm font-bold text-base-content">
            {comment.fullName}
          </p>
          <p className="text-sm text-base-content/90 mt-1 break-words whitespace-pre-line leading-relaxed">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center cursor-pointer gap-1 text-xs transition-colors ${
              comment.likedByMe
                ? "text-primary font-bold"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <ThumbsUp size={13} strokeWidth={comment.likedByMe ? 2.5 : 2} />
            <span>{comment.likeCount > 0 ? comment.likeCount : "Thích"}</span>
          </button>

          <button
            onClick={() => setShowReplyInput((p) => !p)}
            className="flex items-center gap-1 text-xs text-base-content/60 hover:text-base-content transition-colors cursor-pointer"
          >
            <MessageSquare size={13} />
            <span>Trả lời</span>
          </button>
        </div>

        {showReplyInput && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1 flex items-end gap-2 bg-base-100 border border-base rounded-xl px-3 py-2 focus-within:border-primary transition-colors">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Viết trả lời..."
                rows={1}
                className="flex-1 text-sm text-base-content bg-transparent outline-none resize-none placeholder:text-neutral-400"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || submitting}
                className="btn btn-xs btn-circle btn-primary shrink-0 disabled:opacity-30"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Send size={12} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Nút Xem trả lời sử dụng field replyCount từ DTO */}
        {replyCount > 0 && (
          <button
            onClick={handleToggleReplies}
            disabled={loadingReplies}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-2 ml-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loadingReplies ? (
              <span className="loading loading-spinner loading-xs" />
            ) : showReplies ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
            {showReplies ? "Ẩn" : `Xem ${replyCount} trả lời`}
          </button>
        )}

        {showReplies && comment.replies && (
          <div className="ml-1 mt-1">
            {comment.replies.map((r) => (
              <ReplyItem key={r.id} reply={r} onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Comment({ videoId }: Props) {
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchComments(0);
  }, [videoId]);

  const fetchComments = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      const res = await getComments(videoId, pageNumber);
      if (pageNumber === 0) setComments(res.content);
      else setComments((prev) => [...prev, ...res.content]);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Lỗi load comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await createComment({
        content: newComment.trim(),
        videoId,
      });
      setComments((prev) => [created, ...prev]);
      setNewComment("");
      setFocused(false);
    } catch (err) {
      console.error("Lỗi tạo comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Logic fetch replies từ API
  const handleFetchReplies = async (commentId: number) => {
    try {
      const res = await getRepliesByCommentId(commentId, 0); // Có thể mở rộng page nếu cần
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies: res.content } : c,
        ),
      );
    } catch (err) {
      console.error("Lỗi load replies:", err);
    }
  };

  const handleLike = async (commentId: number) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likedByMe: !c.likedByMe,
            likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
          };
        }
        return {
          ...c,
          replies: c.replies?.map((r) =>
            r.id === commentId
              ? {
                  ...r,
                  likedByMe: !r.likedByMe,
                  likeCount: r.likedByMe ? r.likeCount - 1 : r.likeCount + 1,
                }
              : r,
          ),
        };
      }),
    );
    try {
      await likeComment({ commentId });
    } catch (err) {
      console.error("Lỗi like:", err);
    }
  };

  const handleReplySubmit = async (parentId: number, content: string) => {
    const created = await replyComment({ content, videoId, parentId });
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [...(c.replies ?? []), created],
              replyCount: (c.replyCount ?? 0) + 1, // Cập nhật số lượng hiển thị ngay lập tức
            }
          : c,
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateComment();
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-base sm:text-lg font-semibold text-base-content mb-4">
        {comments.length} bình luận
      </h2>

      <div className="flex gap-3 mb-6">
        {currentUser ? (
          <AvatarCircle
            src={currentUser.avatar || ""}
            name={currentUser.fullName ?? ""}
            size={10}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
        )}

        <div className="flex-1">
          {currentUser ? (
            <div
              className={`flex items-end gap-2 border rounded-2xl px-4 py-2.5 bg-base-100 transition-colors ${
                focused ? "border-primary" : "border-base"
              }`}
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => !newComment && setFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Viết bình luận..."
                rows={focused ? 3 : 1}
                className="flex-1 text-sm text-base-content bg-transparent outline-none resize-none transition-all"
              />

              {(focused || newComment) && (
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim() || submitting}
                  className="btn btn-sm btn-primary rounded-xl shrink-0 gap-1.5"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span className="hidden sm:inline">Đăng</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border border-base rounded-2xl px-4 py-3 bg-base-100">
              <p className="text-sm text-base-content/70">
                Vui lòng đăng nhập để đăng bình luận.
              </p>

              <Link to="/login" className="btn btn-primary btn-sm rounded-lg">
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {comments.length === 0 && !isLoading ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              videoId={videoId}
              onLike={handleLike}
              onReplySubmit={handleReplySubmit}
              onFetchReplies={handleFetchReplies} // Truyền function mới
            />
          ))
        )}
      </div>

      {page < totalPages - 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchComments(page + 1)}
            disabled={isLoading}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isLoading ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        </div>
      )}
    </div>
  );
}
