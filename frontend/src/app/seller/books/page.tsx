"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book as BookIcon, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Book, getBookImageUrl } from "@/types";

export default function SellerBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/books/my?limit=50") as any;
      setBooks(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cuốn sách này?")) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
      alert("Không thể xóa sách, vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý sách</h1>
        <Link href="/product/upload">
          <Button>
            <Plus size={16} className="mr-2" />
            Đăng bán sách mới
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {books.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <BookIcon size={32} />
            </div>
            <h3 className="text-lg font-medium">Bạn chưa đăng bán sách nào</h3>
            <p className="text-muted-foreground mt-2 mb-6">Hãy bắt đầu đăng bán những cuốn sách cũ của bạn nhé.</p>
            <Link href="/product/upload">
              <Button>Đăng bán ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sách</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái duyệt</th>
                  <th className="px-6 py-4 font-semibold">Tồn kho</th>
                  <th className="px-6 py-4 font-semibold">Giá bán</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {getBookImageUrl(book) ? (
                            <Image src={getBookImageUrl(book)} alt={book.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-2">{book.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {book.status === 'APPROVED' ? (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đã duyệt</span>
                      ) : book.status === 'PENDING' ? (
                        <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold">Chờ duyệt</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Từ chối</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(book as any).quantity > 0 ? (
                        <span>{(book as any).quantity}</span>
                      ) : (
                        <span className="text-red-500 font-medium">Hết hàng</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/seller/books/${book._id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Chỉnh sửa">
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" title="Xóa" onClick={() => handleDelete(book._id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
