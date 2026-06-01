import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";
import { getAllUsers } from "@/api/userApi";
import UserDetailModal from "../components/UserDetailModal";
import BlockUserModal from "../components/BlockUserModal";
import { blockUser } from "@/api/violationApi";
import toast from "react-hot-toast";

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

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

type SortField =
  | "id"
  | "fullName"
  | "username"
  | "email"
  | "strikeCount"
  | "userStatus";
type SortDir = "asc" | "desc" | null;

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<UserStatus, { label: string; badge: string }> = {
  ACTIVE: { label: "Hoạt động", badge: "badge-success" },
  BLOCKED: { label: "Đã khoá", badge: "badge-error" },
  WARNED: { label: "Cảnh báo", badge: "badge-warning" },
};

function Avatar({
  src,
  name,
  size = 10,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-base-300`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-base-300`}
    >
      {initials}
    </div>
  );
}

// ─── Sort Header ─────────────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField | null;
  dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const isActive = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold text-xs tracking-wide hover:text-primary transition-colors"
    >
      {label}
      {isActive ? (
        dir === "asc" ? (
          <ArrowUp className="w-3 h-3 text-primary" />
        ) : (
          <ArrowDown className="w-3 h-3 text-primary" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ManageUsers() {
  const [data, setData] = useState<PageResponse<UserResponseDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null,
  );
  const [blocking, setBlocking] = useState(false);

  const [userToBlock, setUserToBlock] = useState<UserResponseDto | null>(null);

  // Fetch
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: PageResponse<UserResponseDto> = await getAllUsers(page);
      setData(res);
    } catch (e) {
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side search + sort (server only pages)
  const displayed = (() => {
    if (!data) return [];
    let list = [...data.content];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (sortField && sortDir) {
      list.sort((a, b) => {
        const va = a[sortField as keyof UserResponseDto] ?? "";
        const vb = b[sortField as keyof UserResponseDto] ?? "";
        const cmp = String(va).localeCompare(String(vb), "vi", {
          numeric: true,
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  })();

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const handleWarn = (user: UserResponseDto) => {
    alert(`Gửi cảnh báo đến ${user.fullName}`);
  };

  const handleToggleLock = (user: UserResponseDto) => {
    if (user.userStatus === "BLOCKED") {
      toast.error("Chức năng mở khoá chưa được hỗ trợ.");
      return;
    }

    setUserToBlock(user);
  };
  const handleConfirmBlock = async () => {
    if (!userToBlock) return;

    try {
      setBlocking(true);

      await blockUser(userToBlock.id);

      toast.success(`Đã khoá tài khoản ${userToBlock.fullName}`);

      setUserToBlock(null);

      await fetchUsers();
    } catch (error) {
      toast.error("Không thể khoá tài khoản.");
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Quản lý tài khoản
            </h1>
          </div>
        </div>

        {/* Search */}
        <label className="input input-bordered input-sm flex items-center gap-2 w-full max-w-xs">
          <Search className="w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Tìm tên, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow"
          />
        </label>
      </div>

      {/* Table Card */}
      <div className="bg-base-100 border border-base-300 rounded-md overflow-hidden shadow-sm">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-base-content/60">
            <AlertCircle className="w-10 h-10 text-error" />
            <p>{error}</p>
            <button className="btn btn-sm btn-primary" onClick={fetchUsers}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-base-200 text-base-content/70">
                <tr>
                  <th className="w-12">
                    <SortHeader
                      label="ID"
                      field="id"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Người dùng"
                      field="fullName"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="hidden md:table-cell">
                    <SortHeader
                      label="Username"
                      field="username"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="hidden lg:table-cell">
                    <SortHeader
                      label="Email"
                      field="email"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="Trạng thái"
                      field="userStatus"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th>
                    <SortHeader
                      label="SỐ LẦN CẢNH BÁO"
                      field="strikeCount"
                      current={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right text-xs tracking-wide font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  /* Daisy UI Table Skeleton */
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td>
                        <div className="skeleton h-4 w-8" />
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                          <div className="skeleton h-4 w-24" />
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <div className="skeleton h-4 w-20" />
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="skeleton h-4 w-36" />
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16 rounded-full" />
                      </td>
                      <td>
                        <div className="skeleton h-4 w-6" />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <div className="skeleton w-6 h-6 rounded" />
                          <div className="skeleton w-6 h-6 rounded" />
                          <div className="skeleton w-6 h-6 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-base-content/40"
                    >
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  displayed.map((user) => {
                    const status = statusConfig[user.userStatus] ?? {
                      label: user.userStatus,
                      badge: "badge-ghost",
                    };
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        {/* ID */}
                        <td className="text-base-content/50 text-xs font-mono">
                          #{user.id}
                        </td>

                        {/* Avatar + Name */}
                        <td>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              src={user.avatar}
                              name={user.fullName}
                              size={8}
                            />
                            <span className="font-medium text-base-content truncate max-w-[120px]">
                              {user.fullName}
                            </span>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="hidden md:table-cell text-base-content/60 text-sm">
                          @{user.username}
                        </td>

                        {/* Email */}
                        <td className="hidden lg:table-cell text-base-content/60 text-sm truncate max-w-[180px]">
                          {user.email}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge badge-sm ${status.badge}`}>
                            {status.label}
                          </span>
                        </td>

                        {/* Strike */}
                        <td>
                          <span
                            className={`flex items-center gap-1 text-sm font-semibold ${
                              user.strikeCount > 0
                                ? "text-warning"
                                : "text-base-content/40"
                            }`}
                          >
                            {user.strikeCount > 0 && (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {user.strikeCount}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {/* Xem chi tiết */}
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-info" />
                            </button>

                            {/* Cảnh báo */}
                            <button
                              onClick={() => handleWarn(user)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip="Cảnh báo"
                              disabled={user.userStatus === "BLOCKED"}
                            >
                              <AlertTriangle className="w-4 h-4 text-warning" />
                            </button>

                            {/* Khoá / Mở khoá */}
                            <button
                              onClick={() => handleToggleLock(user)}
                              className="btn btn-ghost btn-xs tooltip tooltip-left"
                              data-tip={
                                user.userStatus === "BLOCKED"
                                  ? "Mở khoá"
                                  : "Khoá tài khoản"
                              }
                            >
                              {user.userStatus === "BLOCKED" ? (
                                <Unlock className="w-4 h-4 text-success" />
                              ) : (
                                <Lock className="w-4 h-4 text-error" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-base-300 flex-wrap gap-2">
            <p className="text-xs text-base-content/50">
              Trang {data.page + 1} / {data.totalPages} &middot;{" "}
              {data.totalElements.toLocaleString()} người dùng
            </p>

            <div className="join">
              <button
                className="join-item btn btn-sm btn-ghost"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: data.totalPages }, (_, i) => i)
                .filter((i) => Math.abs(i - page) <= 2)
                .map((i) => (
                  <button
                    key={i}
                    className={`join-item btn btn-sm ${i === page ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}

              <button
                className="join-item btn btn-sm btn-ghost"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {userToBlock && (
        <BlockUserModal
          user={userToBlock}
          loading={blocking}
          onClose={() => setUserToBlock(null)}
          onConfirm={handleConfirmBlock}
        />
      )}
    </div>
  );
}
