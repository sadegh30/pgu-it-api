import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'توکن تأیید ایمیل' })
  @IsNotEmpty({ message: 'توکن الزامی است' })
  token: string;

  @ApiPropertyOptional({ description: 'پسورد جدید' })
  @IsNotEmpty({ message: 'پسورد جدید الزامی است' })
  @MinLength(8, { message: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد' })
  newPassword: string;
}
