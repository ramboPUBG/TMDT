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
import { useAuthStore, User } from "@/stores/authStore";

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      const response = await api.post("/auth/register", registerData) as AuthResponse;
      
      if (response.success) {
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        router.push("/");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Đăng ký thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Đăng ký tài khoản</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <Input 
            {...register("fullName")} 
            placeholder="Nhập họ tên của bạn" 
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input 
            {...register("email")} 
            placeholder="Nhập email" 
            type="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <Input 
            {...register("password")} 
            placeholder="Nhập mật khẩu" 
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
          <Input 
            {...register("confirmPassword")} 
            placeholder="Nhập lại mật khẩu" 
            type="password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-secondary font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
