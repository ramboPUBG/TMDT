"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { getBookImageUrl } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items: cart, isLoading, fetchCart, updateItemQuantity, removeItem, toggleItemSelection } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }
    fetchCart();
  }, [isAuthenticated, router, fetchCart]);

  const handleUpdateQuantity = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    updateItemQuantity(itemId, newQty);
  };

  const handleRemove = (itemId: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      removeItem(itemId);
    }
  };

  const handleSelect = (itemId: string, checked: boolean) => {
    toggleItemSelection(itemId, checked);
  };

  // Tính toán tổng tiền
  const selectedItems = cart.flatMap(group => group.items).filter(item => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.bookId.sellingPrice * item.quantity), 0);
  const totalOriginalAmount = selectedItems.reduce((sum, item) => sum + ((item.bookId.originalPrice || item.bookId.sellingPrice) * item.quantity), 0);
  const discount = totalOriginalAmount - totalAmount;

  if (isLoading) {
    return <div className="container mx-auto py-16 text-center">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="bg-muted/30 min-h-screen pb-16">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <h1 className="text-2xl font-bold text-foreground">Giỏ hàng của bạn</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-border flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 mb-6 text-muted-foreground/30">🛒</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
            <Button onClick={() => router.push('/books')} size="lg">Tiếp tục mua sắm</Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              {cart.map((group, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-border p-4 md:p-5">
                  <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <div className="font-semibold text-foreground">{group.sellerId?.fullName || "Người bán"}</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {group.items.map(item => (
                      <div key={item._id} className="flex gap-4 relative">
                        <div className="flex items-center pt-2">
                          <input 
                            type="checkbox" 
                            checked={item.selected || false} 
                            onChange={(e) => handleSelect(item._id, e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
                          />
                        </div>
                        <div className="w-20 h-24 sm:w-24 sm:h-32 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                          {getBookImageUrl(item.bookId) ? (
                            <img src={getBookImageUrl(item.bookId)} alt={item.bookId.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="flex items-center justify-center h-full text-2xl">📚</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start gap-4">
                            <Link href={`/books/${item.bookId?._id}`} className="font-semibold text-foreground hover:text-primary line-clamp-2">
                              {item.bookId?.title}
                            </Link>
                            <button onClick={() => handleRemove(item._id)} className="text-muted-foreground hover:text-red-500 transition-colors">🗑️</button>
                          </div>
                          
                          <div className="mt-2 mb-3">
                            <Badge variant="secondary" className="bg-muted font-normal">
                              {item.bookId?.condition === 'like_new' ? 'Như mới' : 'Cũ'}
                            </Badge>
                          </div>
                          
                          <div className="mt-auto flex items-end justify-between">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-primary">{formatPrice(item.bookId?.sellingPrice || 0)}</span>
                              {item.bookId?.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">{formatPrice(item.bookId.originalPrice)}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center border border-border rounded-lg">
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)} className="px-3 py-1 hover:bg-muted">-</button>
                              <div className="w-10 text-center font-medium border-x border-border py-1">{item.quantity}</div>
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)} className="px-3 py-1 hover:bg-muted">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Tổng quan đơn hàng</h3>
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính ({selectedItems.length} SP)</span>
                    <span className="font-medium">{formatPrice(totalOriginalAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between items-end">
                    <span className="font-bold">Tổng tiền</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{formatPrice(totalAmount)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Chưa bao gồm phí vận chuyển</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => router.push('/checkout')}
                >
                  Mua hàng ({selectedItems.length})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
