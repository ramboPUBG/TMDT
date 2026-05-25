"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookCard } from "@/components/ui/BookCard";
import api from "@/services/api";
import { useFetch } from "@/hooks/useFetch";
import { Book, PaginatedBooks, getBookImageUrl, Category, ApiResponse } from "@/types";

function BooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: categoriesResult } = useFetch<ApiResponse<Category[]>>('/categories');
  const categories = categoriesResult?.data || [];
  
  const categoryParam = searchParams.get("category") || "";
  const conditionParam = searchParams.get("condition") || "";
  const sortParam = searchParams.get("sort") || "newest";
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [publisher, setPublisher] = useState(searchParams.get("publisher") || "");

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = categories.find(c => c._id === categoryParam) || null;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const result = await api.get(`/books?${query}`) as PaginatedBooks;
        setBooks(result.data || []);
      } catch (error) {
        console.error("Failed to fetch books", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyAdvancedFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (author) params.set("author", author); else params.delete("author");
    if (publisher) params.set("publisher", publisher); else params.delete("publisher");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-16 pt-6">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {activeCategory ? activeCategory.name : "Tất cả sách"}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: Filters */}
          <div className="w-full lg:w-1/4 xl:w-1/5 flex flex-col gap-6">
            
            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span>📑</span> Danh Mục
              </h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => updateFilter("category", "")}
                  className={`text-left text-sm py-1.5 transition-colors ${!categoryParam ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                >
                  Tất cả danh mục
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat._id} 
                    onClick={() => updateFilter("category", cat._id)}
                    className={`text-left text-sm py-1.5 flex items-center justify-between transition-colors ${categoryParam === cat._id ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{cat.count || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="bg-white p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span>✨</span> Tình trạng
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { value: "like_new", label: "Như mới" },
                  { value: "good", label: "Rất tốt" },
                  { value: "fair", label: "Khá" },
                  { value: "worn", label: "Cũ" }
                ].map(cond => (
                  <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="condition"
                      checked={conditionParam === cond.value}
                      onChange={() => updateFilter("condition", cond.value)}
                      className="w-4 h-4 text-primary focus:ring-primary accent-primary" 
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">{cond.label}</span>
                  </label>
                ))}
                {conditionParam && (
                  <button onClick={() => updateFilter("condition", "")} className="text-xs text-primary text-left mt-2 hover:underline">
                    Xóa chọn lựa
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span>🔍</span> Lọc Nâng Cao
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tác giả</label>
                  <input 
                    type="text" 
                    placeholder="VD: Nam Cao" 
                    className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nhà xuất bản</label>
                  <input 
                    type="text" 
                    placeholder="VD: NXB Kim Đồng" 
                    className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Khoảng giá</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Từ" 
                      className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input 
                      type="number" 
                      placeholder="Đến" 
                      className="w-full h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleApplyAdvancedFilters} className="w-full mt-2">Áp dụng bộ lọc</Button>
              </div>
            </div>

          </div>

          {/* RIGHT MAIN AREA: Books Grid */}
          <div className="w-full lg:w-3/4 xl:w-4/5 flex flex-col gap-6">
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-xl font-bold text-foreground">
                {activeCategory ? `Sách ${activeCategory.name}` : "Tất cả sách"}
              </h1>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sắp xếp theo</span>
                <select 
                  value={sortParam}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="h-9 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="popular">Bán chạy nhất</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book._id}
                    id={book._id}
                    title={book.title}
                    author={book.author}
                    price={book.sellingPrice}
                    originalPrice={book.originalPrice}
                    condition={book.condition}
                    sellerName={book.sellerId?.fullName || book.sellerId?.name || 'Ẩn danh'}
                    imageUrl={getBookImageUrl(book, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800')}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-border text-center flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy cuốn sách nào</h3>
                <p className="text-muted-foreground">Thử điều chỉnh lại bộ lọc hoặc thay đổi từ khóa tìm kiếm xem sao.</p>
                <Button variant="outline" className="mt-6" onClick={() => router.push('/books')}>Xóa tất cả bộ lọc</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BooksContent />
    </Suspense>
  );
}
