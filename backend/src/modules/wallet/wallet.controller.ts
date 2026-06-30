import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my')
  async getMyWallet(@CurrentUser('_id') userId: string) {
    const wallet = await this.walletService.getWallet(userId);
    return {
      success: true,
      data: wallet,
    };
  }
}
