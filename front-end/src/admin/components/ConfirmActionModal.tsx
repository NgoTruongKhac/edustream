import { AlertCircle } from "lucide-react";
import { type ReportResponseDto } from "./ReportDetailModal";

interface ConfirmActionModalProps {
  report: ReportResponseDto;
  actionType: "accept" | "reject";
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionModal({
  report,
  actionType,
  isLoading,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  const isAccept = actionType === "accept";

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex items-center gap-3 text-base-content">
          <AlertCircle
            className={`w-6 h-6 ${isAccept ? "text-success" : "text-error"}`}
          />
          <h3 className="font-bold text-lg">
            {isAccept ? "Xác nhận giải quyết" : "Xác nhận từ chối"}
          </h3>
        </div>

        <p className="py-4 text-sm text-base-content/70">
          Bạn có chắc chắn muốn{" "}
          {isAccept ? "chấp nhận và giải quyết" : "bác bỏ"} báo cáo{" "}
          <strong className="font-mono">#{report.id}</strong> của video{" "}
          <span className="italic font-medium">"{report.title}"</span> không?
        </p>

        <div className="modal-action">
          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            className={`btn btn-sm ${isAccept ? "btn-success text-white" : "btn-error text-white"}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            Xác nhận
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
