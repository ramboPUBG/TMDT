"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  buyerId: { fullName: string; email: string };
  sellerId: { fullName: string; email: string };
  totalAmount: number;
  platformFee: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/admin");
        setOrders((res as any).data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">Quản lý Đơn hàng toàn hệ thống</h2>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Chưa có đơn hàng nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-gray-600 font-medium">Mã ĐH</th>
                <th className="py-3 px-4 text-gray-600 font-medium">Khách hàng</th>
                <th className="py-3 px-4 text-gray-600 font-medium">Shop (Người bán)</th>
                <th className="py-3 px-4 text-gray-600 font-medium">Trạng thái</th>
                <th className="py-3 px-4 text-gray-600 font-medium text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-gray-600 font-medium text-right">Phí sàn (15%)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{order.buyerId?.fullName}</p>
                    <p className="text-xs text-gray-500">{order.buyerId?.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{order.sellerId?.fullName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                  <td className="py-4 px-4 text-right font-bold text-orange-500">{formatPrice(order.platformFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
