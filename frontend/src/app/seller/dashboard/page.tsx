"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, ArrowRight, TrendingUp, MessageCircle } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/Button";

interface DashboardStats {
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [booksRes, ordersRes] = await Promise.all([
          api.get("/books/my?limit=1"),
          api.get("/orders/seller")
        ]) as any;

        const totalBooks = booksRes.pagination?.total || 0;
        const orders = ordersRes.data || [];
        
        // Tính toán doanh thu từ các đơn hàng thành công hoặc đã giao
        const revenue = orders.reduce((sum: number, order: any) => {
          if (order.orderStatus === 'DELIVERED' || order.paymentStatus === 'COMPLETED') {
            return sum + order.totalAmount;
          }
          return sum;
        }, 0);

        setStats({
          totalBooks,
          totalOrders: orders.length,
          totalRevenue: revenue,
          recentOrders: orders.slice(0, 5)
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchConversations();
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan cửa hàng</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sách đang bán</p>
              <h3 className="text-2xl font-bold">{stats.totalBooks}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Đơn hàng gần đây
          </h2>
          <Link href="/seller/orders" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="p-0">
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Mã ĐH: {order._id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary self-end mt-1">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" /> Tin nhắn gần đây
          </h2>
          <Link href="/seller/chat" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="p-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Chưa có tin nhắn nào
            </div>
          ) : (
            conversations.slice(0, 3).map((conv) => {
              const otherUser = conv.participants.find((p: any) => p._id !== user?._id);
              return (
                <Link 
                  href={`/seller/chat?userId=${otherUser?._id}`} 
                  key={conv._id}
                  className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {otherUser?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {otherUser?.fullName || "Người dùng"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage || "Bắt đầu trò chuyện"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
