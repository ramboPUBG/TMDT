"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface UploadImagesResponse {
  data: UploadedImage[];
}

interface CreateBookResponse {
  data?: {
    _id?: string;
  };
  _id?: string;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = response?.data?.message;
    if (Array.isArray(msg)) {
      return msg[0]; // Return the first validation error
    }
    return msg || fallback;
  }
  return fallback;
}



export default function UploadBookPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [condition, setCondition] = useState("like_new");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBookId, setCreatedBookId] = useState("");

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login?redirect=/product/upload");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories((res as any).data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục", error);
      }
    };
    fetchCategories();
  }, []);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="bg-muted/30 min-h-screen pb-16 pt-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-sm text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      
      if (images.length + validFiles.length > 6) {
        setError("Chỉ được chọn tối đa 6 ảnh");
        return;
      }
      
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
      setError("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Free memory
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 hình ảnh sách");
      return;
    }

    if (!title || !categoryId || !author || !sellingPrice) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload images to Cloudinary via backend
      const formData = new FormData();
      images.forEach(img => formData.append("files", img));

      const token = useAuthStore.getState().accessToken;
      const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/upload/images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const uploadedImages = uploadRes.data.data.map((img: any) => ({
        url: img.url,
        publicId: img.publicId,
      }));

      // 2. Create Book
      const bookData = {
        title,
        categoryId,
        author,
        publisher: publisher || undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        sellingPrice: Number(sellingPrice),
        condition,
        description: description || undefined,
        images: uploadedImages,
      };

      const bookRes = await api.post("/books", bookData) as CreateBookResponse;

      // 3. Show success modal instead of redirect
      setCreatedBookId(bookRes.data?._id || bookRes._id || '');
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, "Có lỗi xảy ra khi đăng bán sách");
      setError(errMsg);
      alert("LỖI: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen pb-16 pt-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Đăng bán sách cũ</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Hình ảnh sách (*)</h2>
            
            <div className="flex flex-wrap gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl border border-border overflow-hidden">
                  <Image src={url} alt={`Preview ${index}`} fill className="object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-colors text-xs"
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">
                      Ảnh bìa
                    </div>
                  )}
                </div>
              ))}

              {images.length < 6 && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs">Thêm ảnh</span>
                  <span className="text-[10px] text-muted-foreground mt-1">({images.length}/6)</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              multiple 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
            />
            <p className="text-xs text-muted-foreground mt-4">
              Ảnh chụp rõ nét bìa trước, bìa sau và gáy sách sẽ giúp bán nhanh hơn. (Tối đa 6 ảnh)
            </p>
          </div>

          {/* BASIC INFO SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên sách (*)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đắc Nhân Tâm"
                  className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Danh mục (*)</label>
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tác giả (*)</label>
                  <input 
                    type="text" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ví dụ: Dale Carnegie"
                    className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nhà xuất bản</label>
                <input 
                  type="text" 
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Ví dụ: NXB Tổng hợp TP.HCM"
                  className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* PRICING & CONDITION SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Giá bán & Tình trạng</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tình trạng sách (*)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "like_new", label: "Như mới (>90%)" },
                    { id: "good", label: "Rất tốt (70-90%)" },
                    { id: "fair", label: "Khá (50-70%)" },
                    { id: "worn", label: "Cũ (<50%)" },
                  ].map((cond) => (
                    <label key={cond.id} className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors text-sm font-medium ${condition === cond.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                      <input 
                        type="radio" 
                        name="condition" 
                        value={cond.id}
                        checked={condition === cond.id}
                        onChange={(e) => setCondition(e.target.value)}
                        className="hidden"
                      />
                      {cond.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Giá bìa (đ)</label>
                  <input 
                    type="number" 
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="VD: 150000"
                    className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Giá bán lại (*) (đ)</label>
                  <input 
                    type="number" 
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="VD: 50000"
                    className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mô tả thêm</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết hơn về sách (có bị ghi chú, rách trang nào không...)"
                  className="w-full p-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-2">
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button type="submit" size="lg" disabled={loading} className="w-40">
              {loading ? "Đang xử lý..." : "Đăng bán ngay"}
            </Button>
          </div>

        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Đăng bán thành công!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Sách của bạn đã được gửi lên hệ thống và đang chờ Admin duyệt.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push("/seller/dashboard")}>
                Về kênh Người bán
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Đăng thêm sách khác
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
