import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UsersQueryDto extends PartialType(PaginationDto) {
  @ApiPropertyOptional({
    description: 'جستجو',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: false, description: 'فعال یا غیر فعال بودن' })
  @IsBoolean({ message: 'isActive باید true یا false باشد' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
