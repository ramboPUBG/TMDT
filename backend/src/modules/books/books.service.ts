import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import {
  Book,
  BookCondition,
  BookDocument,
  BookStatus,
} from './schemas/book.schema';
import { BookFilterDto } from './dto/book-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

type RegexFilter = {
  $regex: string;
  $options: 'i';
};

type PriceFilter = {
  $gte?: number;
  $lte?: number;
};

type BookQuery = {
  status: BookStatus;
  $or?: Array<
    | { title: RegExp }
    | { author: RegExp }
    | { description: RegExp }
    | { publisher: RegExp }
    | { tags: RegExp }
  >;
  categoryId?: Types.ObjectId;
  sellerId?: Types.ObjectId;
  sellingPrice?: PriceFilter;
  condition?: BookCondition;
  author?: RegexFilter;
  publisher?: RegexFilter;
};

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async findAll(filterDto: BookFilterDto): Promise<PaginatedResult<Book>> {
    const {
      page = 1,
      limit = 20,
      q,
      categoryId,
      category,
      minPrice,
      maxPrice,
      condition,
      author,
      publisher,
      sort,
      sellerId,
    } = filterDto;

    const query: BookQuery = { status: BookStatus.APPROVED };

    if (q?.trim()) {
      const keyword = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { title: regex },
        { author: regex },
        { description: regex },
        { publisher: regex },
        { tags: regex },
      ];
    }

    const catId = categoryId || category;
    if (catId) {
      if (Types.ObjectId.isValid(catId)) {
        query.categoryId = new Types.ObjectId(catId);
      } else {
        query.categoryId = new Types.ObjectId();
      }
    }

    if (sellerId) {
      if (Types.ObjectId.isValid(sellerId)) {
        query.sellerId = new Types.ObjectId(sellerId);
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.sellingPrice = {};
      if (minPrice !== undefined) query.sellingPrice.$gte = minPrice;
      if (maxPrice !== undefined) query.sellingPrice.$lte = maxPrice;
    }

    if (condition) {
      query.condition = condition;
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (publisher) {
      query.publisher = { $regex: publisher, $options: 'i' };
    }

    let sortOptions: Record<string, SortOrder> = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { sellingPrice: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { sellingPrice: -1 };
    } else if (sort === 'popular') {
      sortOptions = { viewCount: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const mongoQuery: Record<string, unknown> = query;
    const total = await this.bookModel.countDocuments(mongoQuery);
    const skip = (page - 1) * limit;

    const items = await this.bookModel
      .find(mongoQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'fullName avatar sellerProfile')
      .populate('categoryId', 'name slug')
      .exec();

    return new PaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel
      .findById(id)
      .populate('sellerId', 'fullName avatar sellerProfile')
      .populate('categoryId', 'name slug')
      .exec();

    if (!book || book.status !== BookStatus.APPROVED) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async create(createBookDto: CreateBookDto, sellerId: string): Promise<Book> {
    const slug =
      createBookDto.title
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]+/gi, '-') // support Vietnamese characters partially or rely on simple dash
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now();

    const createdBook = new this.bookModel({
      ...createBookDto,
      sellerId,
      slug,
      status: BookStatus.PENDING, // Admin must approve
    });

    return createdBook.save();
  }

  async findMyBooks(sellerId: string, filterDto: BookFilterDto): Promise<PaginatedResult<Book>> {
    const { page = 1, limit = 20, q } = filterDto;
    const query: any = { sellerId: new Types.ObjectId(sellerId) };

    if (q?.trim()) {
      const keyword = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ title: regex }, { author: regex }];
    }

    const total = await this.bookModel.countDocuments(query);
    const skip = (page - 1) * limit;

    const items = await this.bookModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name slug')
      .exec();

    return new PaginatedResult(items, total, page, limit);
  }

  async update(id: string, updateBookDto: UpdateBookDto, sellerId: string): Promise<Book> {
    const book = await this.bookModel.findOne({ _id: id, sellerId });
    if (!book) {
      throw new NotFoundException('Book not found or you do not have permission');
    }

    // if (updateBookDto.title && updateBookDto.title !== book.title) {
    //   updateBookDto['slug'] = ... // maybe update slug? It's fine not to for now
    // }

    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();

    if (!updatedBook) {
      throw new NotFoundException('Book not found');
    }
    return updatedBook;
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const book = await this.bookModel.findOne({ _id: id, sellerId });
    if (!book) {
      throw new NotFoundException('Book not found or you do not have permission');
    }
    await this.bookModel.findByIdAndDelete(id).exec();
  }

  async findAllForAdmin(filterDto: BookFilterDto): Promise<PaginatedResult<Book>> {
    const { page = 1, limit = 20, q, categoryId, sort } = filterDto;
    const query: any = {};
    if (filterDto.status) {
      query.status = filterDto.status;
    }
    if (q?.trim()) {
      const keyword = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(keyword, 'i');
      query.$or = [{ title: regex }, { author: regex }, { tags: regex }];
    }
    if (categoryId) {
      query.categoryId = new Types.ObjectId(categoryId);
    }
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    const total = await this.bookModel.countDocuments(query);
    const skip = (page - 1) * limit;
    const items = await this.bookModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'fullName email')
      .populate('categoryId', 'name slug')
      .exec();
    return new PaginatedResult(items, total, page, limit);
  }

  async updateStatus(id: string, status: BookStatus): Promise<Book> {
    const book = await this.bookModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }
}
