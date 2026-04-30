import { useState, useEffect } from "react";
import { useShowModalStore } from "@/stores/useShowModal";
import { AxiosError } from "axios";

interface OTPModalProps {
  verifyFn: (otp: string) => Promise<unknown>;
  onSuccess?: () => void;
}

export function OTPModal({ verifyFn, onSuccess }: OTPModalProps) {
  const showModal = useShowModalStore((state) => state.showModal);
  const setShowModal = useShowModalStore((state) => state.setShowModal);

  const [error, setError] = useState("");
  const [countDown, setCountDown] = useState(120);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (showModal && countDown > 0) {
      const timerId = setInterval(() => {
        setCountDown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else if (countDown <= 0) {
      setError("The OTP has expired. Please request a new code");
    }
  }, [showModal, countDown]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // auto focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otpCode];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtpCode(newOtp);

    const lastIndex = Math.min(pasted.length - 1, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otpCode[index]) {
        // Ô hiện tại có giá trị → xoá giá trị, giữ nguyên focus
        const newOtp = [...otpCode];
        newOtp[index] = "";
        setOtpCode(newOtp);
      } else if (index > 0) {
        // Ô hiện tại trống → lùi về ô trước và xoá
        const newOtp = [...otpCode];
        newOtp[index - 1] = "";
        setOtpCode(newOtp);
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await verifyFn(otpCode.join(""));
      setShowModal(false);
      onSuccess?.();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.data) {
        setError(axiosError.response.data.message);
      }
    }
  };

  return (
    <div className="modal-box w-90">
      <h3 className="font-bold text-lg">Enter verification code</h3>

      <p className="py-2">We sent a 6-digit code to your email.</p>

      <div className="text-center mb-2">
        {countDown > 0 ? (
          <p className="text-primary">
            The OTP code will expire in:{" "}
            <span className="font-mono tracking-wider">
              {formatTime(countDown)}
            </span>
          </p>
        ) : (
          <p className="text-red-500">The OTP code has expired!</p>
        )}
      </div>

      <form onSubmit={onSubmit}>
        {/* OTP INPUT */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Verification code</span>
          </label>

          <div className="flex justify-between gap-2">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onPaste={handlePaste}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="input input-bordered w-10 text-center text-lg"
              />
            ))}
          </div>

          <label className="label">
            <span className="label-text-alt">
              Enter the 6-digit code sent to your email.
            </span>
          </label>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>

        {/* BUTTON */}
        <div className="form-control mt-4">
          <button className="btn btn-primary w-full" type="submit">
            Verify
          </button>
        </div>

        <p className="text-center text-sm mt-2">
          Didn&apos;t receive the code?{" "}
          <a href="#" className="link link-primary">
            Resend
          </a>
        </p>
      </form>
    </div>
  );
}
