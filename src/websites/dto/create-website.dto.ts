import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWebsiteDto {
  @ApiProperty({ example: 'راهنمای راه‌اندازی سرور لینوکس' })
  @IsString({ message: 'عنوان باید متنی باشد' })
  @IsNotEmpty({ message: 'عنوان نمی‌تواند خالی باشد' })
  @MaxLength(255, { message: 'عنوان نباید بیشتر از 255 کاراکتر باشد' })
  title: string;

  @ApiPropertyOptional({ example: '/upload/websites/linux.png' })
  @IsOptional()
  @IsString({ message: 'آدرس تصویر باید متنی باشد' })
  imageUrl?: string;

  @ApiProperty({ example: 'https://it.pgu.ac.ir' })
  @IsString({ message: 'لینک باید متنی باشد' })
  @IsNotEmpty({ message: 'لینک نمی‌تواند خالی باشد' })
  @IsUrl({}, { message: 'لینک باید یک URL معتبر باشد' })
  link: string;

  @ApiPropertyOptional({ example: 'توضیحات تکمیلی درباره سایت دانشگاه...' })
  @IsOptional()
  @IsString({ message: 'توضیحات باید متنی باشد' })
  description?: string;

  @ApiPropertyOptional({ example: 'راهنمای کاربر یا نکات تکمیلی...' })
  @IsOptional()
  @IsString({ message: 'راهنما باید متنی باشد' })
  helper?: string;
}
