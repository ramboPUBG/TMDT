"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Book, ShoppingBag, Star, Settings, Menu, X, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/seller/dashboard');
      } else if (user?.role !== 'seller' && user?.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Handle route change on mobile to close menu
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!hasHydrated || !isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
    return <div className="h-screen w-full flex items-center justify-center text-muted-foreground">Đang kiểm tra quyền truy cập...</div>;
  }

  const navItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Tin nhắn", href: "/seller/chat", icon: MessageCircle },
    { name: "Quản lý sách", href: "/seller/books", icon: Book },
    { name: "Đơn hàng", href: "/seller/orders", icon: ShoppingBag },
    { name: "Đánh giá", href: "/seller/reviews", icon: Star },
    { name: "Cài đặt shop", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-border fixed h-full z-10 shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-center">
          <Link href="/" className="text-2xl font-bold text-primary">SachCu Seller</Link>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {user?.fullName?.charAt(0) || "S"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{user?.sellerProfile?.shopName || user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <aside 
            className="w-64 flex-col bg-white h-full z-50 flex shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-primary">SachCu Seller</Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - Mobile */}
        <header className="md:hidden bg-white h-16 border-b border-border flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
          <Link href="/seller/dashboard" className="text-xl font-bold text-primary">Seller</Link>
          <button 
            className="p-2 text-muted-foreground hover:bg-muted rounded-md"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
