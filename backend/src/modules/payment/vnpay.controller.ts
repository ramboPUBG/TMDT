import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { VnpayService } from './vnpay.service';

@Controller('payments')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: any) {
    await this.vnpayService.verifyCallback(query);
    
    // Build redirect URL to frontend success page
    const frontendUrl = 'http://localhost:3000/checkout/success';
    const queryString = new URLSearchParams(query).toString();
    return res.redirect(`${frontendUrl}?${queryString}`);
  }

  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any) {
    const result = await this.vnpayService.verifyCallback(query);
    if (result.success) {
      return { RspCode: '00', Message: 'Confirm Success' };
    } else {
      return { RspCode: '97', Message: result.message || 'Invalid Checksum' };
    }
  }
}
