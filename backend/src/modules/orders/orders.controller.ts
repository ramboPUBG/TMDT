import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@CurrentUser('_id') userId: string) {
    const orders = await this.ordersService.findByBuyer(userId);
    return { success: true, data: orders };
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
    return {
      success: true,
      message: 'Đặt hàng thành công',
      data: orders,
    };
  }
}
