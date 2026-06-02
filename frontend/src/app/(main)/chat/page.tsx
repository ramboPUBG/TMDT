"use client";

import { Suspense } from "react";
import { ChatView } from "@/components/chat/ChatView";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-16 text-center">Đang tải...</div>}>
      <div className="container mx-auto p-4 flex h-[calc(100vh-100px)] pt-6 gap-6">
        <ChatView />
      </div>
    </Suspense>
  );
}
