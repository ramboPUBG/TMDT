"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import { LayoutGrid } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";
import { Book, getBookImageUrl } from "@/types";

export function Header() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.itemCount);
  const { isAuthenticated, user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const q = debouncedSearchTerm.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    api
      .get(`/books/search?q=${encodeURIComponent(q)}&limit=8`)
      .then((res: { data?: Book[] }) => setSearchResults(res.data || []))
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSearchResults = (query?: string) => {
    const q = (query ?? searchTerm).trim();
    if (!q) return;
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    router.push(`/books?q=${encodeURIComponent(q)}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    goToSearchResults();
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">SachCu</span>
        </Link>

        <div className="flex-1 max-w-xl mx-8 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Tìm kiếm sách..."
              className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>

          {showDropdown && debouncedSearchTerm.trim() && (
            <div className="absolute top-full mt-2 w-full bg-white border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Đang tìm...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((book) => (
                    <Link
                      key={book._id}
                      href={`/books/${book._id}`}
                      onClick={() => {
                        setSearchTerm("");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-14 bg-muted rounded">
                        {getBookImageUrl(book) && (
                          <img
                            src={getBookImageUrl(book)}
                            alt={book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium line-clamp-1">
                          {book.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {book.author}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/books?q=${encodeURIComponent(debouncedSearchTerm.trim())}`}
                    onClick={() => {
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                    className="block px-4 py-3 text-sm text-center text-primary hover:bg-muted border-t border-border"
                  >
                    Xem tất cả kết quả
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy sách phù hợp
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/books"
            title="Tất cả sách"
            className="text-muted-foreground hover:text-primary"
          >
            <LayoutGrid size={22} />
          </Link>

          <Link href="/cart" className="text-muted-foreground hover:text-primary relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm ring-1 ring-red-500/20">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <div className="h-6 w-px bg-border" />

          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-red-500"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:text-primary">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
