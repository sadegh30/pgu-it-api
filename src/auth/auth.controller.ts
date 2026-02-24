import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginEmailDto } from './dtos/login-email.dto';
import { RegisterEmailDto } from './dtos/register-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithCookies } from './types/request-with-coockie';
import type { RequestWithUser } from './types/request-with-user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'ارسال کد تأیید به موبایل' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtp(dto, req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'دریافت اطلاعات کاربر لاگین شده' })
  getMe(@Req() req: RequestWithUser) {
    return this.authService.me(req.user.id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'آپدیت پروفایل کاربر لاگین‌شده' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'خروج کاربر' })
  logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req.user.id, res);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'دریافت توکن جدید از refresh token' })
  refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @Post('register')
  @ApiOperation({ summary: 'ثبت نام با ایمیل' })
  async registerByEmail(@Body() dto: RegisterEmailDto) {
    return this.authService.registerByEmail(dto);
  }

  @Post('email/verify')
  @ApiOperation({ summary: 'تأیید ایمیل ثبت نام' })
  verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyEmail(dto, res);
  }

  @Post('login')
  @ApiOperation({ summary: 'ورود با ایمیل و پسورد' })
  async loginByEmail(
    @Body() dto: LoginEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginByEmail(dto, req, res);
  }

  @Post('login-admin')
  @ApiOperation({ summary: 'ورود ادمین پنل' })
  async adminLogin(
    @Body() dto: LoginEmailDto,
    @Req() req: Request,

    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.adminLogin(dto, req, res);
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'تغییر رمز عبور' })
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'درخواست بازیابی رمز عبور' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'ریست کردن رمز عبور' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
