import React from "react";

import {
  X,
  Shield,
  Mail,
  AtSign,
  Hash,
  AlertCircle,
  Globe,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type UserStatus = "ACTIVE" | "BLOCKED" | "WARNED";

interface UserResponseDto {
  id: number;
  fullName: string;
  username: string;
  description?: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  authProvider?: string;
  providerId?: string;
  subscribersCount: number;
  strikeCount: number;
  userStatus: UserStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<UserStatus, { label: string; badge: string }> = {
  ACTIVE: { label: "Hoạt động", badge: "badge-success" },
  BLOCKED: { label: "Đã khoá", badge: "badge-error" },
  WARNED: { label: "Cảnh báo", badge: "badge-warning" },
};

export default function UserDetailModal({
  user,
  onClose,
}: {
  user: UserResponseDto;
  onClose: () => void;
}) {
  const status = statusConfig[user.userStatus] ?? {
    label: user.userStatus,
    badge: "badge-ghost",
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 overflow-hidden rounded-2xl">
        {/* Khối bọc dùng absolute để định vị avatar chuẩn xác hơn */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-44 w-full overflow-hidden">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20" />
            )}
          </div>

          {/* Close button - Đặt ở tầng cha để không bị ảnh hưởng bởi overflow của ảnh */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost bg-base-100/70 hover:bg-base-100 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar overlapping cover - Đã chuyển ra ngoài khối overflow-hidden */}
          <div className="absolute -bottom-10 left-6 z-10">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-base-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold ring-4 ring-base-100">
                  {user.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pt-14 px-6 pb-6">
          {/* Name & Status */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-base-content leading-tight">
                {user.fullName}
              </h2>
              <p className="text-base-content/60 text-sm">@{user.username}</p>
            </div>
            <span className={`badge badge-lg ${status.badge}`}>
              {status.label}
            </span>
          </div>

          {/* Description */}
          {user.description && (
            <p className="mt-3 text-base-content/70 text-sm leading-relaxed bg-base-200 rounded-xl px-4 py-3">
              {user.description}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-base-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {user.subscribersCount.toLocaleString()}
              </p>
              <p className="text-xs text-base-content/60 mt-0.5">Subscribers</p>
            </div>
            <div className="bg-base-200 rounded-xl p-3 text-center">
              <p
                className={`text-2xl font-bold ${user.strikeCount > 0 ? "text-warning" : "text-success"}`}
              >
                {user.strikeCount}
              </p>
              <p className="text-xs text-base-content/60 mt-0.5">Cảnh cáo</p>
            </div>
            <div className="bg-base-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-base-content">#{user.id}</p>
              <p className="text-xs text-base-content/60 mt-0.5">User ID</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-4 space-y-2.5">
            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<AtSign className="w-4 h-4" />}
              label="Username"
              value={`@${user.username}`}
            />
            {user.authProvider && (
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label="Auth Provider"
                value={user.authProvider}
              />
            )}
            {user.providerId && (
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="Provider ID"
                value={user.providerId}
              />
            )}
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Trạng thái"
              value={
                <span className={`badge badge-sm ${status.badge}`}>
                  {status.label}
                </span>
              }
            />
            <InfoRow
              icon={<AlertCircle className="w-4 h-4" />}
              label="Strike Count"
              value={
                <span
                  className={
                    user.strikeCount > 0
                      ? "text-warning font-semibold"
                      : "text-success"
                  }
                >
                  {user.strikeCount}
                </span>
              }
            />
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </dialog>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-base-content/50 shrink-0">{icon}</span>
      <span className="text-base-content/60 w-28 shrink-0">{label}</span>
      <span className="text-base-content font-medium truncate">{value}</span>
    </div>
  );
}
