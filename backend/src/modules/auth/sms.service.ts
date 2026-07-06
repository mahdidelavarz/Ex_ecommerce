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
  private static readonly TEMPLATE = env.sms.kavenegarVerifyTemplate;
  private static readonly API_URL = 'https://api.kavenegar.com/v1';

  static async sendOTP(
    phoneNumber: string,
    otpCode: string,
  ): Promise<{ success: boolean; message: string }> {
    if (env.nodeEnv !== 'production') {
      logger.info(`[DEV SMS] OTP for ${phoneNumber}: ${otpCode}`);
      return {
        success: true,
        message: 'OTP logged in non-production mode',
      };
    }

    try {
      const url = `${this.API_URL}/${this.API_KEY}/verify/lookup.json`;

      const body = new URLSearchParams({
        receptor: phoneNumber,
        token: otpCode,
        template: this.TEMPLATE,
        type: 'sms',
      });

      const response = await axios.post<KavenegarResponse>(
        url,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );

      if (response.data.return.status === 200) {
        logger.info(`✅ OTP SMS sent to ${phoneNumber}`);
        return {
          success: true,
          message: 'کد تایید با موفقیت ارسال شد',
        };
      }

      logger.error('Kavenegar Verify Lookup error:', response.data.return);

      return {
        success: false,
        message: response.data.return.message || 'خطا در ارسال کد تایید',
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        logger.error('Kavenegar Verify Lookup Error:', (error as any).response?.data);
      } else {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Kavenegar Verify Lookup Error: ${message}`);
      }

      return {
        success: false,
        message: 'خطا در ارسال کد تایید',
      };
    }
  }

  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
