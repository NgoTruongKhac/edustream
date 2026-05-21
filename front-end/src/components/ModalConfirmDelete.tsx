import { deleteVideoById } from "@/api/videoApi";
import { Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";

interface ModalConfirmDeleteProps {
  videoId: number;
  title?: string;
  modalId: string;
  onSuccess?: () => void;
}

export default function ModalConfirmDelete({
  videoId,
  title = "Bạn muốn xoá video này?",
  modalId,
  onSuccess,
}: ModalConfirmDeleteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteVideoById(videoId);
      (document.getElementById(modalId) as HTMLDialogElement)?.close();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-box rounded-xl max-w-xs p-6 bg-base-100">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <TriangleAlert className="text-red-500" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-base-content">Xác nhận xoá</h3>
          <p className="text-sm text-base-content/60 mt-0.5">{title}</p>
        </div>
        <div className="flex gap-2 w-full mt-1">
          <form method="dialog" className="flex-1">
            <button
              className="btn btn-sm text-base-content btn-outline w-full rounded-lg"
              disabled={isLoading}
            >
              Huỷ
            </button>
          </form>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex-1 rounded-lg border-none"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Xoá"}
          </button>
        </div>
      </div>
    </div>
  );
}
