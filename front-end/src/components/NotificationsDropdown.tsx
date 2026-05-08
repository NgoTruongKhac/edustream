import { useEffect, useRef, useState } from "react";
import { getNotificationsByUser } from "@/api/notificationApi";
import { Link } from "react-router-dom";

// ── Types ────────────────────────────────────────────────────────────────────
interface NotificationResponseDto {
  fullName: string;
  avatar: string;
  thumbnail: string;
  message: string; // "title" in the UI
  referenceId: number;
  createdAt: string; // ISO-8601 / Instant as string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getDateLabel(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();

  if (isSameDay(date, now)) return "Hôm nay";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Hôm qua";

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "Tuần trước";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── NotificationItem ──────────────────────────────────────────────────────────
function NotificationItem({
  notification,
}: {
  notification: NotificationResponseDto;
}) {
  const { fullName, avatar, thumbnail, message, referenceId } = notification;
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName,
  )}&background=random`;

  return (
    <Link
      to={`/watch/${referenceId}`}
      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-base-200 cursor-pointer transition-colors"
    >
      {/* Sender avatar */}
      <div className="avatar flex-shrink-0">
        <div className="w-10 h-10 rounded-full border border-base-300">
          <img
            src={avatar || fallback}
            alt={fullName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-base-content truncate">
          {fullName}
        </p>
        <p className="text-xs text-base-content/60 truncate">{message}</p>
      </div>

      {/* Video thumbnail */}
      {thumbnail && (
        <div className="flex-shrink-0">
          <img
            src={thumbnail}
            alt="thumbnail"
            className="w-14 h-10 object-cover rounded-lg border border-base-300"
          />
        </div>
      )}
    </Link>
  );
}

// ── NotificationsDropdown ─────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

const LABEL_ORDER = ["Hôm nay", "Hôm qua", "Tuần trước"];

export default function NotificationsDropdown({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch when opened
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotificationsByUser()
      .then((data) => setNotifications(data?.content ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  // Group by date label
  const grouped: Record<string, NotificationResponseDto[]> = {};
  for (const n of notifications) {
    const label = getDateLabel(n.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(n);
  }

  const sortedLabels = Object.keys(grouped).sort((a, b) => {
    const ia = LABEL_ORDER.indexOf(a);
    const ib = LABEL_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  return (
    <div
      ref={panelRef}
      className="
        absolute right-0 top-full mt-2
        w-[340px] sm:w-[380px]
        max-w-[calc(100vw-1rem)]
        max-h-[80vh] overflow-y-auto
        bg-base-100 border border-base-300
        rounded-2xl shadow-xl z-[200]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 sticky top-0 bg-base-100 z-10">
        <span className="font-bold text-base-content text-base">Thông báo</span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-10 text-center text-base-content/50 text-sm">
          Không có thông báo nào.
        </div>
      ) : (
        <div className="p-2">
          {sortedLabels.map((label) => (
            <div key={label}>
              <p className="px-3 pt-3 pb-1 text-xs font-bold text-base-content/50 uppercase tracking-wide">
                {label}
              </p>
              <ul className="space-y-0.5">
                {grouped[label].map((n, idx) => (
                  <NotificationItem key={idx} notification={n} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
