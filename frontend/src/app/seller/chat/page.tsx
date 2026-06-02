"use client";

import { Suspense } from "react";
import { ChatView } from "@/components/chat/ChatView";

export default function SellerChatPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Đang tải...</div>}>
      <div className="h-[calc(100vh-80px)] w-full">
        <ChatView />
      </div>
    </Suspense>
  );
}
