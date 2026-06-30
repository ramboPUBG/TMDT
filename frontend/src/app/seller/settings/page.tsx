"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, Store, Info, CheckCircle2 } from "lucide-react";

export default function SellerSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.sellerProfile) {
      setFormData({
        shopName: user.sellerProfile.shopName || "",
        description: user.sellerProfile.description || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      await api.patch("/users/me/seller-profile", formData);
      const res = await api.get("/users/me") as any;
      updateUser(res.data); // Update local store
      setMessage("Cập nhật thông tin shop thành công!");
    } catch (error: any) {
      console.error("Lỗi cập nhật shop:", error);
      setMessage(error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt shop</h1>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm p-6 md:p-8">
        <div className="mb-6 flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Info className="text-primary mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-primary">Thông tin hiển thị công khai</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Những thông tin này sẽ được hiển thị trên trang chủ cửa hàng của bạn và khách hàng có thể nhìn thấy.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="shopName" className="text-sm font-medium flex items-center gap-2">
              <Store size={16} /> Tên cửa hàng
            </label>
            <Input
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="VD: Nhà sách ABC"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả cửa hàng
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Giới thiệu về shop của bạn, thể loại sách đang bán, cam kết chất lượng..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-md bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              {message && (
                <span className={`text-sm flex items-center gap-1 ${message.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>
                  {message.includes('thành công') && <CheckCircle2 size={16} />}
                  {message}
                </span>
              )}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save size={18} className="mr-2" /> Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
