"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Suspense, useState } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method") || "COD";
  const amount = Number(searchParams.get("amount") || 0);
  const [transferCode] = useState(() => Math.floor(1000 + Math.random() * 9000));

  return (
    <div className="bg-muted/30 min-h-screen pb-24 pt-12">
      <div className="container mx-auto px-4 flex flex-col items-center">
        
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-border max-w-2xl w-full text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Cảm ơn bạn đã mua sắm tại SachCu. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
          </p>

          {method === "BANK_TRANSFER" && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-left mb-8">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                💳 Hướng dẫn chuyển khoản
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Vui lòng chuyển khoản số tiền <strong className="text-foreground text-base">{formatPrice(amount)}</strong> vào tài khoản dưới đây để chúng tôi xử lý đơn hàng:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ngân hàng</div>
                  <div className="font-bold text-foreground">Vietcombank (VCB)</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Số tài khoản</div>
                  <div className="font-bold text-foreground font-mono text-lg text-primary">0123 456 789</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tên tài khoản</div>
                  <div className="font-bold text-foreground">CONG TY TNHH SACHCU</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Nội dung chuyển khoản</div>
                  <div className="font-bold text-foreground font-mono bg-muted px-2 py-1 rounded inline-block text-sm">
                    SACHCU {transferCode}
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === "COD" && (
            <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-sm text-muted-foreground">
              Bạn đã chọn hình thức <strong>Thanh toán khi nhận hàng (COD)</strong>. Vui lòng chuẩn bị sẵn số tiền <strong className="text-foreground">{formatPrice(amount)}</strong> khi nhân viên giao hàng liên hệ.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Tiếp tục mua sắm
              </Button>
            </Link>
            <Link href="/profile/orders">
              <Button size="lg" className="w-full sm:w-auto">
                Xem đơn hàng của tôi
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
