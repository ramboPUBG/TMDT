"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/services/api";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const resetSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z.string().min(6, "OTP phải có 6 số").max(6, "OTP phải có 6 số"),
  newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onSendOtp = async (data: EmailForm) => {
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      await api.post("/auth/forgot-password", { email: data.email });
      setEmail(data.email);
      resetForm.setValue("email", data.email);
      setMessage("Nếu email tồn tại, mã OTP đã được gửi. Kiểm tra console backend (dev) hoặc hộp thư.");
      setStep("reset");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không gửi được OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetForm) => {
    try {
      setIsLoading(true);
      setError("");
      await api.post("/auth/reset-password", data);
      setMessage("Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Đặt lại mật khẩu thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-center">Quên mật khẩu</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {step === "email"
          ? "Nhập email để nhận mã OTP"
          : `Nhập OTP đã gửi tới ${email}`}
      </p>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              {...emailForm.register("email")}
              placeholder="email@example.com"
              type="email"
            />
            {emailForm.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
          <input type="hidden" {...resetForm.register("email")} />
          <div>
            <label className="block text-sm font-medium mb-1">Mã OTP (6 số)</label>
            <Input {...resetForm.register("otp")} placeholder="123456" maxLength={6} />
            {resetForm.formState.errors.otp && (
              <p className="text-red-500 text-xs mt-1">
                {resetForm.formState.errors.otp.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <Input
              {...resetForm.register("newPassword")}
              type="password"
              placeholder="Mật khẩu mới"
            />
            {resetForm.formState.errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-secondary hover:underline"
            onClick={() => setStep("email")}
          >
            Gửi lại OTP
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-secondary font-medium hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
