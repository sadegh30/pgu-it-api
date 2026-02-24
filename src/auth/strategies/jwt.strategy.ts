import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SafeUser, sanitizeUser } from '../../common/utils/sanitize-user';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConfig } from '../configs/jwt.config';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookies | undefined): string | null => {
          if (!request) return null;
          return (request.cookies?.access_token ?? null) as string | null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload: { sub: string }): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    return sanitizeUser(user)!;
  }
}
