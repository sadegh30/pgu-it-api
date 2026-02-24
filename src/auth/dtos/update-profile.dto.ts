import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'نام کوچک' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @ApiPropertyOptional({ description: 'آدرس تصویر پروفایل' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'جنسیت' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'کد ملی' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'کد ملی باید ۱۰ رقم باشد' })
  nationalCode?: string;

  @ApiPropertyOptional({ description: 'تاریخ تولد (ISO format)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'فرمت تاریخ تولد باید YYYY-MM-DD باشد',
  })
  birthDate?: string;

  @ApiPropertyOptional({ description: 'بیوگرافی' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;
}
