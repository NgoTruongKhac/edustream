import { AlertTriangle } from "lucide-react";

interface UserResponseDto {
  id: number;
  fullName: string;
  username: string;
  avatar?: string;
}

interface BlockUserModalProps {
  user: UserResponseDto;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BlockUserModal({
  user,
  loading = false,
  onConfirm,
  onClose,
}: BlockUserModalProps) {
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-error/10 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>

          <div>
            <h3 className="font-bold text-lg">Khoá tài khoản</h3>
            <p className="text-sm text-base-content/60">
              Hành động này sẽ vô hiệu hoá tài khoản người dùng.
            </p>
          </div>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-5">
          <p>Bạn có chắc chắn muốn khoá tài khoản:</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} />
                ) : (
                  <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="font-semibold text-base">{user.fullName}</p>
              <p className="text-sm text-base-content/60">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>

          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Khoá tài khoản"
            )}
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
