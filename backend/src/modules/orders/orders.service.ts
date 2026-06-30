import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
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
        platformFee: group.totalAmount * 0.15,
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

  async findBySeller(sellerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .populate('buyerId', 'fullName avatar')
      .exec();
  }

  async findById(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('buyerId', 'fullName avatar')
      .populate('sellerId', 'fullName avatar')
      .exec();

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    if (
      order.buyerId._id.toString() !== userId &&
      order.sellerId._id.toString() !== userId
    ) {
      throw new BadRequestException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  async updateStatus(
    id: string,
    sellerId: string,
    status: OrderStatus,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({
      _id: id,
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại hoặc bạn không có quyền');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Không thể cập nhật trạng thái đơn hàng đã hủy');
    }

    order.orderStatus = status;
    return order.save();
  }

  async cancelOrder(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({
      _id: id,
      $or: [
        { buyerId: new Types.ObjectId(userId) },
        { sellerId: new Types.ObjectId(userId) },
      ],
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại hoặc bạn không có quyền');
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    const savedOrder = await order.save();

    // Restore stock
    for (const item of order.items) {
      await this.bookModel.findByIdAndUpdate(item.bookId, {
        $inc: { quantity: item.quantity },
      });
    }

    return savedOrder;
  }

  async findAllForAdmin(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate('buyerId', 'fullName email avatar')
      .populate('sellerId', 'fullName email avatar')
      .exec();
  }
}
