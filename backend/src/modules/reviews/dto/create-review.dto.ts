import { IsNotEmpty, IsString, IsNumber, Min, Max, IsMongoId } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Mã sách không được để trống' })
  @IsMongoId({ message: 'Mã sách không hợp lệ' })
  bookId: string;

  @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
  @IsMongoId({ message: 'Mã đơn hàng không hợp lệ' })
  orderId: string;

  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống' })
  @IsNumber({}, { message: 'Điểm đánh giá phải là số' })
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1' })
  @Max(5, { message: 'Điểm đánh giá tối đa là 5' })
  rating: number;

  @IsString({ message: 'Nội dung bình luận phải là chuỗi' })
  comment: string;
}
