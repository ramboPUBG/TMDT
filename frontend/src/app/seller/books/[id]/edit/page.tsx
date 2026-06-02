"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

const mockCategories = [
  { id: "1", name: "Văn học" },
  { id: "2", name: "Kinh tế" },
  { id: "3", name: "Tâm lý - Kỹ năng" },
  { id: "4", name: "Nuôi dạy con" },
  { id: "5", name: "Sách thiếu nhi" },
];

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const { hasHydrated, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<UploadedImage[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [condition, setCondition] = useState("like_new");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace(`/login?redirect=/seller/books/${bookId}/edit`);
    }
  }, [hasHydrated, isAuthenticated, router, bookId]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${bookId}`) as any;
        const book = res.data;
        
        setTitle(book.title);
        setCategoryId(book.categoryId?._id || book.categoryId || "");
        setAuthor(book.author);
        setPublisher(book.publisher || "");
        setOriginalPrice(book.originalPrice ? book.originalPrice.toString() : "");
        setSellingPrice(book.sellingPrice ? book.sellingPrice.toString() : "");
        setCondition(book.condition || "like_new");
        setDescription(book.description || "");
        setExistingImages(book.images || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin sách hoặc bạn không có quyền sửa cuốn sách này.");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) fetchBook();
  }, [bookId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      
      if (existingImages.length + images.length + validFiles.length > 6) {
        setError("Chỉ được lưu tối đa 6 ảnh");
        return;
      }
      
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
      setError("");
    }
  };

  const removeNewImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeExistingImage = (index: number) => {
    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (existingImages.length === 0 && images.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 hình ảnh sách");
      return;
    }

    if (!title || !categoryId || !author || !sellingPrice) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }

    setSaving(true);

    try {
      let finalImages = [...existingImages];

      // Upload new images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append("files", img));

        const uploadRes = await api.post("/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }) as UploadImagesResponse;

        const uploadedImages = uploadRes.data.map((img) => ({
          url: img.url,
          publicId: img.publicId,
        }));
        
        finalImages = [...finalImages, ...uploadedImages];
      }

      // Update Book
      const bookData = {
        title,
        categoryId,
        author,
        publisher: publisher || undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        sellingPrice: Number(sellingPrice),
        condition,
        description: description || undefined,
        images: finalImages,
      };

      await api.patch(`/books/${bookId}`, bookData);

      router.push("/seller/books");
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Có lỗi xảy ra khi cập nhật sách"));
    } finally {
      setSaving(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa sách</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* IMAGE UPLOAD SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Hình ảnh sách (*)</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Existing Images */}
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl border border-border overflow-hidden">
                <Image src={img.url} alt={`Existing ${index}`} fill className="object-cover" unoptimized />
                <button 
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* New Images */}
            {imagePreviewUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl border border-border overflow-hidden">
                <Image src={url} alt={`Preview ${index}`} fill className="object-cover" />
                <button 
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-destructive transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {(existingImages.length + images.length) < 6 && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs">Thêm ảnh</span>
                <span className="text-[10px] text-muted-foreground mt-1">({existingImages.length + images.length}/6)</span>
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
        </div>

        {/* BASIC INFO SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tên sách (*)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* PRICING & CONDITION SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
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
                  className="w-full h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Giá bán lại (*) (đ)</label>
                <input 
                  type="number" 
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
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
                className="w-full p-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" size="lg" disabled={saving} className="w-40">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

      </form>
    </div>
  );
}
