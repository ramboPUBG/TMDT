import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userModel.countDocuments();
    const successfulOrdersCount = await this.orderModel.countDocuments({ orderStatus: OrderStatus.DELIVERED });
    
    // We can also calculate total GMV for pending/processing just to show something if needed,
    // but typically it's DELIVERED. Since this is for demo, we'll calculate all non-cancelled GMV.
    const revenueResult = await this.orderModel.aggregate([
      { $match: { orderStatus: { $ne: OrderStatus.CANCELLED } } },
      { 
        $group: { 
          _id: null, 
          totalGMV: { $sum: '$totalAmount' }, 
          totalCommission: { $sum: '$platformFee' } 
        } 
      }
    ]);
    
    const totalGMV = revenueResult.length > 0 ? revenueResult[0].totalGMV : 0;
    const totalCommission = revenueResult.length > 0 ? revenueResult[0].totalCommission : 0;
    
    // Recent orders
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyerId', 'fullName email avatar')
      .populate('sellerId', 'fullName email')
      .exec();

    // Mock chart data for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartData.push({
        name: d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' }),
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
        commission: 0,
      });
    }
    // Set realistic commission based on 15%
    chartData.forEach(item => {
      item.commission = item.revenue * 0.15;
    });

    return {
      totalUsers,
      successfulOrdersCount,
      totalGMV,
      totalCommission,
      recentOrders,
      chartData
    };
  }
}
