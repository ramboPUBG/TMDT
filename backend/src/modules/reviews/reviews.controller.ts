import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('_id') userId: string,
  ) {
    const review = await this.reviewsService.create(userId, createReviewDto);
    return {
      success: true,
      message: 'Gửi đánh giá thành công',
      data: review,
    };
  }

  @Get('book/:bookId')
  async getReviewsForBook(@Param('bookId') bookId: string) {
    const reviews = await this.reviewsService.findByBook(bookId);
    return {
      success: true,
      data: reviews,
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@CurrentUser('_id') userId: string) {
    const reviews = await this.reviewsService.findByUser(userId);
    return {
      success: true,
      data: reviews,
    };
  }

  @Get('seller/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async getMySellerReviews(@CurrentUser('_id') sellerId: string) {
    const reviews = await this.reviewsService.findBySeller(sellerId);
    return {
      success: true,
      data: reviews,
    };
  }

  @Get('seller/:sellerId')
  async getReviewsForSeller(@Param('sellerId') sellerId: string) {
    const reviews = await this.reviewsService.findBySeller(sellerId);
    return {
      success: true,
      data: reviews,
    };
  }

  @Get('can-review')
  @UseGuards(JwtAuthGuard)
  async checkCanReview(
    @CurrentUser('_id') userId: string,
    @Query('bookId') bookId: string,
    @Query('orderId') orderId: string,
  ) {
    const result = await this.reviewsService.canReview(userId, bookId, orderId);
    return {
      success: true,
      data: result,
    };
  }
}
