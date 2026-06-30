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

  // Review states
  const [reviewedBookIds, setReviewedBookIds] = useState<Set<string>>(new Set());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{
    bookId: string;
    title: string;
    orderId: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleOpenReviewModal = (bookId: string, title: string, orderId: string) => {
    setSelectedBook({ bookId, title, orderId });
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBook(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedBook) return;

    try {
      setSubmittingReview(true);
      setReviewError("");
      await api.post("/reviews", {
        bookId: selectedBook.bookId,
        orderId: selectedBook.orderId,
        rating: reviewRating,
        comment: reviewComment,
      });

      // Add to reviewed set
      setReviewedBookIds((prev) => {
        const next = new Set(prev);
        next.add(selectedBook.bookId);
        return next;
      });

      handleCloseReviewModal();
    } catch (err: any) {
      setReviewError(getErrorMessage(err, "Không thể gửi đánh giá"));
    } finally {
      setSubmittingReview(false);
    }
  };

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

    const fetchReviewedBooks = async () => {
      try {
        const res = (await api.get("/reviews/my")) as any;
        if (res && res.data) {
          const ids = new Set<string>(res.data.map((r: any) => r.bookId));
          setReviewedBookIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch reviewed books", err);
      }
    };

    fetchOrders();
    fetchReviewedBooks();
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

            {/* Order Items with Image and Review Button */}
            <div className="space-y-4 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                        Ảnh
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {order.orderStatus === "DELIVERED" && (
                      <div className="min-w-[90px] text-right">
                        {reviewedBookIds.has(item.bookId) ? (
                          <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                            Đã đánh giá
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReviewModal(item.bookId, item.title, order._id)}
                          >
                            Đánh giá
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {order.paymentMethod === "COD" ? "Thanh toán COD" : "Chuyển khoản"}
              </span>
              <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-foreground mb-2">Đánh giá sản phẩm</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn đang đánh giá sách: <span className="font-semibold text-foreground">{selectedBook.title}</span>
            </p>

            <div className="space-y-6">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chất lượng sản phẩm (1 - 5 sao)
                </label>
                <div className="flex gap-2 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`transition-colors duration-150 ${
                        star <= reviewRating ? "text-amber-400" : "text-gray-200 hover:text-amber-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Text Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bình luận & Đánh giá chi tiết
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm placeholder:text-muted-foreground bg-transparent"
                  placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách (độ mới, đóng gói, nội dung...)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseReviewModal}
                  disabled={submittingReview}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
