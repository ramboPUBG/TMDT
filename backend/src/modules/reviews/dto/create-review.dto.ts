import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'bookId không được để trống' })
  @IsString({ message: 'bookId phải là chuỗi' })
  bookId: string;

  @IsOptional()
  @IsString({ message: 'orderId phải là chuỗi' })
  orderId?: string;

  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống' })
  @IsNumber({}, { message: 'Điểm đánh giá phải là số' })
  @Min(1, { message: 'Đánh giá tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá tối đa là 5 sao' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Bình luận phải là chuỗi' })
  comment?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @IsString({ each: true, message: 'Đường dẫn ảnh phải là chuỗi' })
  images?: string[];
}
