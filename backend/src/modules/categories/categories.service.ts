import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Book, BookDocument } from '../books/schemas/book.schema';

type CategoryLean = Omit<Category, 'createdAt' | 'updatedAt'> & {
  _id: Types.ObjectId;
  parentId: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type CategoryWithCount = CategoryLean & {
  count: number;
};

type CategoryTreeNode = CategoryWithCount & {
  children: CategoryTreeNode[];
};

type CategoryCount = {
  _id: Types.ObjectId;
  count: number;
};

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async findAll(activeOnly: boolean = true): Promise<CategoryWithCount[]> {
    const filter: Record<string, unknown> = {};
    if (activeOnly) filter.isActive = true;

    const categories = await this.categoryModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean<CategoryLean[]>();

    const categoryIds = categories.map((cat) => cat._id);
    const counts = await this.bookModel.aggregate<CategoryCount>([
      {
        $match: {
          categoryId: { $in: categoryIds },
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      countMap.set(c._id.toString(), c.count);
    });

    return categories.map((cat) => ({
      ...cat,
      count: countMap.get(cat._id.toString()) || 0,
    }));
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug, isActive: true });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return category;
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return category;
  }

  async create(data: Partial<Category>): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ slug: data.slug });
    if (existing) {
      throw new ConflictException('Slug danh mục đã tồn tại');
    }
    return new this.categoryModel(data).save();
  }

  async update(id: string, data: Partial<Category>): Promise<CategoryDocument> {
    const category = await this.categoryModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return category;
  }

  async delete(id: string): Promise<void> {
    // Check if has children
    const children = await this.categoryModel.countDocuments({ parentId: id });
    if (children > 0) {
      throw new ConflictException('Không thể xóa danh mục có danh mục con');
    }
    await this.categoryModel.findByIdAndDelete(id);
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean<CategoryLean[]>();

    const categoryIds = categories.map((cat) => cat._id);
    const counts = await this.bookModel.aggregate<CategoryCount>([
      {
        $match: {
          categoryId: { $in: categoryIds },
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      countMap.set(c._id.toString(), c.count);
    });

    // Build tree structure
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    categories.forEach((cat) => {
      map.set(cat._id.toString(), {
        ...cat,
        count: countMap.get(cat._id.toString()) || 0,
        children: [],
      });
    });

    categories.forEach((cat) => {
      const node = map.get(cat._id.toString());
      if (!node) return;
      if (cat.parentId) {
        const parent = map.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Seed default book categories
  async seed(): Promise<void> {
    const count = await this.categoryModel.countDocuments();
    if (count > 0) return;

    const categories = [
      {
        name: 'Sách giáo khoa & Tham khảo',
        slug: 'sach-giao-khoa',
        icon: '📖',
        order: 1,
      },
      {
        name: 'Tiểu thuyết & Văn học',
        slug: 'tieu-thuyet-van-hoc',
        icon: '📚',
        order: 2,
      },
      { name: 'Sách thiếu nhi', slug: 'sach-thieu-nhi', icon: '🧒', order: 3 },
      {
        name: 'Sách kỹ năng & Self-help',
        slug: 'sach-ky-nang',
        icon: '💡',
        order: 4,
      },
      {
        name: 'Sách kinh tế & Kinh doanh',
        slug: 'sach-kinh-te',
        icon: '📊',
        order: 5,
      },
      { name: 'Sách ngoại ngữ', slug: 'sach-ngoai-ngu', icon: '🌐', order: 6 },
      {
        name: 'Truyện tranh (Manga/Comic)',
        slug: 'truyen-tranh',
        icon: '🎨',
        order: 7,
      },
      {
        name: 'Sách khoa học & Công nghệ',
        slug: 'sach-khoa-hoc',
        icon: '🔬',
        order: 8,
      },
      {
        name: 'Sách lịch sử & Văn hóa',
        slug: 'sach-lich-su',
        icon: '🏛️',
        order: 9,
      },
      {
        name: 'Từ điển & Sách tra cứu',
        slug: 'tu-dien',
        icon: '📕',
        order: 10,
      },
    ];

    await this.categoryModel.insertMany(categories);
    console.log('✅ Seeded 10 book categories');
  }
}
