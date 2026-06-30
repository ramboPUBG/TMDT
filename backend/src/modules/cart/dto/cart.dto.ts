import { IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  bookId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
