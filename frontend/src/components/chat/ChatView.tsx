"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/Button";

export function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    socket, 
    connectSocket, 
    disconnectSocket, 
    conversations, 
    activeConversation, 
    messages, 
    fetchConversations, 
    setActiveConversation, 
    sendMessage,
    startConversation
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userIdParam = searchParams.get('userId'); // If navigating from "Chat ngay"

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/chat');
      return;
    }

    connectSocket();
    fetchConversations().then(() => {
      // If we have a userId in query, start or find conversation
      if (userIdParam) {
        startConversation(userIdParam);
      }
    });

    return () => {
      // Don't disconnect here if we want chat to stay alive across app, 
      // but if we only use socket in /chat, we can disconnect.
      // Usually better to keep it alive or let a global layout handle it.
      // For now, let's keep it connected so notifications could work globally later.
    };
  }, [isAuthenticated, router, connectSocket, fetchConversations, startConversation, userIdParam]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
    setMessageText("");
  };

  const getOtherParticipant = (conv: any) => {
    if (!user) return null;
    return conv.participants.find((p: any) => p._id !== user._id);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="w-full h-full flex gap-4 md:gap-6">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 bg-white rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-xl font-bold text-foreground">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Chưa có tin nhắn nào</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?._id || "user"}`}
                      alt={otherUser?.fullName || "User"}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{otherUser?.fullName || "Người dùng"}</h3>
                    <p className={`text-sm truncate ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-muted">
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(activeConversation)?._id || "user"}`}
                  alt={getOtherParticipant(activeConversation)?.fullName || "User"}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h2 className="font-bold text-lg">{getOtherParticipant(activeConversation)?.fullName || "Người dùng"}</h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-white border border-border rounded-bl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-white">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-muted/30 border border-border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button type="submit" className="rounded-full px-6">Gửi</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-20 h-20 mb-4 opacity-20 text-6xl">💬</div>
            <p>Chọn một người dùng để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}
