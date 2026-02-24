// src/auth/email.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    console.log('✅ ارسال ایمیل تأیید به:', email);
    console.log('🔗 لینک تأیید:', verifyUrl);
    console.log('🔗 توکن تأیید:', token);

    // در آینده می‌تونی اینجا از nodemailer یا mailgun استفاده کنی
  }

  sendResetPasswordEmail(email: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log('✅ ارسال ایمیل تأیید به:', email);
    console.log('🔗 لینک تأیید:', verifyUrl);
    console.log('🔗 توکن تأیید:', token);

    // در آینده می‌تونی اینجا از nodemailer یا mailgun استفاده کنی
  }
}
