"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { ApiResponse, Category } from "@/types";

export default function CategoriesPage() {
  const { data, isLoading, error } = useFetch<ApiResponse<Category[]>>("/categories");
  const categories = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Danh mục sách</h1>
      <p className="text-muted-foreground mb-8">
        Chọn danh mục để xem sách tương ứng
      </p>

      {isLoading && <p className="text-center py-8">Đang tải...</p>}
      {!!error && (
        <p className="text-center text-red-500 py-8">Không tải được danh mục</p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Chưa có danh mục. Admin có thể seed qua API{" "}
          <code className="text-xs bg-muted px-1 rounded">POST /api/categories/seed</code>
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/books?category=${cat._id}`}
            className="p-6 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-md transition-all text-center"
          >
            <span className="text-3xl block mb-3">{cat.icon || "📚"}</span>
            <h2 className="font-semibold text-foreground">{cat.name}</h2>
            {cat.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {cat.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
