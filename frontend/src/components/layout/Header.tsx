"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.itemCount);
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">SachCu</span>
        </Link>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm sách..." 
              className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-muted-foreground hover:text-primary relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm ring-1 ring-red-500/20">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <div className="h-6 w-px bg-border"></div>
          
          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden md:block max-w-[120px] truncate" title={user?.fullName || ''}>
                {user?.fullName || 'Tài khoản'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => {
                logout();
                window.location.href = '/login';
              }} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1">
                Đăng xuất
              </Button>
            </div>
          ) : mounted ? (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          ) : (
            <div className="w-[180px] h-10 flex items-center gap-4">
               <div className="w-20 h-10 bg-muted/50 rounded-md animate-pulse"></div>
               <div className="w-20 h-10 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
