export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number; // Might not be returned by backend, but let's keep it optional
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  sellerId: {
    _id: string;
    fullName: string;
  };
  categoryId: Category;
  description?: string;
  images: string[];
  originalPrice: number;
  sellingPrice: number;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  status: string;
  createdAt: string;
  updatedAt: string;
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
