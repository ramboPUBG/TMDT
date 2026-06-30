import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Book, BookDocument } from '../books/schemas/book.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async createReview(buyerId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    const orderObjectId = new Types.ObjectId(dto.orderId);
    const bookObjectId = new Types.ObjectId(dto.bookId);
    const buyerObjectId = new Types.ObjectId(buyerId);

    // 1. Verify that order exists, is DELIVERED, and belongs to buyer
    const order = await this.orderModel.findOne({
      _id: orderObjectId,
      buyerId: buyerObjectId,
      orderStatus: OrderStatus.DELIVERED,
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại, chưa được giao thành công hoặc không thuộc về bạn');
    }

    // 2. Verify book belongs to order items
    const hasBook = order.items.some((item) => item.bookId.toString() === dto.bookId);
    if (!hasBook) {
      throw new BadRequestException('Sách này không nằm trong đơn hàng của bạn');
    }

    // 3. Verify duplicate review
    const existingReview = await this.reviewModel.findOne({
      orderId: orderObjectId,
      bookId: bookObjectId,
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
    }

    // 4. Create review
    const newReview = await this.reviewModel.create({
      orderId: orderObjectId,
      bookId: bookObjectId,
      buyerId: buyerObjectId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return newReview;
  }

  async getBookReviews(bookId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .populate('buyerId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getBookRatingStats(bookId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { bookId: new Types.ObjectId(bookId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length === 0) {
      return { avgRating: 0, totalReviews: 0 };
    }

    return {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    };
  }

  async getReviewedBookIdsForOrder(orderId: string): Promise<string[]> {
    const reviews = await this.reviewModel.find({ orderId: new Types.ObjectId(orderId) }).select('bookId').exec();
    return reviews.map((r) => r.bookId.toString());
  }

  async getSellerReviews(sellerId: string): Promise<any[]> {
    // Find all books by this seller
    const books = await this.bookModel.find({ sellerId: new Types.ObjectId(sellerId) }).select('_id').exec();
    const bookIds = books.map((b) => b._id);

    return this.reviewModel
      .find({ bookId: { $in: bookIds } })
      .populate('buyerId', 'fullName avatar')
      .populate('bookId', 'title images')
      .sort({ createdAt: -1 })
      .exec();
  }
}
