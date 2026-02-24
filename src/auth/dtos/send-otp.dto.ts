import { IsMobilePhone, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiPropertyOptional({ description: 'تلفن تماس' })
  @ApiProperty({ example: '09123456789' })
  @IsNotEmpty({ message: 'تلفن تماس الزامی است' })
  @IsMobilePhone('fa-IR', {}, { message: 'تلفن تماس معتبر نیست' })
  phone: string;
}
