"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

// Mock Data grouped by seller
const initialCartData = [
  {
    sellerId: "s1",
    sellerName: "Tiệm sách cũ Cô Ba",
    items: [
      {
        id: "1",
        title: "📚 ĐÔI CÁNH - Tuyển tập truyện ngắn Nga đương đại Moscow Edition hiếm sưu tầm bìa cứng",
        price: 550000,
        originalPrice: 700000,
        condition: "like_new",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        quantity: 1,
        selected: true
      }
    ]
  },
  {
    sellerId: "s2",
    sellerName: "Mọt Sách SG",
    items: [
      {
        id: "2",
        title: "Sapiens: Lược sử loài người",
        price: 120000,
        originalPrice: 195000,
        condition: "good",
        imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
        quantity: 1,
        selected: true
      },
      {
        id: "3",
        title: "Đắc Nhân Tâm",
        price: 35000,
        originalPrice: 86000,
        condition: "fair",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
        quantity: 1,
        selected: false
      }
    ]
  }
];

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const removeItemFromStore = useCartStore(state => state.removeItem);
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('local_cart_data');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart(initialCartData);
      localStorage.setItem('local_cart_data', JSON.stringify(initialCartData));
    }
  }, []);

  // Save cart to local storage whenever it changes to support F5
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('local_cart_data', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  // Toggle selection for a single item
  const toggleItem = (sellerId: string, itemId: string) => {
    setCart(cart.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map((item: any) => 
            item.id === itemId ? { ...item, selected: !item.selected } : item
          )
        };
      }
      return seller;
    }));
  };

  // Toggle selection for all items in a seller group
  const toggleSellerGroup = (sellerId: string) => {
    setCart(cart.map(seller => {
      if (seller.sellerId === sellerId) {
        const allSelected = seller.items.every((i: any) => i.selected);
        return {
          ...seller,
          items: seller.items.map((item: any) => ({ ...item, selected: !allSelected }))
        };
      }
      return seller;
    }));
  };

  // Toggle all items in the cart
  const toggleAll = () => {
    const allSelected = cart.every(s => s.items.every((i: any) => i.selected));
    setCart(cart.map(seller => ({
      ...seller,
      items: seller.items.map((item: any) => ({ ...item, selected: !allSelected }))
    })));
  };

  // Update item quantity
  const updateQuantity = (sellerId: string, itemId: string, change: number) => {
    setCart(cart.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map((item: any) => {
            if (item.id === itemId) {
              const newQuantity = Math.max(1, item.quantity + change);
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        };
      }
      return seller;
    }));
  };

  // Remove item from cart
  const removeItem = (sellerId: string, itemId: string) => {
    setCart(cart.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.filter((item: any) => item.id !== itemId)
        };
      }
      return seller;
    }).filter(seller => seller.items.length > 0)); // Loại bỏ luôn người bán nếu không còn sách nào

    // Decrease the header cart icon
    removeItemFromStore();
  };

  // Calculate totals
  let totalItems = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  const isAllSelected = cart.length > 0 && cart.every(s => s.items.every((i: any) => i.selected));

  cart.forEach(seller => {
    seller.items.forEach((item: any) => {
      if (item.selected) {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
        if (item.originalPrice) {
          totalDiscount += (item.originalPrice - item.price) * item.quantity;
        }
      }
    });
  });

  const handleCheckout = () => {
    const selectedCart = cart.map(seller => ({
      ...seller,
      items: seller.items.filter((item: any) => item.selected)
    })).filter(seller => seller.items.length > 0);

    localStorage.setItem('checkout_session', JSON.stringify(selectedCart));
    router.push('/checkout');
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-24 md:pb-16 pt-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">Giỏ hàng của bạn</h1>

        {!mounted ? (
          <div className="text-center p-12 text-muted-foreground">Đang tải...</div>
        ) : !isAuthenticated ? (
          <div className="bg-white p-12 rounded-2xl border border-border text-center flex flex-col items-center">
            <div className="w-32 h-32 mb-6 bg-muted rounded-full flex items-center justify-center text-5xl">🔒</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Vui lòng đăng nhập</h2>
            <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để xem giỏ hàng và tiến hành thanh toán.</p>
            <Link href="/login?redirect=/cart">
              <Button size="lg">Đăng nhập ngay</Button>
            </Link>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-border text-center flex flex-col items-center">
            <div className="w-32 h-32 mb-6 bg-muted rounded-full flex items-center justify-center text-5xl">🛒</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Bạn chưa chọn mua cuốn sách nào. Hãy khám phá ngay nhé!</p>
            <Link href="/books">
              <Button size="lg">Khám phá sách ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT: Cart Items list */}
            <div className="w-full lg:w-8/12 flex flex-col gap-4">
              
              {/* Select All Checkbox - Header */}
              <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="w-5 h-5 rounded border-muted text-primary focus:ring-primary cursor-pointer accent-primary" 
                />
                <span className="font-medium text-foreground">Chọn tất cả ({cart.reduce((acc, curr) => acc + curr.items.length, 0)} sản phẩm)</span>
              </div>

              {/* List of Sellers & Items */}
              {cart.map((seller) => {
                const isSellerAllSelected = seller.items.every((i: any) => i.selected);

                return (
                  <div key={seller.sellerId} className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Seller Header */}
                    <div className="bg-muted/30 p-4 border-b border-border flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={isSellerAllSelected}
                        onChange={() => toggleSellerGroup(seller.sellerId)}
                        className="w-5 h-5 rounded border-muted text-primary focus:ring-primary cursor-pointer accent-primary" 
                      />
                      <span className="text-sm">Bán bởi:</span>
                      <span className="font-bold text-foreground">{seller.sellerName}</span>
                      <Link href={`/shop/${seller.sellerId}`} className="text-primary text-xs hover:underline ml-2">
                        Xem shop &gt;
                      </Link>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col divide-y divide-border">
                      {seller.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex gap-4">
                          <div className="pt-2">
                            <input 
                              type="checkbox" 
                              checked={item.selected}
                              onChange={() => toggleItem(seller.sellerId, item.id)}
                              className="w-5 h-5 rounded border-muted text-primary focus:ring-primary cursor-pointer accent-primary" 
                            />
                          </div>
                          
                          <Link href={`/books/${item.id}`} className="w-20 h-28 md:w-24 md:h-32 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </Link>
                          
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-4">
                              <Link href={`/books/${item.id}`} className="font-medium text-foreground hover:text-primary line-clamp-2">
                                {item.title}
                              </Link>
                              <button 
                                className="text-muted-foreground hover:text-destructive p-1" 
                                title="Xóa"
                                onClick={() => removeItem(seller.sellerId, item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                            
                            <div className="mt-1 mb-2">
                              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-xs">
                                {item.condition === 'like_new' ? 'Như mới' : 
                                item.condition === 'good' ? 'Rất tốt' : 
                                item.condition === 'fair' ? 'Khá' : 'Cũ'}
                              </Badge>
                            </div>

                            <div className="mt-auto flex justify-between items-end">
                              <div>
                                <div className="font-bold text-primary text-lg">{formatPrice(item.price)}</div>
                                {item.originalPrice && (
                                  <div className="text-sm text-muted-foreground line-through">
                                    {formatPrice(item.originalPrice)}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground mr-1 hidden sm:inline">Số lượng:</span>
                                <div className="flex items-center border border-border rounded-md overflow-hidden">
                                  <button 
                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground bg-muted/30 hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                                    onClick={() => updateQuantity(seller.sellerId, item.id, -1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <div className="w-8 h-7 flex items-center justify-center text-sm font-medium border-l border-r border-border bg-white">
                                    {item.quantity}
                                  </div>
                                  <button 
                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground bg-muted/30 hover:bg-muted hover:text-foreground transition-colors"
                                    onClick={() => updateQuantity(seller.sellerId, item.id, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="w-full lg:w-4/12">
              <div className="bg-white p-6 rounded-2xl border border-border sticky top-24">
                <h2 className="text-lg font-bold text-foreground mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-border text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính ({totalItems} sản phẩm)</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-secondary">
                      <span>Bạn đã tiết kiệm</span>
                      <span className="font-medium">- {formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-xs text-muted-foreground italic">Tính ở bước thanh toán</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <span className="font-bold text-foreground">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                    <p className="text-xs text-muted-foreground mt-1">Đã bao gồm VAT (nếu có)</p>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full shadow-lg shadow-primary/20"
                  disabled={totalItems === 0}
                  onClick={handleCheckout}
                >
                  Mua hàng ({totalItems})
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>🛡️</span> Thanh toán an toàn, hoàn tiền 100% nếu lỗi
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
