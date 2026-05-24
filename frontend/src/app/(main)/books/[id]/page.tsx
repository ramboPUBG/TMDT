"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookCard } from "@/components/ui/BookCard";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

// Mock data
const mockBook = {
  id: "1",
  title: "📚 ĐÔI CÁNH - Tuyển tập truyện ngắn Nga đương đại Moscow Edition hiếm sưu tầm bìa cứng",
  author: "Nhiều tác giả",
  price: 550000,
  originalPrice: 700000,
  condition: "like_new",
  description: `📚 ĐÔI CÁNH  
Tuyển tập truyện ngắn Nga đương đại • Moscow Edition

Một tuyển tập khá đặc biệt dành cho người yêu văn học Nga hiện đại — gồm nhiều truyện ngắn đặc sắc từ các nhà văn hàng đầu nước Nga hiện nay. Bản in bìa cứng vô cùng hiếm, thích hợp cho việc sưu tầm và trưng bày.

Tình trạng sách: Sách như mới, không nhăn, không gập gáy, các trang ruột trắng phau.`,
  images: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800",
  ],
  seller: {
    id: "s1",
    name: "Tiệm sách cũ Cô Ba",
    rating: 4.8,
    reviewsCount: 120,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=coba",
    joinDate: "Tháng 5, 2022",
    responseRate: "98%"
  },
  stock: 1,
  category: "Văn học nước ngoài",
  weight: "450g",
  publisher: "NXB Văn Học"
};

const mockRelatedBooks = [
  {
    id: "2",
    title: "Sapiens: Lược sử loài người",
    author: "Yuval Noah Harari",
    price: 120000,
    originalPrice: 195000,
    condition: "like_new",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
    sellerName: "Mọt Sách SG",
  },
  {
    id: "3",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 35000,
    originalPrice: 86000,
    condition: "fair",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
    sellerName: "Sách Cũ Giá Rẻ",
  },
  {
    id: "4",
    title: "Harry Potter và Hòn Đá Phù Thủy",
    author: "J.K. Rowling",
    price: 60000,
    originalPrice: 130000,
    condition: "good",
    imageUrl: "https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=500&q=80",
    sellerName: "Hogwarts Library",
  },
  {
    id: "5",
    title: "Tâm Lý Học Tội Phạm",
    author: "T Stanton Samenow",
    price: 85000,
    originalPrice: 145000,
    condition: "like_new",
    imageUrl: "https://images.unsplash.com/photo-1587876878363-22879586146c?w=500&q=80",
    sellerName: "Read And Share",
  },
];

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showParticle, setShowParticle] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/books/${params.id}`);
      return;
    }

    setIsAdded(true);
    setShowParticle(true);
    addItem();
    
    // Animation particle goes away quickly
    setTimeout(() => {
      setShowParticle(false);
    }, 800);

    // Button state resets after 2s
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // In a real app, we would fetch the book by params.id
  const book = mockBook;
  
  const discount = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-muted/30 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border mb-6">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <Link href={`/books?category=${book.category}`} className="hover:text-primary">{book.category}</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{book.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Image Gallery & Info */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Info Card */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-border flex flex-col md:flex-row gap-6">
              
              {/* Image Gallery */}
              <div className="w-full md:w-5/12 flex flex-col gap-4">
                <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden relative border border-border">
                  <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {book.images.map((img, idx) => (
                    <div key={idx} className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2 ${idx === 0 ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="w-full md:w-7/12 flex flex-col">
                <div className="mb-2">
                  <Badge variant="secondary" className="mb-2 bg-secondary/10 text-secondary border-none">
                    {book.condition === 'like_new' ? '✨ Tình trạng: Như mới' : 
                     book.condition === 'good' ? '👍 Tình trạng: Rất tốt' : 
                     book.condition === 'fair' ? '📖 Tình trạng: Khá' : 'Tình trạng: Cũ'}
                  </Badge>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">{book.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                  <div>Tác giả: <span className="font-medium text-foreground">{book.author}</span></div>
                  <div className="w-1 h-1 rounded-full bg-border"></div>
                  <div>NXB: <span className="font-medium text-foreground">{book.publisher}</span></div>
                </div>
                
                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-3xl font-bold text-primary">{formatPrice(book.price)}</span>
                    {book.originalPrice && (
                      <span className="text-muted-foreground line-through mb-1">
                        {formatPrice(book.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="text-sm font-medium text-secondary mt-1">
                      Tiết kiệm {formatPrice(book.originalPrice - book.price)} ({discount}%) so với giá gốc
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex gap-3 relative">
                  {showParticle && (
                    <div className="absolute left-[15%] -top-10 text-primary font-bold text-2xl animate-bounce pointer-events-none drop-shadow-md z-10">
                      +1 🛒
                    </div>
                  )}
                  <Button 
                    variant={isAdded ? "default" : "outline"} 
                    size="lg" 
                    className={`flex-1 transition-all duration-300 ${
                      isAdded 
                        ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 shadow-md shadow-green-500/30' 
                        : 'border-primary text-primary hover:bg-primary/5'
                    }`}
                    onClick={handleAddToCart}
                  >
                    {isAdded ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ"}
                  </Button>
                  <Button 
                    size="lg" 
                    className="flex-1 shadow-lg shadow-primary/30"
                    onClick={() => {
                      if (!mounted) return;
                      if (!isAuthenticated) {
                        router.push(`/login?redirect=/books/${params.id}`);
                        return;
                      }
                      // Implement Buy Now logic later
                      router.push("/cart");
                    }}
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Description Card */}
            <div className="bg-white p-6 rounded-2xl border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Mô tả sản phẩm</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {book.description}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-3">Thuộc tính chi tiết:</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex">
                    <span className="text-muted-foreground w-32">Danh mục:</span>
                    <span className="font-medium text-foreground">{book.category}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-32">Khối lượng:</span>
                    <span className="font-medium text-foreground">{book.weight}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-32">Kho hàng:</span>
                    <span className="font-medium text-foreground">{book.stock} cuốn</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-32">Gửi từ:</span>
                    <span className="font-medium text-foreground">Hà Nội</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* RIGHT: Seller Info & Policies */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Seller Card */}
            <div className="bg-white p-5 rounded-2xl border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-muted">
                  <img src={book.seller.avatar} alt={book.seller.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground line-clamp-1">{book.seller.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
                    <span>★</span> {book.seller.rating} 
                    <span className="text-muted-foreground font-normal ml-1">({book.seller.reviewsCount} đánh giá)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-muted/50 rounded-xl text-sm text-center">
                <div>
                  <div className="text-muted-foreground mb-1">Tỉ lệ phản hồi</div>
                  <div className="font-bold text-foreground">{book.seller.responseRate}</div>
                </div>
                <div className="border-l border-border">
                  <div className="text-muted-foreground mb-1">Tham gia</div>
                  <div className="font-bold text-foreground">{book.seller.joinDate}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 w-full text-xs">
                  💬 Chat ngay
                </Button>
                <Button variant="outline" className="flex-1 w-full text-xs border-primary text-primary hover:bg-primary/5">
                  🏠 Xem shop
                </Button>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="bg-white p-5 rounded-2xl border border-border">
              <h3 className="font-bold text-foreground mb-4">Cam kết từ SachCu</h3>
              <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="text-green-500 mt-0.5">🛡️</div>
                  <div>
                    <p className="font-medium text-foreground">Hoàn tiền 100%</p>
                    <p className="text-xs mt-1">Nếu sản phẩm không đúng như mô tả</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5">📦</div>
                  <div>
                    <p className="font-medium text-foreground">Giao hàng toàn quốc</p>
                    <p className="text-xs mt-1">Hỗ trợ phí ship lên tới 30K</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-orange-500 mt-0.5">🌱</div>
                  <div>
                    <p className="font-medium text-foreground">Đóng góp xanh</p>
                    <p className="text-xs mt-1">Cùng nhau giảm rác thải, bảo vệ môi trường</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
        
        {/* Related Books */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Sách cùng thể loại</h2>
            <Link href={`/books?category=${book.category}`} className="text-primary font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {mockRelatedBooks.map((related) => (
              <BookCard key={related.id} {...related} />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
