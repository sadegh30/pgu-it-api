// src/auth/otp.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  private OTP_LENGTH = 6;
  private OTP_EXPIRY_MINUTES = 2;

  generateOtp(): string {
    return Math.floor(1000).toString();
    // return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async hashOtp(code: string): Promise<string> {
    return bcrypt.hash(code, 10);
  }

  async compareOtp(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash);
  }

  getExpiryDate(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expiry;
  }

  sendOtpToPhone(phone: string, code: string): void {
    console.log(`Send OTP ${code} to phone ${phone}`);
  }
}
