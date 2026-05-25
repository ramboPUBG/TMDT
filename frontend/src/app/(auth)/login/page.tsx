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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.post("/auth/login", data) as AuthResponse;
      
      if (response.success) {
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        router.push("/");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Đăng nhập thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Đăng nhập</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input 
            {...register("email")} 
            placeholder="Nhập email của bạn" 
            type="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Mật khẩu</label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-secondary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input 
            {...register("password")} 
            placeholder="Nhập mật khẩu" 
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-secondary font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
