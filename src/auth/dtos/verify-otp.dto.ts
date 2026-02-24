import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMobilePhone, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiPropertyOptional({ description: 'تلفن تماس' })
  @ApiProperty({ example: '09123456789' })
  @IsNotEmpty({ message: 'تلفن تماس الزامی است' })
  @IsMobilePhone('fa-IR', {}, { message: 'تلفن تماس معتبر نیست' })
  phone: string;

  @ApiProperty({ example: '1000', description: 'کد تایید 4 رقمی' })
  @IsNotEmpty({ message: 'کد تایید الزامی است' })
  @Length(4, 4, { message: 'کد تایید باید 4 رقم باشد' })
  code: string;
}
