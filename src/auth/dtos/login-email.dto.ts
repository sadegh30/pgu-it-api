import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginEmailDto {
  @ApiPropertyOptional({ description: 'ایمیل' })
  @ApiProperty({ example: 'sadegh.dev30@gmail.com' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @ApiPropertyOptional({ description: 'پسورد' })
  @IsNotEmpty({ message: 'پسورد الزامی است' })
  password: string;
}
