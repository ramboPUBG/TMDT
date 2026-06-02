"use client";

import Image from "next/image";
import Link from "next/link";
import { BookCard } from "@/components/ui/BookCard";
import { useFetch } from "@/hooks/useFetch";
import { PaginatedBooks, ApiResponse, Category, getBookImageUrl } from "@/types";

export default function HomePage() {
  const { data: categoriesResult, isLoading: isLoadingCategories, error: categoriesError } = useFetch<ApiResponse<Category[]>>('/categories');
  const { data: booksResult, isLoading: isLoadingBooks, error: booksError } = useFetch<PaginatedBooks>('/books?limit=10');

  const categories = categoriesResult?.data || [];
  const books = booksResult?.data || [];

  return (
    <div className="bg-background pb-16">
      {/* Hero Banner Area */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Cộng đồng yêu sách cũ
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Trao đổi tri thức, <br />
              <span className="text-primary">Gìn giữ tương lai</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Nền tảng mua bán sách cũ an toàn, tiện lợi với hàng ngàn đầu sách. Cùng nhau chia sẻ tri thức, bảo vệ môi trường!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/books" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5">
                Mua sách ngay
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10"></div>
            <div className="relative w-full max-w-md aspect-square bg-white rounded-3xl p-6 shadow-2xl shadow-black/5 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80"
                alt="Sách cũ"
                fill
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover rounded-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Khám phá theo danh mục</h2>
              <p className="text-muted-foreground">Tìm cuốn sách yêu thích của bạn theo thể loại</p>
            </div>
            <Link href="/categories" className="text-primary font-medium hover:underline hidden sm:block">
              Xem tất cả
            </Link>
          </div>
          
          {isLoadingCategories ? (
            <div className="text-center py-8">Đang tải danh mục...</div>
          ) : categoriesError ? (
            <div className="text-center text-red-500 py-8">Không thể tải danh mục</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Chưa có danh mục nào</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link href={`/books?category=${cat._id}`} key={cat._id} className="group bg-white p-6 rounded-2xl border border-border text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl transition-colors">
                    {cat.icon || "📚"}
                  </div>
                  <h3 className="font-medium text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.count || 0} sách</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* New Arrivals Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Sách vừa đăng bán</h2>
              <p className="text-muted-foreground">Những cuốn sách mới nhất vừa được cộng đồng chia sẻ</p>
            </div>
            <Link href="/books" className="text-primary font-medium hover:underline hidden sm:block">
              Xem tất cả
            </Link>
          </div>
          
          {isLoadingBooks ? (
             <div className="text-center py-12">Đang tải sách...</div>
          ) : booksError ? (
             <div className="text-center text-red-500 py-12">Không thể tải sách mới</div>
          ) : books.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">Chưa có sách nào</div>
          ) : (
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
                  imageUrl={getBookImageUrl(book, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80')}
                  sellerName={book.sellerId?.fullName || book.sellerId?.name || 'Người bán'}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
