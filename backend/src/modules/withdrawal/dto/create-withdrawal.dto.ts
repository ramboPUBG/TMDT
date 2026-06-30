import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(50000, { message: 'Số tiền rút tối thiểu là 50,000đ' })
  amount: number;

  @IsNotEmpty({ message: 'Tên ngân hàng không được để trống' })
  @IsString({ message: 'Tên ngân hàng phải là chuỗi' })
  bankName: string;

  @IsNotEmpty({ message: 'Số tài khoản không được để trống' })
  @IsString({ message: 'Số tài khoản phải là chuỗi' })
  accountNumber: string;

  @IsNotEmpty({ message: 'Tên chủ tài khoản không được để trống' })
  @IsString({ message: 'Tên chủ tài khoản phải là chuỗi' })
  accountHolder: string;
}
