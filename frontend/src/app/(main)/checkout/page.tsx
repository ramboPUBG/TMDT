"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";

interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CheckoutSeller {
  sellerId: string;
  sellerName: string;
  items: CheckoutItem[];
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutSeller[]>([]);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (user) {
      setFullName(user.fullName || "");
    }
    const session = localStorage.getItem("checkout_session");
    if (session) {
      setCheckoutData(JSON.parse(session));
    } else {
      router.push("/cart");
    }
  }, [user, router]);

  if (!mounted || !isAuthenticated) return null;

  let totalItems = 0;
  let totalPrice = 0;
  checkoutData.forEach(seller => {
    seller.items.forEach((item) => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    });
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderGroups = checkoutData.map(seller => {
        let sellerTotal = 0;
        const items = seller.items.map((item) => {
          sellerTotal += item.price * item.quantity;
          return {
            bookId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
          };
        });
        return {
          sellerId: seller.sellerId,
          items,
          totalAmount: sellerTotal
        };
      });

      const payload = {
        orderGroups,
        shippingAddress: { fullName, phone, address },
        paymentMethod
      };

      await api.post("/orders", payload);
      
      // Clean up session and go to success
      localStorage.removeItem("checkout_session");
      router.push(`/checkout/success?method=${paymentMethod}&amount=${totalPrice}`);

    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Có lỗi xảy ra khi đặt hàng."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-24 pt-6">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Thanh toán</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Shipping Info & Payment */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Address */}
            <div className="bg-white p-6 rounded-2xl border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Địa chỉ giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên người nhận</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-10 px-3 border border-border rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 border border-border rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ chi tiết</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border border-border rounded-md min-h-[80px]" required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Phương thức thanh toán</h2>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-bold">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi giao hàng.</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="payment" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-bold">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-muted-foreground">Chuyển khoản qua số tài khoản của Sàn. Đơn hàng sẽ được xử lý ngay sau khi nhận được tiền.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-4/12">
            <div className="bg-white p-6 rounded-2xl border border-border sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">Thông tin đơn hàng</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {checkoutData.map((seller, idx) => (
                  <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="text-sm font-bold mb-2 text-primary">{seller.sellerName}</div>
                    <div className="flex flex-col gap-3">
                      {seller.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-3">
                          <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-sm">
                            <div className="line-clamp-2 leading-tight mb-1">{item.title}</div>
                            <div className="text-muted-foreground text-xs">SL: {item.quantity}</div>
                            <div className="font-medium text-foreground">{formatPrice(item.price)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính ({totalItems} sp)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6 pt-4 border-t border-border">
                <span className="font-bold text-foreground">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
