"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Star, X, MessageSquare, CheckCircle } from "lucide-react";

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

  // Review states
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [reviewedBookIds, setReviewedBookIds] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState<string | null>(null); // Book ID being submitted
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/profile/orders");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const openReviewModal = async (order: Order) => {
    setReviewingOrder(order);
    setReviewError("");
    setReviewMessage("");
    // Reset inputs
    const initialRatings: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    order.items.forEach((item) => {
      initialRatings[item.bookId] = 5; // Default 5 stars
      initialComments[item.bookId] = "";
    });
    setRatings(initialRatings);
    setComments(initialComments);

    // Fetch reviewed book IDs for this order
    try {
      const res = (await api.get(`/reviews/order/${order._id}/reviewed`)) as { data: string[] };
      setReviewedBookIds(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviewed books", err);
      setReviewedBookIds([]);
    }
  };

  const handleStarClick = (bookId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [bookId]: star }));
  };

  const handleCommentChange = (bookId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [bookId]: comment }));
  };

  const submitReview = async (bookId: string) => {
    if (!reviewingOrder) return;
    
    try {
      setSubmittingReview(bookId);
      setReviewError("");
      setReviewMessage("");

      await api.post("/reviews", {
        orderId: reviewingOrder._id,
        bookId,
        rating: ratings[bookId] || 5,
        comment: comments[bookId] || "",
      });

      setReviewMessage("Gửi đánh giá sách thành công!");
      setReviewedBookIds((prev) => [...prev, bookId]);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setSubmittingReview(null);
    }
  };

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
            className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-wrap justify-between gap-2 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mã đơn: <span className="font-mono text-foreground font-semibold">{order._id.slice(-8).toUpperCase()}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                order.orderStatus === "DELIVERED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : order.orderStatus === "CANCELLED"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>

            <div className="border-y border-border py-4 my-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  {item.imageUrl && (
                    <div className="relative w-12 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-foreground text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-2">
              <div className="text-sm text-muted-foreground">
                Thanh toán: <span className="font-medium text-foreground">{order.paymentMethod === "COD" ? "COD" : order.paymentMethod === "VNPAY" ? "VNPAY" : "Chuyển khoản"}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">Tổng tiền:</span>
                  <span className="font-extrabold text-primary text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.orderStatus === "DELIVERED" && (
                  <Button 
                    size="sm" 
                    onClick={() => openReviewModal(order)}
                    className="shadow-sm font-semibold"
                  >
                    <Star size={14} className="mr-1.5 fill-current" />
                    Đánh giá
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Đánh giá sản phẩm</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Đơn hàng: {reviewingOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setReviewingOrder(null)} 
                className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {(reviewMessage || reviewError) && (
                <div className={`p-4 rounded-2xl border text-sm ${
                  reviewError ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  {reviewError || reviewMessage}
                </div>
              )}

              {reviewingOrder.items.map((item) => {
                const isReviewed = reviewedBookIds.includes(item.bookId);
                const bookRating = ratings[item.bookId] || 5;
                const bookComment = comments[item.bookId] || "";

                return (
                  <div key={item.bookId} className="border border-border rounded-2xl p-5 bg-muted/10 space-y-4">
                    <div className="flex gap-4">
                      {item.imageUrl && (
                        <div className="relative w-12 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-foreground text-sm line-clamp-2">{item.title}</h4>
                        {isReviewed && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1.5">
                            <CheckCircle size={12} />
                            Đã đánh giá thành công
                          </span>
                        )}
                      </div>
                    </div>

                    {!isReviewed && (
                      <div className="space-y-3">
                        {/* Rating stars */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Số sao</label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleStarClick(item.bookId, star)}
                                className="text-amber-400 focus:outline-none transition-transform hover:scale-110 duration-150"
                              >
                                <Star 
                                  size={24} 
                                  className={star <= bookRating ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment input */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <MessageSquare size={12} />
                            Nhận xét sản phẩm
                          </label>
                          <textarea
                            placeholder="Nhập cảm nhận của bạn về cuốn sách (độ mới, nội dung...)"
                            value={bookComment}
                            onChange={(e) => handleCommentChange(item.bookId, e.target.value)}
                            className="w-full p-3 border border-border rounded-xl text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            disabled={submittingReview !== null}
                            onClick={() => submitReview(item.bookId)}
                          >
                            {submittingReview === item.bookId ? "Đang gửi..." : "Gửi đánh giá"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setReviewingOrder(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
