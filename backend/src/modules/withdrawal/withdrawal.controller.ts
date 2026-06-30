import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { WithdrawalStatus } from './schemas/withdrawal.schema';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  async createRequest(
    @CurrentUser('_id') sellerId: string,
    @Body() dto: CreateWithdrawalDto,
  ) {
    const request = await this.withdrawalService.createRequest(sellerId, dto);
    return {
      success: true,
      message: 'Gửi yêu cầu rút tiền thành công',
      data: request,
    };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  async getMyRequests(@CurrentUser('_id') sellerId: string) {
    const requests = await this.withdrawalService.getMyRequests(sellerId);
    return {
      success: true,
      data: requests,
    };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllRequestsForAdmin() {
    const requests = await this.withdrawalService.getAllRequestsForAdmin();
    return {
      success: true,
      data: requests,
    };
  }

  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateStatusByAdmin(
    @Param('id') id: string,
    @Body('status') status: WithdrawalStatus,
  ) {
    const request = await this.withdrawalService.updateStatusByAdmin(id, status);
    return {
      success: true,
      message: 'Cập nhật trạng thái yêu cầu rút tiền thành công',
      data: request,
    };
  }
}
