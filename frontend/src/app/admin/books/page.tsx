"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Image from "next/image";

interface Book {
  _id: string;
  title: string;
  sellerId: { fullName: string; email: string };
  categoryId: { name: string };
  sellingPrice: number;
  status: string;
  images: { url: string; isMain: boolean }[];
  createdAt: string;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books/admin?status=${statusFilter}&limit=50`);
      setBooks((res as any).data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/books/${id}/status`, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      fetchBooks();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Kiểm duyệt Sách</h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "pending" ? "Chờ duyệt" : s === "approved" ? "Đã duyệt" : "Từ chối"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      ) : books.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Không có sách nào ở trạng thái này.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-gray-600 font-medium">Sản phẩm</th>
                <th className="py-3 px-4 text-gray-600 font-medium">Người bán</th>
                <th className="py-3 px-4 text-gray-600 font-medium">Giá bán</th>
                <th className="py-3 px-4 text-gray-600 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-4">
                    <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                      {book.images?.[0]?.url && (
                        <Image src={book.images[0].url} alt={book.title} fill className="object-cover" unoptimized />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-2 max-w-xs">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.categoryId?.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{book.sellerId?.fullName}</p>
                    <p className="text-xs text-gray-500">{book.sellerId?.email}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-primary">{formatPrice(book.sellingPrice)}</td>
                  <td className="py-4 px-4 text-right">
                    {statusFilter === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => updateStatus(book._id, "approved")} size="sm">Duyệt</Button>
                        <Button onClick={() => updateStatus(book._id, "rejected")} variant="outline" size="sm">Từ chối</Button>
                      </div>
                    )}
                    {statusFilter === "approved" && (
                      <Button onClick={() => updateStatus(book._id, "hidden")} variant="outline" size="sm">Ẩn sách</Button>
                    )}
                    {statusFilter === "rejected" && (
                      <span className="text-red-500 text-sm font-medium">Đã từ chối</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
