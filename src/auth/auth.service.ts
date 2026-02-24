import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Gender } from '@prisma/client';
import { Prisma } from '@prisma/client/extension';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { StringValue } from 'ms';
import { Role } from 'src/common/enums/role.enum';
import { SafeUser, sanitizeUser } from '../common/utils/sanitize-user';
import { FilesService } from '../files/files.service';
import { PrismaService } from '../prisma/prisma.service';
import { jwtConfig } from './configs/jwt.config';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginEmailDto } from './dtos/login-email.dto';
import { RegisterEmailDto } from './dtos/register-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SendOtpDto } from './dtos/send-otp.dto.js';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto.js';
import { EmailService } from './email.service.js';
import { OtpService } from './otp.service.js';
import { RequestWithCookies } from './types/request-with-coockie';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private filesService: FilesService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const otp = await this.prisma.phoneOtp.findFirst({
      where: {
        phone: dto.phone,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (otp) {
      if (otp.resendCount >= 4) {
        throw new BadRequestException(
          'حداکثر تعداد ارسال پر شده، لطفاً ۲ دقیقه صبر کنید.',
        );
      }
      const code = this.otpService.generateOtp();
      const hashed = await this.otpService.hashOtp(code);
      const expiresAt = this.otpService.getExpiryDate();

      await this.prisma.phoneOtp.update({
        where: { id: otp.id },
        data: {
          codeHash: hashed,
          expiresAt,
          resendCount: { increment: 1 },
        },
      });

      this.otpService.sendOtpToPhone(dto.phone, code);

      return { message: 'کد تایید با موفقیت ارسال شد.' };
    }

    const code = this.otpService.generateOtp();
    const hashed = await this.otpService.hashOtp(code);
    const expiresAt = this.otpService.getExpiryDate();

    await this.prisma.phoneOtp.create({
      data: {
        phone: dto.phone,
        codeHash: hashed,
        expiresAt,
      },
    });

    this.otpService.sendOtpToPhone(dto.phone, code);

    return { message: 'کد تایید با موفقیت ارسال شد.' };
  }

  async verifyOtp(dto: VerifyOtpDto, req: Request, res: Response) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const otp = await tx.phoneOtp.findFirst({
        where: {
          phone: dto.phone,
          used: false,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otp) throw new BadRequestException('کد منقضی یا نامعتبر است');
      if (otp.attempts >= 5) throw new BadRequestException('تلاش بیش از حد');

      const valid = await this.otpService.compareOtp(dto.code, otp.codeHash);

      if (!valid) {
        await tx.phoneOtp.update({
          where: { id: otp.id },
          data: { attempts: { increment: 1 } },
        });
        throw new UnauthorizedException('کد اشتباه است');
      }

      await tx.phoneOtp.update({
        where: { id: otp.id },
        data: { used: true },
      });

      let user = await tx.user.findUnique({ where: { phone: dto.phone } });

      if (!user) {
        user = await tx.user.create({
          data: {
            phone: dto.phone,
            phoneVerified: true,
            lastLoginAt: now,
            loginCount: 1,
            role: Role.STUDENT,
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: now,
            loginCount: { increment: 1 },
          },
        });
      }

      await tx.loginLog.create({
        data: {
          userId: user.id,
          isSuccess: true,
          ...this.getClientInfo(req),
        },
      });

      await this.generateTokensAndSetCookies(user, res, tx);

      const userWithProfile = await tx.user.findUnique({
        where: { id: user.id },
        include: { userProfile: true },
      });

      return sanitizeUser(userWithProfile);
    });
  }

  async me(userId: string) {
    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
      },
    });

    if (!userWithProfile) return null;

    const safeUser = sanitizeUser(userWithProfile);

    if (safeUser?.userProfile?.avatarUrl) {
      safeUser.userProfile.avatarUrl = this.filesService.withUrl(
        safeUser.userProfile.avatarUrl,
      );
    }

    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const {
      firstName,
      lastName,
      avatarUrl,
      gender,
      nationalCode,
      birthDate,
      bio,
    } = dto;

    const userUpdateData: Partial<{ firstName: string; lastName: string }> = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;

    const profileData: Partial<{
      avatarUrl: string;
      gender: Gender;
      nationalCode: string;
      birthDate: Date;
      bio: string;
    }> = {
      avatarUrl,
      gender,
      nationalCode,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      bio,
    };

    Object.keys(profileData).forEach(
      (key) =>
        profileData[key as keyof typeof profileData] === undefined &&
        delete profileData[key as keyof typeof profileData],
    );

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      const existingProfile = await tx.userProfile.findUnique({
        where: { userId },
      });
      if (existingProfile) {
        if (Object.keys(profileData).length > 0) {
          await tx.userProfile.update({
            where: { userId },
            data: profileData,
          });
        }
      } else if (Object.keys(profileData).length > 0) {
        await tx.userProfile.create({
          data: { userId, ...profileData },
        });
      }
      if (avatarUrl && existingProfile?.avatarUrl !== avatarUrl) {
        if (existingProfile?.avatarUrl) {
          await this.filesService.deleteByUrl(existingProfile?.avatarUrl);
        }
        await this.filesService.markUsedByUrl(avatarUrl);
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { userProfile: true },
      });
    });
  }

  async logout(userId: string, res: Response) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOCKIE_DOMAIN,
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOCKIE_DOMAIN,
    });

    return { message: 'کاربر با موفقیت خارج شد' };
  }

  async refresh(req: RequestWithCookies, res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('توکن ریفرش پیدا نشد');
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const userId = payload.sub;

    const tokenRecord = await this.findValidRefreshToken(userId, refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده');
    }

    const user = tokenRecord.user;
    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    await this.generateTokensAndSetCookies(user, res);

    return sanitizeUser(user);
  }

  async registerByEmail(dto: RegisterEmailDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('ایمیل قبلاً ثبت شده است.');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        emailVerified: false,
        isActive: false,
      },
    });

    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.emailVerification.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    this.emailService.sendVerificationEmail(user.email!, token);

    return { message: 'لینک تأیید ایمیل ارسال شد.' };
  }

  async verifyEmail(dto: VerifyEmailDto, res: Response) {
    const verifications = await this.prisma.emailVerification.findMany({
      where: { used: false, expiresAt: { gt: new Date() } },
    });

    let match: (typeof verifications)[number] | null = null;
    for (const v of verifications) {
      const isMatch = await bcrypt.compare(dto.token, v.tokenHash);
      if (isMatch) {
        match = v;
        break;
      }
    }

    if (!match)
      throw new BadRequestException('توکن معتبر نیست یا منقضی شده است.');

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: match.id },
        data: { used: true },
      }),
      this.prisma.user.update({
        where: { id: match.userId },
        data: { emailVerified: true, isActive: true },
      }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: match.userId },
      include: { userProfile: true },
    });

    if (!user) {
      throw new BadRequestException('کاربر مربوط به توکن پیدا نشد.');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });

    await this.generateTokensAndSetCookies(user, res);

    return sanitizeUser(user);
  }

  async loginByEmail(dto: LoginEmailDto, req: Request, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { userProfile: true },
    });

    if (!user) {
      throw new BadRequestException('ایمیل یا رمز عبور اشتباه است.');
    }

    if (!user.isActive)
      throw new UnauthorizedException('حساب کاربری غیرفعال است.');

    if (!user.emailVerified) {
      throw new UnauthorizedException('ایمیل شما تأیید نشده است.');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.passwordHash!,
    );
    if (!passwordMatch) {
      await this.logLogin({
        userId: user.id,
        isSuccess: false,
        req,
      });
      throw new BadRequestException('ایمیل یا رمز عبور اشتباه است.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });

    await this.logLogin({
      userId: user.id,
      isSuccess: true,
      req,
    });

    await this.generateTokensAndSetCookies(user, res);

    return sanitizeUser(user);
  }

  async adminLogin(dto: LoginEmailDto, req: Request, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, role: Role.ADMIN },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      throw new BadRequestException('ایمیل یا رمز عبور اشتباه است.');
    }

    if (!user.isActive)
      throw new UnauthorizedException('حساب کاربری غیرفعال است.');

    if (!user.emailVerified) {
      throw new UnauthorizedException('ایمیل شما تأیید نشده است.');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.passwordHash!,
    );
    if (!passwordMatch) {
      await this.logLogin({
        userId: user.id,
        isSuccess: false,
        req,
      });
      throw new BadRequestException('ایمیل یا رمز عبور اشتباه است.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });

    await this.logLogin({
      userId: user.id,
      isSuccess: true,
      req,
    });

    await this.generateTokensAndSetCookies(user, res);

    return sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('کاربر پیدا نشد');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash!,
    );
    if (!isMatch) throw new BadRequestException('رمز فعلی اشتباه است');

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('ایمیل یافت نشد');

    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordReset.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    this.emailService.sendResetPasswordEmail(user.email!, token);

    return { message: 'لینک بازیابی رمز به ایمیل شما ارسال شد' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resets = await this.prisma.passwordReset.findMany({
      where: { used: false, expiresAt: { gt: new Date() } },
    });

    let match: (typeof resets)[number] | null = null;
    for (const r of resets) {
      if (await bcrypt.compare(dto.token, r.tokenHash)) {
        match = r;
        break;
      }
    }

    if (!match) throw new BadRequestException('توکن معتبر نیست یا منقضی شده');

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { id: match.id },
        data: { used: true },
      }),
      this.prisma.user.update({
        where: { id: match.userId },
        data: { passwordHash: newHash },
      }),
    ]);

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  private async generateTokensAndSetCookies(
    user: SafeUser,
    res: Response,
    tx?: Prisma.TransactionClient,
  ) {
    const payload = {
      sub: user.id,
      phone: user.phone || null,
      email: user.email || null,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn as StringValue,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOCKIE_DOMAIN,
      maxAge: jwtConfig.accessCookieMaxAge,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOCKIE_DOMAIN,

      maxAge: jwtConfig.refreshCookieMaxAge,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 روز

    if (tx) {
      // استفاده از تراکنش
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.refreshToken.create({
        data: {
          tokenHash: refreshTokenHash,
          userId: user.id,
          expiresAt,
          revoked: false,
        },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: {
          tokenHash: refreshTokenHash,
          userId: user.id,
          expiresAt,
          revoked: false,
        },
      });
    }

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): { sub: string } {
    try {
      return this.jwtService.verify(token, {
        secret: jwtConfig.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده');
    }
  }

  private async findValidRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { include: { userProfile: true } },
      },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) return token;
    }

    return null;
  }

  private getClientInfo(req: Request) {
    const forwardedFor = req.headers['x-forwarded-for'];

    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : (forwardedFor?.split(',')[0] ?? req.socket?.remoteAddress ?? null);

    const userAgent = req.headers['user-agent'] ?? null;

    return {
      ipAddress,
      userAgent,
    };
  }

  private async logLogin(params: {
    userId: string;
    isSuccess: boolean;
    req: Request;
    tx?: Prisma.TransactionClient;
  }) {
    const { ipAddress, userAgent } = this.getClientInfo(params.req);

    await this.prisma.loginLog.create({
      data: {
        userId: params.userId,
        isSuccess: params.isSuccess,
        ipAddress,
        userAgent,
      },
    });
  }
}
