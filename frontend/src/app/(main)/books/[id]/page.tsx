"use client";

import { useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useFetch } from "@/hooks/useFetch";
import { Book, ApiResponse } from "@/types";

import { BookGallery } from "./components/BookGallery";
import { BookInfo } from "./components/BookInfo";
import { RelatedBooks } from "./components/RelatedBooks";
import { ReviewsSection } from "./components/ReviewsSection";

function getStatusCode(err: unknown) {
  if (typeof err === "object" && err !== null && "response" in err) {
    return (err as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const { data: bookResult, isLoading, error: fetchError } = useFetch<ApiResponse<Book>>(`/books/${id}`);
  
  useEffect(() => {
    const status = getStatusCode(fetchError);
    if (status === 404 || (!isLoading && !fetchError && !bookResult?.data)) {
      router.replace('/404');
    }
  }, [fetchError, isLoading, bookResult, router]);

  if (isLoading) {
    return <div className="py-20 text-center text-lg">Đang tải thông tin sách...</div>;
  }

  if (fetchError || !bookResult?.data) {
    return null;
  }

  const book = bookResult.data;

  return (
    <div className="bg-muted/30 pb-16">
      <div className="bg-white border-b border-border mb-6">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          {book.categoryId && (
             <>
               <Link href={`/books?category=${book.categoryId._id}`} className="hover:text-primary">{book.categoryId.name}</Link>
               <span>/</span>
             </>
          )}
          <span className="text-foreground line-clamp-1">{book.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-border flex flex-col md:flex-row gap-6">
              <BookGallery images={book.images} title={book.title} />
              <BookInfo book={book} id={id} />
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Mô tả sản phẩm</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {book.description || 'Chưa có mô tả'}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-3">Thuộc tính chi tiết:</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex">
                    <span className="text-muted-foreground w-32">Danh mục:</span>
                    <span className="font-medium text-foreground">{book.categoryId?.name}</span>
                  </div>
                  <div className="flex">
                     <span className="text-muted-foreground w-32">Ngày đăng:</span>
                     <span className="font-medium text-foreground">{new Date(book.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <ReviewsSection bookId={id} />
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border bg-muted">
                  <Image
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${book.sellerId?._id || book.sellerId?.fullName || "seller"}`}
                    alt={book.sellerId?.fullName || "Người bán"}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-bold text-foreground line-clamp-1">{book.sellerId?.fullName || "Người bán"}</h3>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 w-full text-xs"
                  onClick={() => router.push(`/chat?userId=${book.sellerId?._id}`)}
                >
                  💬 Chat ngay
                </Button>
                <Button variant="outline" className="flex-1 w-full text-xs border-primary text-primary hover:bg-primary/5">🏪 Xem shop</Button>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-foreground mb-4">Cam kết từ SachCu</h3>
              <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="text-green-500 mt-0.5">✅</div>
                  <div>
                    <p className="font-medium text-foreground">Hoàn tiền 100%</p>
                    <p className="text-xs mt-1">Nếu sản phẩm không đúng như mô tả</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {book.categoryId?._id && (
           <RelatedBooks categoryId={book.categoryId._id} currentBookId={book._id} />
        )}
      </div>
    </div>
  );
}
