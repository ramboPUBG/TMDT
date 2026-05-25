"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  orderStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  sellerId?: { fullName?: string };
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/profile/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = (await api.get("/orders/my")) as OrdersResponse;
        setOrders(res.data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Không tải được đơn hàng"));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Đơn hàng của tôi</h1>

      {loading && <p className="text-muted-foreground">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
          <Link href="/books">
            <Button>Mua sách ngay</Button>
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex flex-wrap justify-between gap-2 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mã đơn: <span className="font-mono text-foreground">{order._id.slice(-8)}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>

            <ul className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <li key={i} className="text-sm text-foreground">
                  {item.title} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {order.paymentMethod === "COD" ? "Thanh toán COD" : "Chuyển khoản"}
              </span>
              <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
