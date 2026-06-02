"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories((res as any).data || []);
    } catch (error) {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await api.post("/categories", { name, icon, description, slug: name.toLowerCase().replace(/ /g, "-") });
      toast.success("Tạo danh mục thành công");
      setName("");
      setIcon("");
      setDescription("");
      fetchCategories();
    } catch (error) {
      toast.error("Tạo thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Thêm danh mục mới</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-md" required />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
            <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-md text-center text-lg" placeholder="📚" />
          </div>
          <div className="flex-2">
            <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-10 px-3 border border-gray-300 rounded-md" />
          </div>
          <Button type="submit">Thêm</Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">Danh sách danh mục</h2>
        {loading ? (
          <div className="py-10 text-center">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cat.icon || "📚"}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{cat.slug}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
