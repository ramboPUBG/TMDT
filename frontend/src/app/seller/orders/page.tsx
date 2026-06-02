"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package, MapPin, Phone, CreditCard, ChevronDown, CheckCircle2 } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";

interface Order {
  _id: string;
  items: Array<{
    bookId: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  totalAmount: number;
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  buyerId: {
    _id: string;
    fullName: string;
  };
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/seller") as any;
      setOrders(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      if (newStatus === 'CANCELLED') {
        await api.patch(`/orders/${orderId}/cancel`);
      } else {
        await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      }
      // Reload orders to reflect changes
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Chờ xác nhận</span>;
      case 'PROCESSING': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Đang chuẩn bị</span>;
      case 'SHIPPED': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">Đang giao</span>;
      case 'DELIVERED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Đã giao</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Đã hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getAvailableNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return 'PROCESSING';
      case 'PROCESSING': return 'SHIPPED';
      case 'SHIPPED': return 'DELIVERED';
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PROCESSING': return 'Xác nhận đơn';
      case 'SHIPPED': return 'Giao cho đơn vị vận chuyển';
      case 'DELIVERED': return 'Xác nhận đã giao hàng';
      default: return status;
    }
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-border shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-medium">Chưa có đơn hàng nào</h3>
          <p className="text-muted-foreground mt-2">Khi có khách đặt hàng, danh sách sẽ hiển thị ở đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = getAvailableNextStatus(order.orderStatus);
            const isUpdating = updating === order._id;

            return (
              <div key={order._id} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center bg-muted/30 p-4 border-b border-border gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                      <p className="font-semibold">{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="h-8 w-px bg-border hidden sm:block"></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày đặt</p>
                      <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-medium flex items-center gap-2 mb-3"><Package size={18}/> Sản phẩm</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="relative w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2 text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">SL: x{item.quantity}</p>
                          <p className="font-semibold text-primary mt-1">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Info & Actions */}
                  <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2"><MapPin size={18}/> Khách hàng</h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p className="flex items-center gap-1 text-muted-foreground"><Phone size={14}/> {order.shippingAddress.phone}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{order.shippingAddress.address}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                       <h4 className="font-medium flex items-center gap-2 mb-2"><CreditCard size={18}/> Thanh toán</h4>
                       <div className="text-sm flex justify-between bg-muted/50 p-3 rounded-lg">
                         <span className="font-semibold">Tổng thu:</span>
                         <span className="font-bold text-primary text-lg">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                         </span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-4 flex flex-col gap-2">
                      {nextStatus && (
                        <Button 
                          onClick={() => handleUpdateStatus(order._id, nextStatus)}
                          disabled={isUpdating}
                          className="w-full flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                        >
                          {isUpdating ? "Đang cập nhật..." : (
                            <>
                              <CheckCircle2 size={18}/> 
                              {getStatusLabel(nextStatus)}
                            </>
                          )}
                        </Button>
                      )}
                      {order.orderStatus === 'PENDING' && (
                        <Button 
                          variant="outline" 
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            if(confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
                                handleUpdateStatus(order._id, 'CANCELLED');
                            }
                          }}
                          disabled={isUpdating}
                        >
                          Từ chối & Hủy đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
