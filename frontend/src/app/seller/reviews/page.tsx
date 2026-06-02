"use client";

import { MessageSquareOff } from "lucide-react";

export default function SellerReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Đánh giá của khách hàng</h1>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
          <MessageSquareOff size={32} />
        </div>
        <h3 className="text-xl font-medium mb-2">Tính năng đang phát triển</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tính năng đánh giá người bán và sản phẩm đang được chúng tôi hoàn thiện và sẽ sớm ra mắt trong thời gian tới. 
          Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
}
