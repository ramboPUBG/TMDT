import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class PaymentModule {}
