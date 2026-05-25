"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
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
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

// Mock Categories
const mockCategories = [
  { id: "1", name: "Văn học" },
  { id: "2", name: "Kinh tế" },
  { id: "3", name: "Tâm lý - Kỹ năng" },
  { id: "4", name: "Nuôi dạy con" },
  { id: "5", name: "Sách thiếu nhi" },
];

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

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login?redirect=/product/upload");
    }
  }, [hasHydrated, isAuthenticated, router]);

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

      const uploadRes = await api.post("/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }) as UploadImagesResponse;

      const uploadedImages = uploadRes.data.map((img) => ({
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

      // 3. Redirect to book detail
      router.push(`/books/${bookRes.data?._id || bookRes._id || ''}`);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Có lỗi xảy ra khi đăng bán sách"));
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
                    {mockCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
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
    </div>
  );
}
