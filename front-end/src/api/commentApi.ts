import api from "./apiClient";

export interface CommentRequestDto {
  content: string;
  videoId: number;
}

export interface LikeCommentRequestDto {
  commentId: number;
}

export interface ReplyCommentRequestDto {
  content: string;
  videoId: number;
  parentId: number;
}

export interface CommentResponseDto {
  id: number;
  content: string;
  likeCount: number;
  fullName: string;
  username: string;
  avatar: string;
  replies?: CommentResponseDto[];
  likedByMe?: boolean;
}

export const createComment = async (
  dto: CommentRequestDto,
): Promise<CommentResponseDto> => {
  const res = await api.post("/comments", dto);
  return res.data;
};

export const likeComment = async (
  dto: LikeCommentRequestDto,
): Promise<void> => {
  await api.post("/comments/like", dto);
};

export const replyComment = async (
  dto: ReplyCommentRequestDto,
): Promise<CommentResponseDto> => {
  const res = await api.post("/comments/reply", dto);
  return res.data;
};

export const getComments = async (videoId: number, page: number = 0) => {
  const res = await api.get(`/comments/${videoId}?page=${page}`);
  return res.data;
};
