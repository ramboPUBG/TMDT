import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Book, BookDocument } from '../books/schemas/book.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async createOrders(
    createOrderDto: CreateOrderDto,
    buyerId: string,
  ): Promise<Order[]> {
    const { orderGroups, shippingAddress, paymentMethod } = createOrderDto;
    const createdOrders: Order[] = [];

    // Verify stock before processing
    for (const group of orderGroups) {
      for (const item of group.items) {
        const book = await this.bookModel.findById(item.bookId);
        if (!book) {
          throw new BadRequestException(`Sách không tồn tại: ${item.title}`);
        }
        if (book.quantity < item.quantity) {
          throw new BadRequestException(
            `Không đủ số lượng tồn kho cho sách: ${item.title}`,
          );
        }
      }
    }

    // Process each seller's group as a separate order
    for (const group of orderGroups) {
      // Create order
      const newOrder = new this.orderModel({
        buyerId: new Types.ObjectId(buyerId),
        sellerId: new Types.ObjectId(group.sellerId),
        items: group.items.map((item) => ({
          bookId: new Types.ObjectId(item.bookId),
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: group.totalAmount,
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // Deduct stock
      for (const item of group.items) {
        await this.bookModel.findByIdAndUpdate(item.bookId, {
          $inc: { quantity: -item.quantity },
        });
      }
    }

    return createdOrders;
  }

  async findByBuyer(buyerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ buyerId: new Types.ObjectId(buyerId) })
      .sort({ createdAt: -1 })
      .populate('sellerId', 'fullName avatar')
      .exec();
  }
}
