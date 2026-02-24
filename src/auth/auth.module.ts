import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { FilesService } from '../files/files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConfig } from './configs/jwt.config';
import { AUTH_STRATEGIES } from './constants/auth-strategies.constants';
import { EmailService } from './email.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: AUTH_STRATEGIES.JWT }),
    JwtModule.register({
      secret: jwtConfig.accessSecret,
      signOptions: { expiresIn: jwtConfig.accessExpiresIn as StringValue },
    }),
  ],
  providers: [AuthService, JwtStrategy, OtpService, EmailService, FilesService],
  controllers: [AuthController],
})
export class AuthModule {}
