"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export function ReviewsSection({ bookId }: { bookId: string }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await api.get(`/reviews/book/${bookId}`)) as { data?: Review[] };
      setReviews(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (!bookId) return;

    const timer = setTimeout(() => {
      fetchReviews();
    }, 0);

    return () => clearTimeout(timer);
  }, [bookId, fetchReviews]);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
  const hasReviewed = Boolean(user?._id && reviews.some((review) => review.userId._id === user._id));

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const ratingIndex = Math.round(review.rating) - 1;
    if (ratingIndex >= 0 && ratingIndex < 5) {
      ratingCounts[ratingIndex]++;
    }
  });

  const submitReview = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/books/${bookId}`);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await api.post("/reviews", {
        bookId,
        rating,
        comment: comment.trim(),
        images: [],
      });
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, "Có lỗi xảy ra khi gửi đánh giá."));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, size = 14) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-6 rounded-2xl border border-border bg-white p-6">
      <h2 className="mb-6 border-b border-border pb-2 text-lg font-bold text-foreground">
        Đánh giá sản phẩm
      </h2>

      <div className="mb-6 rounded-2xl border border-primary/10 bg-primary/5 p-5">
        {isAuthenticated ? (
          hasReviewed ? (
            <div className="text-sm font-medium text-green-700">
              Bạn đã đánh giá sản phẩm này. Cảm ơn bạn đã chia sẻ nhận xét.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-foreground">Chọn số sao</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Đánh giá ${star} sao`}
                    >
                      <Star
                        size={30}
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Nhận xét của bạn
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                  className="min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {submitError}
                </div>
              )}

              <Button onClick={submitReview} disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Đăng nhập để đánh giá sản phẩm này. Bạn không cần phải mua hàng trước.
            </p>
            <Button onClick={() => router.push(`/login?redirect=/books/${bookId}`)}>
              Đăng nhập để đánh giá
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">Đang tải đánh giá...</div>
      ) : totalReviews === 0 ? (
        <div className="py-4 text-sm text-muted-foreground">
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/10 bg-primary/5 p-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="mb-1 text-4xl font-extrabold text-primary">
                {avgRating} <span className="text-lg font-medium text-muted-foreground">trên 5</span>
              </div>
              <div className="mb-2 flex justify-center sm:justify-start">
                {renderStars(Number(avgRating))}
              </div>
              <div className="text-sm text-muted-foreground">{totalReviews} đánh giá</div>
            </div>

            <div className="w-full max-w-[280px] space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <div key={review._id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-border bg-primary/5">
                    <Image
                      src={review.userId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId._id}`}
                      alt={review.userId.fullName}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h4 className="truncate text-sm font-bold text-foreground">{review.userId.fullName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    {review.comment && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    )}

                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.images.map((img, idx) => (
                          <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              src={img}
                              alt="Ảnh đánh giá sản phẩm"
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
