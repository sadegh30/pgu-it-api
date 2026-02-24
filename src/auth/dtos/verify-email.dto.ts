// src/auth/dto/verify-email.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'توکن تأیید ایمیل' })
  @IsNotEmpty({ message: 'توکن الزامی است' })
  token: string;
}
