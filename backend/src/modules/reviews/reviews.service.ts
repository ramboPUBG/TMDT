import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Book, BookDocument } from '../books/schemas/book.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    const bookIdObj = new Types.ObjectId(dto.bookId);
    const userIdObj = new Types.ObjectId(userId);
    const orderIdObj = dto.orderId ? new Types.ObjectId(dto.orderId) : undefined;

    const existingReview = await this.reviewModel.findOne({
      bookId: bookIdObj,
      userId: userIdObj,
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    const book = await this.bookModel.findById(bookIdObj);
    if (!book) {
      throw new BadRequestException('Sách không tồn tại');
    }

    if (orderIdObj) {
      const order = await this.orderModel.findOne({
        _id: orderIdObj,
        buyerId: userIdObj,
      });

      if (!order) {
        throw new BadRequestException(
          'Đơn hàng không tồn tại hoặc không thuộc về bạn',
        );
      }

      if (order.orderStatus !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã giao thành công',
        );
      }

      const itemInOrder = order.items.find(
        (item) => item.bookId.toString() === dto.bookId,
      );

      if (!itemInOrder) {
        throw new BadRequestException('Sách không nằm trong đơn hàng này');
      }
    } else {
      throw new BadRequestException(
        'Vui lòng cung cấp mã đơn hàng đã giao thành công để thực hiện đánh giá',
      );
    }

    const review = new this.reviewModel({
      bookId: bookIdObj,
      userId: userIdObj,
      sellerId: book.sellerId,
      ...(orderIdObj ? { orderId: orderIdObj } : {}),
      rating: dto.rating,
      comment: dto.comment || '',
      images: dto.images || [],
    });

    return review.save();
  }

  async findByBook(bookId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName avatar')
      .exec();
  }

  async findBySeller(sellerId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName avatar')
      .populate('bookId', 'title images')
      .exec();
  }

  async canReview(
    userId: string,
    bookId: string,
    orderId?: string,
  ): Promise<{ canReview: boolean; reason?: string }> {
    const bookIdObj = new Types.ObjectId(bookId);
    const userIdObj = new Types.ObjectId(userId);

    const book = await this.bookModel.exists({ _id: bookIdObj });
    if (!book) {
      return { canReview: false, reason: 'Sách không tồn tại' };
    }

    const existingReview = await this.reviewModel.findOne({
      bookId: bookIdObj,
      userId: userIdObj,
    });

    if (existingReview) {
      return { canReview: false, reason: 'Sản phẩm đã được đánh giá' };
    }

    // Check if there is a delivered order containing this book
    const query: any = {
      buyerId: userIdObj,
      orderStatus: OrderStatus.DELIVERED,
      'items.bookId': bookIdObj,
    };
    if (orderId && Types.ObjectId.isValid(orderId)) {
      query._id = new Types.ObjectId(orderId);
    }

    const hasDeliveredOrder = await this.orderModel.exists(query);
    if (!hasDeliveredOrder) {
      return {
        canReview: false,
        reason: 'Bạn phải mua sản phẩm này và nhận hàng thành công mới có thể đánh giá',
      };
    }

    return { canReview: true };
  }

  async findByUser(userId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
