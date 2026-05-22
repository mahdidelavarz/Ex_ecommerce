// src/modules/auth/sms.service.ts
import axios from 'axios';
import { logger } from '../../shared/utils/logger';
import { env } from '../../config/env';

interface SMSResponse {
  success: boolean;
  message: string;
}

export class SMSService {
  private static readonly API_KEY = process.env.KAVENEGAR_API_KEY;
  private static readonly SENDER = process.env.KAVENEGAR_SENDER;
  private static readonly API_URL = 'https://api.kavenegar.com/v1';

  /**
   * Send OTP via SMS
   */
  static async sendOTP(phoneNumber: string, otpCode: string): Promise<SMSResponse> {
    // In development, just log the OTP
    if (env.nodeEnv === 'development') {
      logger.info(`📱 [DEV] OTP for ${phoneNumber}: ${otpCode}`);
      return {
        success: true,
        message: 'OTP logged in development mode',
      };
    }

    // In production, send via Kavenegar
    try {
      const url = `${this.API_URL}/${this.API_KEY}/sms/send.json`;
      const message = `کد تایید شما: ${otpCode}\nاین کد تا 2 دقیقه معتبر است.`;

      const response = await axios.post(url, null, {
        params: {
          sender: this.SENDER,
          receptor: phoneNumber,
          message: message,
        },
      });

      if (response.data?.return?.status === 200) {
        return { success: true, message: 'پیامک با موفقیت ارسال شد' };
      }

      return { success: false, message: 'خطا در ارسال پیامک' };
    } catch (error) {
      logger.error('SMS send failed:', error);
      return { success: false, message: 'خطا در ارسال پیامک' };
    }
  }

  /**
   * Generate random 4-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}