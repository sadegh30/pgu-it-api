// src/auth/dto/change-password.dto.ts
import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: 'پسورد فعلی' })
  @IsNotEmpty({ message: 'پسورد فعلی الزامی است' })
  @MinLength(8, { message: 'رمز عبور فعلی باید حداقل ۸ کاراکتر باشد' })
  currentPassword: string;

  @ApiPropertyOptional({ description: 'پسورد جدید' })
  @IsNotEmpty({ message: 'پسورد جدید الزامی است' })
  @MinLength(8, { message: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد' })
  newPassword: string;
}
