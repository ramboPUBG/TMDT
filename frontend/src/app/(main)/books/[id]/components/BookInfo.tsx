"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { Book } from "@/types";
import api from "@/services/api";

interface BookInfoProps {
  book: Book;
  id: string;
}

export function BookInfo({ book, id }: BookInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isAdded, setIsAdded] = useState(false);
  const [showParticle, setShowParticle] = useState(false);
  const { fetchCart } = useCartStore();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/books/${id}`);
      return;
    }

    try {
      await api.post('/cart/items', { bookId: id, quantity: 1 });
      setIsAdded(true);
      setShowParticle(true);
      
      // Update cart from server
      await fetchCart();

      setTimeout(() => setShowParticle(false), 800);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng", error);
    }
  };

  const conditionLabels: Record<string, string> = {
    new: 'Mới',
    like_new: 'Như mới',
    good: 'Rất tốt',
    fair: 'Khá',
    poor: 'Cũ'
  };

  const discount = book.originalPrice
    ? Math.round((1 - book.sellingPrice / book.originalPrice) * 100)
    : 0;

  return (
    <div className="w-full md:w-7/12 flex flex-col">
      <div className="mb-2">
        <Badge variant="secondary" className="mb-2 bg-secondary/10 text-secondary border-none">
          Tình trạng: {conditionLabels[book.condition] || 'Không xác định'}
        </Badge>
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">{book.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
        <div>Tác giả: <span className="font-medium text-foreground">{book.author}</span></div>
      </div>
      
      <div className="bg-primary/5 rounded-xl p-4 mb-6">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-3xl font-bold text-primary">{formatPrice(book.sellingPrice)}</span>
          {book.originalPrice && (
            <span className="text-muted-foreground line-through mb-1">
              {formatPrice(book.originalPrice)}
            </span>
          )}
        </div>
        {discount > 0 && (
          <div className="text-sm font-medium text-secondary mt-1">
            Tiết kiệm {formatPrice(book.originalPrice - book.sellingPrice)} ({discount}%) so với giá gốc
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
            if (!isAuthenticated) {
              router.push(`/login?redirect=/books/${id}`);
              return;
            }
            router.push("/cart");
          }}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
