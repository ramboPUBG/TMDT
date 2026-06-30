"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LayoutDashboard, BookOpen, ListTree, ShoppingCart, LogOut, Wallet } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && user?.role !== "admin") {
      router.replace("/");
    } else if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  const menu = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Quản lý Sách", href: "/admin/books", icon: <BookOpen size={20} /> },
    { label: "Quản lý Danh mục", href: "/admin/categories", icon: <ListTree size={20} /> },
    { label: "Quản lý Đơn hàng", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { label: "Duyệt rút tiền", href: "/admin/withdrawals", icon: <Wallet size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">SachCu Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors font-medium"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {menu.find((m) => m.href === pathname)?.label || "Quản trị viên"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Xin chào, {user.fullName}</span>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
