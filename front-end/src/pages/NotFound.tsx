import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>

      <p className="text-lg text-neutral-600 mb-6">
        Trang bạn tìm không tồn tại hoặc đã bị xóa.
      </p>

      <button
        onClick={() => navigate("/")}
        className="btn rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition"
      >
        Quay về trang chủ
      </button>
    </div>
  );
}
