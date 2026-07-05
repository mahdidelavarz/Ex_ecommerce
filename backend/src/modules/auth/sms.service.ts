// src/modules/auth/sms.service.ts
import axios from 'axios';
import { logger } from '../../shared/utils/logger';
import { env } from '../../config/env';

interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries: unknown[];
}

export class SMSService {
  private static readonly API_KEY = env.sms.kavenegarApiKey;
  private static readonly SENDER = env.sms.kavenegarSender;
  private static readonly API_URL = 'https://api.kavenegar.com/v1';

  /**
   * Send OTP via Kavenegar SMS
   */
  static async sendOTP(phoneNumber: string, otpCode: string): Promise<{ success: boolean; message: string }> {
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
      const body = new URLSearchParams({
        sender: this.SENDER,
        receptor: phoneNumber,
        message,
      });

      const response = await axios.post<KavenegarResponse>(url, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      });

      if (response.data.return.status === 200) {
        logger.info(`✅ SMS sent to ${phoneNumber}`);
        return {
          success: true,
          message: 'پیامک با موفقیت ارسال شد',
        };
      }

      logger.error('Kavenegar API error:', response.data.return);
      return {
        success: false,
        message: 'خطا در ارسال پیامک',
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        logger.error('Kavenegar Error:', (error as any).response?.data);
      } else {
        // Avoid logging the raw error object: AxiosError.config.url embeds
        // the Kavenegar API key and would otherwise end up in the log files.
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Kavenegar Error: ${message}`);
      }
      return {
        success: false,
        message: 'خطا در ارسال پیامک',
      };
    }
  }

  /**
   * Generate random 4-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
