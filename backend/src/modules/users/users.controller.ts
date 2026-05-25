import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  UpgradeToSellerDto,
  UpdateSellerProfileDto,
  AdminQueryUsersDto,
} from './dto';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========== PROFILE ==========

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(userId, dto);
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade-to-seller')
  async upgradeToSeller(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpgradeToSellerDto,
  ) {
    const user = await this.usersService.upgradeToSeller(
      userId,
      dto.shopName,
      dto.description,
    );
    return { success: true, data: user, message: 'Đã nâng cấp lên người bán' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Patch('me/seller-profile')
  async updateSellerProfile(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateSellerProfileDto,
  ) {
    const user = await this.usersService.updateSellerProfile(userId, dto);
    return { success: true, data: user, message: 'Đã cập nhật hồ sơ bán hàng' };
  }

  // ========== SELLER PUBLIC PROFILE ==========

  @Get('sellers/:id')
  async getSellerProfile(@Param('id') id: string) {
    const seller = await this.usersService.getSellerProfile(id);
    return { success: true, data: seller };
  }

  // ========== ADDRESSES ==========

  @UseGuards(JwtAuthGuard)
  @Get('me/addresses')
  async getAddresses(@CurrentUser('_id') userId: string) {
    const addresses = await this.usersService.getAddresses(userId);
    return { success: true, data: addresses };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/addresses')
  async createAddress(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    const address = await this.usersService.createAddress(userId, dto);
    return { success: true, data: address, message: 'Đã thêm địa chỉ' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/addresses/:id')
  async updateAddress(
    @CurrentUser('_id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.usersService.updateAddress(
      userId,
      addressId,
      dto,
    );
    return { success: true, data: address, message: 'Đã cập nhật địa chỉ' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/addresses/:id')
  async deleteAddress(
    @CurrentUser('_id') userId: string,
    @Param('id') addressId: string,
  ) {
    await this.usersService.deleteAddress(userId, addressId);
    return { success: true, message: 'Đã xóa địa chỉ' };
  }

  // ========== ADMIN ==========

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query() query: AdminQueryUsersDto) {
    const result = await this.usersService.findAll(
      query.page,
      query.limit,
      query.role,
      query.status,
      query.keyword,
    );
    return { success: true, ...result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/lock')
  async lockUser(@Param('id') id: string) {
    const user = await this.usersService.lockUser(id);
    return { success: true, data: user, message: 'Đã khóa tài khoản' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/unlock')
  async unlockUser(@Param('id') id: string) {
    const user = await this.usersService.unlockUser(id);
    return { success: true, data: user, message: 'Đã mở khóa tài khoản' };
  }
}
