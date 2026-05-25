import {
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  streetAddress: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpgradeToSellerDto {
  @IsString()
  @MinLength(2)
  shopName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BankAccountDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountHolder?: string;
}

export class UpdateSellerProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  shopName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;
}

export class AdminQueryUsersDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;
}
