import React, { useState } from "react";
import toast from "react-hot-toast";
import { createReport } from "@/api/reportApi";

// Danh sách cấu hình dựa trên cấu trúc enum ViolationType.java
const VIOLATION_TYPES = [
  { enum: "ADULT_CONTENT", label: "Nội dung khiêu dâm" },
  {
    enum: "VIOLENT_OR_GRAPHIC_CONTENT",
    label: "Nội dung bạo lực hoặc phản cảm",
  },
  {
    enum: "HATEFUL_OR_ABUSIVE_CONTENT",
    label: "Nội dung lăng mạ hoặc kích động thù hận",
  },
  {
    enum: "HARMFUL_OR_DANGEROUS_ACTS",
    label: "Hành động gây hại hoặc nguy hiểm",
  },
  {
    enum: "SELF_HARM_OR_SUICIDE",
    label: "Hành vi tự tử, tự hủy hoại bản thân",
  },
  { enum: "MISINFORMATION", label: "Thông tin sai lệch" },
  { enum: "COPYRIGHT_INFRINGEMENT", label: "Vi phạm bản quyền" },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | number; // ID của video cần báo cáo
  videoOwnerId: string | number; // userId của chủ sở hữu video từ VideoResponseDto
}

export default function ReportModal({
  isOpen,
  onClose,
  videoId,
  videoOwnerId,
}: ReportModalProps) {
  const [selectedViolation, setSelectedViolation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViolation) {
      toast.error("Vui lòng chọn một loại vi phạm!");
      return;
    }

    // Convert videoId và videoOwnerId về kiểu number để khớp với kiểu Long ở Backend
    const numericVideoId = Number(videoId);
    const numericVideoOwnerId = Number(videoOwnerId);

    if (isNaN(numericVideoId)) {
      toast.error("ID video không hợp lệ!");
      return;
    }

    if (isNaN(numericVideoOwnerId)) {
      toast.error("ID chủ sở hữu video không hợp lệ!");
      return;
    }

    try {
      setLoading(true);
      await createReport({
        userId: numericVideoOwnerId, // Gửi userId của chủ video theo đúng cấu trúc Dto
        videoId: numericVideoId,
        violationType: selectedViolation,
        description: description,
      });

      toast.success("Gửi báo cáo thành công!");
      // Reset form trạng thái và đóng modal
      setSelectedViolation("");
      setDescription("");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gửi báo cáo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open z-[100]">
      <div className="modal-box bg-base-100 text-base-content max-w-md border border-base-300">
        <h3 className="font-bold text-lg text-primary mb-4">Báo cáo vi phạm</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Danh sách Radio */}
          <div className="form-control gap-2">
            <span className="label-text font-semibold text-base-content/80 mb-1">
              Chọn lý do vi phạm:
            </span>
            {VIOLATION_TYPES.map((type) => (
              <label
                key={type.enum}
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200 transition-colors"
              >
                <input
                  type="radio"
                  name="violationType"
                  className="radio radio-primary radio-sm"
                  value={type.enum}
                  checked={selectedViolation === type.enum}
                  onChange={(e) => setSelectedViolation(e.target.value)}
                />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>

          {/* Hiện Textarea khi đã chọn lỗi */}
          {selectedViolation && (
            <div className="form-control animate-fadeIn">
              <label className="label">
                <span className="label-text font-semibold text-base-content/80">
                  Mô tả chi tiết thêm:
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 bg-base-100 text-base-content focus:textarea-primary w-full"
                placeholder="Cung cấp thêm thông tin chi tiết để chúng tôi xử lý nhanh hơn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          )}

          {/* Hành động */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost text-base-content"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Gửi báo cáo"
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Click ngoài vùng modal để đóng */}
      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
}
