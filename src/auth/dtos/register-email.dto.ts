import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterEmailDto {
  @ApiPropertyOptional({ description: 'نام' })
  @ApiProperty({ example: 'صادق' })
  @IsNotEmpty({ message: 'نام الزامی است' })
  firstName: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی' })
  @ApiProperty({ example: 'همت' })
  @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
  lastName: string;

  @ApiPropertyOptional({ description: 'ایمیل' })
  @ApiProperty({ example: 'sadegh.dev30@gmail.com' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;

  @ApiPropertyOptional({ description: 'پسورد' })
  @IsNotEmpty({ message: 'پسورد الزامی است' })
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  password: string;
}
