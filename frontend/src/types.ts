export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number; // Might not be returned by backend, but let's keep it optional
}

export interface BookImage {
  url: string;
  publicId?: string;
  isMain?: boolean;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  sellerId: {
    _id: string;
    fullName?: string;
    name?: string;
    avatar?: string;
  };
  categoryId: Category;
  description?: string;
  images: Array<string | BookImage>;
  originalPrice: number;
  sellingPrice: number;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'worn';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function getBookImageUrl(book: Pick<Book, 'images'>, fallback = '') {
  const image = book.images?.[0];
  if (!image) return fallback;
  return typeof image === 'string' ? image : image.url || fallback;
}

export interface PaginatedBooks {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
