"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/services/api";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  userId?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
}

interface ReviewsSectionProps {
  bookId: string;
}

export function ReviewsSection({ bookId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = (await api.get(`/reviews/book/${bookId}`)) as any;
        if (res && res.data) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews for book", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border mt-6">
        <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Đánh giá sản phẩm</h2>
        <div className="text-muted-foreground text-sm">Đang tải đánh giá...</div>
      </div>
    );
  }

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : "0";

  return (
    <div className="bg-white p-6 rounded-2xl border border-border mt-6">
      <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Đánh giá sản phẩm</h2>

      {reviewCount > 0 ? (
        <div className="space-y-6">
          {/* Summary Stats Card */}
          <div className="bg-muted/30 p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:border-r sm:border-border sm:pr-8">
              <div className="text-4xl font-extrabold text-foreground">{averageRating}</div>
              <div className="text-amber-400 text-xl my-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="leading-none">
                    {i < Math.round(Number(averageRating)) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{reviewCount} lượt đánh giá</p>
            </div>
            <div className="flex-1 w-full text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground mb-1">Mọi người nghĩ gì về cuốn sách này?</p>
              <p className="text-xs leading-relaxed">
                Tất cả các đánh giá đều đến từ khách hàng đã mua và nhận cuốn sách này thành công trên SachCu.
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="divide-y divide-border">
            {reviews.map((review) => {
              const userAvatar =
                review.userId?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  review.userId?.fullName || review._id
                }`;

              return (
                <div key={review._id} className="py-6 first:pt-2 last:pb-2">
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
                      <Image
                        src={userAvatar}
                        alt={review.userId?.fullName || "Khách hàng"}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Review Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {review.userId?.fullName || "Khách hàng của SachCu"}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="text-amber-400 text-sm mb-2 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="leading-none">{i < review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
                        {review.comment || "Người mua không để lại bình luận."}
                      </p>

                      {/* Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {review.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted"
                            >
                              <img
                                src={img}
                                alt="Ảnh đánh giá"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm py-4">Chưa có đánh giá nào cho sản phẩm này.</div>
      )}
    </div>
  );
}
