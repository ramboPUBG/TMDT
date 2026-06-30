import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Order, OrderDocument, PaymentStatus, OrderStatus } from '../orders/schemas/order.schema';

@Injectable()
export class VnpayService {
  private readonly vnp_TmnCode = 'TJSRDT10';
  private readonly vnp_HashSecret = 'X0QZ0NP3JV9GZT1G13KP5CQC6W2VPOCG';
  private readonly vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly vnp_ReturnUrl = 'http://localhost:3000/checkout/success';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createPaymentUrl(orders: OrderDocument[], ipAddress: string): Promise<string> {
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const txnRef = orders.map((o) => o._id.toString()).join('_');

    const date = new Date();
    const createDate = this.formatDate(date);
    
    // VNPAY Parameters
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Amount: (totalAmount * 100).toString(), // VNPAY expects amount in VND multiplied by 100
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang tren SachCu`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_TxnRef: txnRef,
    };

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnpParams);

    // Build query string
    const signData = Object.entries(sortedParams)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    // Create HMAC SHA512 signature
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Build final URL
    const paymentUrl = `${this.vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;
    return paymentUrl;
  }

  async verifyCallback(queryParams: Record<string, string>): Promise<{ success: boolean; message: string; orderIds: string[] }> {
    const secureHash = queryParams.vnp_SecureHash;
    
    // Remove hash params for signature verification
    const vnpParams = { ...queryParams };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnpParams);
    
    const signData = Object.entries(sortedParams)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderIds = queryParams.vnp_TxnRef ? queryParams.vnp_TxnRef.split('_') : [];

    if (calculatedHash === secureHash) {
      const responseCode = queryParams.vnp_ResponseCode;
      
      if (responseCode === '00') {
        // Success
        await this.orderModel.updateMany(
          { _id: { $in: orderIds.map((id) => new Types.ObjectId(id)) } },
          {
            $set: {
              paymentStatus: PaymentStatus.COMPLETED,
              orderStatus: OrderStatus.PROCESSING,
            },
          },
        );
        return { success: true, message: 'Thanh toán thành công', orderIds };
      } else {
        // Failed
        await this.orderModel.updateMany(
          { _id: { $in: orderIds.map((id) => new Types.ObjectId(id)) } },
          { $set: { paymentStatus: PaymentStatus.FAILED } },
        );
        return { success: false, message: `Thanh toán thất bại (Mã lỗi: ${responseCode})`, orderIds };
      }
    } else {
      return { success: false, message: 'Chữ ký bảo mật không hợp lệ', orderIds };
    }
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}
