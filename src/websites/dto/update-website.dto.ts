import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateWebsiteDto } from './create-website.dto';

export class UpdateWebsiteDto extends PartialType(CreateWebsiteDto) {
  @ApiProperty({
    example: false,
    description: 'وضعیت سامانه خاموش یا روشن بود',
  })
  @IsBoolean({ message: 'status باید true یا false باشد' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

  @ApiProperty({ example: false, description: 'فعال یا غیر فعال بودن' })
  @IsBoolean({ message: 'isActive باید true یا false باشد' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
