import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
  async createReview(
    @CurrentUser('_id') buyerId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createReview(buyerId, dto);
    return {
      success: true,
      message: 'Đánh giá sản phẩm thành công',
      data: review,
    };
  }

  @Get('book/:bookId')
  async getBookReviews(@Param('bookId') bookId: string) {
    const reviews = await this.reviewsService.getBookReviews(bookId);
    return {
      success: true,
      data: reviews,
    };
  }

  @Get('book/:bookId/stats')
  async getBookRatingStats(@Param('bookId') bookId: string) {
    const stats = await this.reviewsService.getBookRatingStats(bookId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('order/:orderId/reviewed')
  @UseGuards(JwtAuthGuard)
  async getReviewedBookIdsForOrder(@Param('orderId') orderId: string) {
    const reviewedBookIds = await this.reviewsService.getReviewedBookIdsForOrder(orderId);
    return {
      success: true,
      data: reviewedBookIds,
    };
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async getSellerReviews(@CurrentUser('_id') sellerId: string) {
    const reviews = await this.reviewsService.getSellerReviews(sellerId);
    return {
      success: true,
      data: reviews,
    };
  }
}
