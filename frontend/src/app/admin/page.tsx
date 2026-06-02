"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingBag, DollarSign, Wallet } from "lucide-react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalUsers: number;
  successfulOrdersCount: number;
  totalGMV: number;
  totalCommission: number;
  recentOrders: any[];
  chartData: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/statistics/dashboard");
        setStats(res.data as DashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;
  if (!stats) return <div>Không thể tải dữ liệu</div>;

  const cards = [
    { title: "Tổng User", value: stats.totalUsers, icon: <Users className="text-blue-500" size={24} />, bg: "bg-blue-50" },
    { title: "Đơn Hoàn Thành", value: stats.successfulOrdersCount, icon: <ShoppingBag className="text-green-500" size={24} />, bg: "bg-green-50" },
    { title: "Doanh Thu Sàn (GMV)", value: formatPrice(stats.totalGMV), icon: <DollarSign className="text-purple-500" size={24} />, bg: "bg-purple-50" },
    { title: "Phí Dịch Vụ (15%)", value: formatPrice(stats.totalCommission), icon: <Wallet className="text-orange-500" size={24} />, bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Chỉ số lớn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${c.bg}`}>{c.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ và Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Biểu đồ doanh thu 7 ngày qua</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000000}M`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatPrice(value)} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="revenue" name="GMV" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" name="Phí thu được" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Đơn hàng mới nhất</h3>
          <div className="space-y-4">
            {stats.recentOrders.length === 0 && <p className="text-gray-500">Chưa có đơn hàng nào.</p>}
            {stats.recentOrders.map((order, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-sm">{order.buyerId?.fullName || "Khách hàng"}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">{formatPrice(order.totalAmount)}</p>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
