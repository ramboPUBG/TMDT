"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Phone, Store, Mail, MessageCircle, CalendarDays, Star, Package } from "lucide-react";
import api from "@/services/api";
import { Book, getBookImageUrl } from "@/types";
import { Button } from "@/components/ui/Button";

interface SellerProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  sellerProfile?: {
    shopName: string;
    description: string;
    isVerified: boolean;
  };
  addresses?: Array<{
    province: string;
    district: string;
    isDefault: boolean;
  }>;
}

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Fetch seller profile
        const sellerRes = await api.get(`/users/sellers/${sellerId}`) as any;
        setSeller(sellerRes.data);

        // Fetch seller's books
        const booksRes = await api.get(`/books/search?sellerId=${sellerId}&limit=20`) as any;
        setBooks(booksRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không tìm thấy thông tin shop");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchShopData();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Lỗi</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => router.push("/")}>Về trang chủ</Button>
      </div>
    );
  }

  const defaultAddress = seller.addresses?.find(a => a.isDefault) || seller.addresses?.[0];
  const locationStr = defaultAddress 
    ? `${defaultAddress.district}, ${defaultAddress.province}`
    : "Chưa cập nhật địa chỉ";
    
  const shopName = seller.sellerProfile?.shopName || seller.fullName;
  const joinDate = new Date(seller.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-muted/30 min-h-screen pb-12">
      {/* Shop Banner / Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-6 md:w-1/3">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-muted flex-shrink-0 bg-primary/5">
                {seller.avatar ? (
                  <Image src={seller.avatar} alt={shopName} fill className="object-cover" unoptimized />
                ) : (
                  <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller._id}`} alt={shopName} fill className="object-cover" unoptimized />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {shopName}
                  {seller.sellerProfile?.isVerified && (
                    <span className="text-blue-500 text-sm bg-blue-50 p-1 rounded-full" title="Shop đã xác minh">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4" stroke="white"/></svg>
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <UserRoundIcon size={14} /> Chủ shop: {seller.fullName}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => router.push(`/chat?userId=${seller._id}`)}>
                    <MessageCircle size={16} className="mr-2" />
                    Chat ngay
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats / Details */}
            <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-l border-border pl-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={16} className="text-primary/70" />
                <span>Sản phẩm: <strong className="text-foreground">{books.length}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={16} className="text-yellow-500" />
                <span>Đánh giá: <strong className="text-foreground">4.8 / 5</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays size={16} className="text-primary/70" />
                <span>Tham gia: <strong className="text-foreground">{joinDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} className="text-primary/70" />
                <span className="truncate">Khu vực: <strong className="text-foreground">{locationStr}</strong></span>
              </div>
            </div>
          </div>
          
          {seller.sellerProfile?.description && (
            <div className="mt-6 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{seller.sellerProfile.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Shop Products */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="text-primary" /> Sách của shop
          </h2>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-border shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-medium">Shop chưa có sản phẩm nào</h3>
            <p className="text-muted-foreground mt-2">Người bán hiện chưa đăng bán cuốn sách nào hoặc đã hết hàng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <Link
                key={book._id}
                href={`/books/${book._id}`}
                className="group bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
                  {getBookImageUrl(book) ? (
                    <Image
                      src={getBookImageUrl(book)}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {book.condition === 'new' && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Sách Mới
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <div className="mt-auto pt-2">
                    <p className="text-primary font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sellingPrice)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRoundIcon(props: any) {
  return (
    <svg
      {...props}
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
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}
