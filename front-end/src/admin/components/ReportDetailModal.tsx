import { X, Play, User, FileText, Calendar, Hash } from "lucide-react";

export interface ReportResponseDto {
  id: number;
  userId: number;
  videoId: number;
  avatar?: string;
  fullName: string;
  username: string;
  title: string;
  thumbnail?: string;
  violationType: string;
  reportStatus: string;
  description?: string;
  createdAt: string;
}

const violationLabels: Record<string, string> = {
  ADULT_CONTENT: "Nội dung khiêu dâm",
  VIOLENT_OR_GRAPHIC_CONTENT: "Nội dung bạo lực hoặc phản cảm",
  HATEFUL_OR_ABUSIVE_CONTENT: "Nội dung lăng mạ hoặc kích động thù hận",
  HARMFUL_OR_DANGEROUS_ACTS: "Hành động gây hại hoặc nguy hiểm",
  SELF_HARM_OR_SUICIDE: "Hành vi tự tử, tự hủy hoại bản thân",
  MISINFORMATION: "Thông tin sai lệch",
  COPYRIGHT_INFRINGEMENT: "Vi phạm bản quyền",
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-base-200 last:border-0">
      <span className="text-xs text-base-content/50 w-36 shrink-0 pt-0.5 font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 text-sm text-base-content break-all">
        {children}
      </div>
    </div>
  );
}

interface Props {
  report: ReportResponseDto;
  onClose: () => void;
}

export default function ReportDetailModal({ report, onClose }: Props) {
  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-xl w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg text-base-content">
              Chi tiết báo cáo
            </h3>
            <p className="text-xs text-base-content/40 font-mono mt-0.5">
              #{report.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video thumbnail */}
        <div className="mb-4 rounded-lg overflow-hidden bg-base-300 aspect-video relative">
          {report.thumbnail ? (
            <img
              src={report.thumbnail}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/30">
              <Play className="w-10 h-10" />
            </div>
          )}
        </div>

        <div>
          <Row label="ID báo cáo">
            <span className="font-mono">{report.id}</span>
          </Row>

          <Row label="Video bị báo cáo">
            <div>
              <p className="font-medium">{report.title}</p>
              <p className="text-xs text-base-content/50 font-mono mt-0.5">
                Video ID: {report.videoId}
              </p>
            </div>
          </Row>

          <Row label="Tài khoản báo cáo">
            <div className="flex items-center gap-2">
              {report.avatar ? (
                <img
                  src={report.avatar}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-base-300 shrink-0"
                  alt={report.fullName}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-base-300 shrink-0">
                  {report.fullName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{report.fullName}</p>
                <p className="text-xs text-base-content/50">
                  @{report.username}
                </p>
              </div>
            </div>
          </Row>

          <Row label="User ID">
            <span className="font-mono text-base-content/60">
              {report.userId}
            </span>
          </Row>

          <Row label="Loại vi phạm">
            <span className="badge badge-sm badge-warning">
              {violationLabels[report.violationType] ?? report.violationType}
            </span>
          </Row>

          <Row label="Mô tả">
            {report.description ? (
              <span className="whitespace-pre-wrap">{report.description}</span>
            ) : (
              <span className="text-base-content/30 italic">
                Không có mô tả
              </span>
            )}
          </Row>

          <Row label="Ngày gửi">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-base-content/40" />
              {new Date(report.createdAt).toLocaleString("vi-VN")}
            </span>
          </Row>
        </div>

        <div className="modal-action">
          <button className="btn btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
