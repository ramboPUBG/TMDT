import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(activeOnly: boolean = true): Promise<CategoryDocument[]> {
    const filter: Record<string, unknown> = {};
    if (activeOnly) filter.isActive = true;

    return this.categoryModel.find(filter).sort({ order: 1, name: 1 });
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

  async getTree(): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Build tree structure
    const map = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((cat: any) => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });

    categories.forEach((cat: any) => {
      const node = map.get(cat._id.toString());
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
      { name: 'Sách giáo khoa & Tham khảo', slug: 'sach-giao-khoa', icon: '📖', order: 1 },
      { name: 'Tiểu thuyết & Văn học', slug: 'tieu-thuyet-van-hoc', icon: '📚', order: 2 },
      { name: 'Sách thiếu nhi', slug: 'sach-thieu-nhi', icon: '🧒', order: 3 },
      { name: 'Sách kỹ năng & Self-help', slug: 'sach-ky-nang', icon: '💡', order: 4 },
      { name: 'Sách kinh tế & Kinh doanh', slug: 'sach-kinh-te', icon: '📊', order: 5 },
      { name: 'Sách ngoại ngữ', slug: 'sach-ngoai-ngu', icon: '🌐', order: 6 },
      { name: 'Truyện tranh (Manga/Comic)', slug: 'truyen-tranh', icon: '🎨', order: 7 },
      { name: 'Sách khoa học & Công nghệ', slug: 'sach-khoa-hoc', icon: '🔬', order: 8 },
      { name: 'Sách lịch sử & Văn hóa', slug: 'sach-lich-su', icon: '🏛️', order: 9 },
      { name: 'Từ điển & Sách tra cứu', slug: 'tu-dien', icon: '📕', order: 10 },
    ];

    await this.categoryModel.insertMany(categories);
    console.log('✅ Seeded 10 book categories');
  }
}
