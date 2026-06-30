"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Star, MessageSquareOff } from "lucide-react";
import Image from "next/image";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerId?: {
    fullName?: string;
    avatar?: string;
  };
  bookId?: {
    _id: string;
    title: string;
    images?: Array<string | { url: string }>;
  };
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reviews/seller") as { data: Review[] };
        setReviews(res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải đánh giá của shop");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <div className="p-8 text-muted-foreground text-sm">Đang tải đánh giá...</div>;
  }

  const getBookImageUrl = (book: any) => {
    const image = book?.images?.[0];
    if (!image) return "";
    return typeof image === 'string' ? image : image.url || "";
  };

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Đánh giá của khách hàng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi ý kiến phản hồi và điểm đánh giá của người mua đối với sách của shop.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-200/50 p-6 rounded-3xl flex items-center gap-6 w-fit">
          <div className="text-center">
            <div className="text-4xl font-black text-amber-600">{avgRating}</div>
            <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-0.5">điểm trung bình</div>
          </div>
          <div className="h-12 w-px bg-amber-200" />
          <div>
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={18} 
                  className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground font-semibold mt-1">Tổng cộng {reviews.length} đánh giá sản phẩm</div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <MessageSquareOff size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Chưa có đánh giá nào</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Shop của bạn chưa nhận được đánh giá nào từ khách hàng đối với các sản phẩm sách đã giao thành công.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 divide-y divide-border space-y-6">
          {reviews.map((review, idx) => {
            const bookImg = getBookImageUrl(review.bookId);
            return (
              <div key={review._id} className={`flex flex-col sm:flex-row gap-4 items-start ${idx > 0 ? "pt-6" : ""}`}>
                {/* Book Image */}
                {review.bookId && bookImg && (
                  <div className="relative w-14 h-20 rounded bg-muted overflow-hidden flex-shrink-0 border border-border">
                    <Image
                      src={bookImg}
                      alt={review.bookId.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                
                {/* Review Body */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-foreground text-sm line-clamp-1">
                      {review.bookId?.title || "Sách đã xóa"}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {review.buyerId?.fullName?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Người mua: {review.buyerId?.fullName || "Khách hàng"}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-sm text-foreground mt-2">
                      {review.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
