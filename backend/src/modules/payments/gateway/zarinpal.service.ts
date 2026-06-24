// src/modules/payments/gateway/zarinpal.service.ts
import axios from 'axios';
import { env } from '../../../config/env';
import { BadRequestError } from '../../../shared/utils/errors';

const BASE = (sandbox: boolean) =>
  sandbox ? 'https://sandbox.zarinpal.com/pg' : 'https://api.zarinpal.com/pg';

export class ZarinpalService {
  private get base() {
    return BASE(env.zarinpal.sandbox);
  }

  async requestPayment(amount: number, description: string, callbackUrl: string): Promise<string> {
    const res = await axios.post(`${this.base}/v4/payment/request.json`, {
      merchant_id: env.zarinpal.merchantId,
      amount,
      description,
      callback_url: callbackUrl,
    });
    if (res.data.data.code !== 100) throw new BadRequestError('خطا در ایجاد درگاه پرداخت');
    return res.data.data.authority;
  }

  getGatewayUrl(authority: string): string {
    return `${this.base}/StartPay/${authority}`;
  }

  async verifyPayment(authority: string, amount: number): Promise<{ refId: string; alreadyVerified: boolean }> {
    const res = await axios.post(`${this.base}/v4/payment/verify.json`, {
      merchant_id: env.zarinpal.merchantId,
      amount,
      authority,
    });
    const { code, ref_id } = res.data.data;
    if (code !== 100 && code !== 101) throw new BadRequestError('پرداخت تایید نشد');
    return { refId: String(ref_id), alreadyVerified: code === 101 };
  }

  /**
   * Attempt to refund a settled payment. Zarinpal refunds require merchant
   * PaymentManager access, so this is best-effort: returns false on any failure
   * (e.g. sandbox / no access) instead of throwing, letting the return workflow
   * complete and finance reconcile manually.
   */
  async refundPayment(authority: string, amount: number): Promise<boolean> {
    try {
      const res = await axios.post(`${this.base}/v4/payment/refund.json`, {
        merchant_id: env.zarinpal.merchantId,
        authority,
        amount,
      });
      return res.data?.data?.code === 100;
    } catch {
      return false;
    }
  }
}
