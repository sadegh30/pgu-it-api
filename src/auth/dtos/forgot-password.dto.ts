import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiPropertyOptional({ description: 'ایمیل' })
  @ApiProperty({ example: 'sadegh.dev30@gmail.com' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;
}
