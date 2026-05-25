"use client";

import Link from "next/link";
import { BookCard } from "@/components/ui/BookCard";
import { useFetch } from "@/hooks/useFetch";
import { PaginatedBooks } from "@/types";

export function RelatedBooks({ categoryId, currentBookId }: { categoryId: string; currentBookId: string }) {
  const { data: result, isLoading, error } = useFetch<PaginatedBooks>(
    categoryId ? `/books?category=${categoryId}&limit=6` : null
  );

  const books = result?.data?.filter((b) => b._id !== currentBookId) || [];

  if (isLoading) return <div className="py-8 text-center">Đang tải sách liên quan...</div>;
  if (error || books.length === 0) return null;

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Sách cùng thể loại</h2>
        <Link href={`/books?category=${categoryId}`} className="text-primary font-medium hover:underline">
          Xem tất cả
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {books.map((book) => (
          <BookCard 
            key={book._id} 
            id={book._id}
            title={book.title}
            author={book.author}
            price={book.sellingPrice}
            originalPrice={book.originalPrice}
            condition={book.condition}
            imageUrl={book.images?.[0] || ''}
            sellerName={book.sellerId?.fullName || ''}
          />
        ))}
      </div>
    </div>
  );
}
