import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'آدرس فایل' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_\\/-]+$/, {
    message: 'مسیر فقط می‌تونه حروف، عدد و / داشته باشه',
  })
  path: string;
}
