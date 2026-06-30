import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser('_id') userId: string) {
    const cart = await this.cartService.getCart(userId);
    return cart; // Returns { itemsGroups: [...] }
  }

  @Post('items')
  async addItem(
    @CurrentUser('_id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Patch('items/:itemId')
  async updateItemQuantity(
    @CurrentUser('_id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  async removeItem(
    @CurrentUser('_id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  async clearCart(@CurrentUser('_id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
