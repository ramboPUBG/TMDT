import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VnpayService } from '../payment/vnpay.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vnpayService: VnpayService,
  ) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@CurrentUser('_id') userId: string) {
    const orders = await this.ordersService.findByBuyer(userId);
    return { success: true, data: orders };
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard)
  async findSellerOrders(@CurrentUser('_id') userId: string) {
    const orders = await this.ordersService.findBySeller(userId);
    return { success: true, data: orders };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllForAdmin() {
    const orders = await this.ordersService.findAllForAdmin();
    return { success: true, data: orders };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
  ) {
    const order = await this.ordersService.findById(id, userId);
    return { success: true, data: order };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('_id') userId: string,
  ) {
    const orders = await this.ordersService.createOrders(
      createOrderDto,
      userId,
    );
    if (createOrderDto.paymentMethod === 'VNPAY') {
      const paymentUrl = await this.vnpayService.createPaymentUrl(orders as any, '127.0.0.1');
      return {
        success: true,
        message: 'Đặt hàng thành công, vui lòng thực hiện thanh toán',
        paymentUrl,
        data: orders,
      };
    }
    return {
      success: true,
      message: 'Đặt hàng thành công',
      data: orders,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser('_id') userId: string,
  ) {
    const order = await this.ordersService.updateStatus(id, userId, updateStatusDto.status);
    return { success: true, message: 'Cập nhật trạng thái thành công', data: order };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
  ) {
    const order = await this.ordersService.cancelOrder(id, userId);
    return { success: true, message: 'Hủy đơn hàng thành công', data: order };
  }
}
