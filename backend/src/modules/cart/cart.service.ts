import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'items.bookId',
        populate: {
          path: 'sellerId',
          select: 'fullName _id',
        },
      });

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    // Format the response into groups by sellerId
    const groupsMap = new Map<string, any>();

    for (const item of cart.items) {
      const book = item.bookId as any; // Cast to access populated fields
      if (!book) continue;

      const seller = book.sellerId;
      if (!seller) continue;

      const sellerIdStr = seller._id.toString();

      if (!groupsMap.has(sellerIdStr)) {
        groupsMap.set(sellerIdStr, {
          sellerId: {
            _id: seller._id,
            fullName: seller.fullName,
          },
          items: [],
        });
      }

      groupsMap.get(sellerIdStr).items.push({
        _id: (item as any)._id,
        bookId: book,
        quantity: item.quantity,
      });
    }

    return {
      itemsGroups: Array.from(groupsMap.values()),
    };
  }

  async addItem(userId: string, addToCartDto: AddToCartDto) {
    const { bookId, quantity } = addToCartDto;

    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      cart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId,
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        bookId: new Types.ObjectId(bookId),
        quantity: quantity || 1,
      } as any);
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, updateDto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((item: any) => item._id.toString() === itemId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = updateDto.quantity;
    await cart.save();

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId) as any;
    await cart.save();

    return { success: true };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return { success: true };
  }
}
