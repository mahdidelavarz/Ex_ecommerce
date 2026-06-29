// src/modules/settings/setting.service.ts
import { AppDataSource } from '../../config/database';
import { AppSetting } from '../../database/entities/app-setting.entity';

const DEFAULTS: Record<string, { value: string; label: string }> = {
  shipping_cost: { value: '50000', label: 'هزینه ارسال (تومان)' },

  // اطلاعات فروشگاه (برای فوتر، صفحه تماس و درباره ما)
  company_name: { value: 'نازی شاپ', label: 'نام فروشگاه' },
  company_phone: { value: '', label: 'تلفن ثابت' },
  company_mobile: { value: '', label: 'تلفن همراه' },
  company_email: { value: '', label: 'ایمیل' },
  company_address: { value: '', label: 'آدرس' },
  company_postal_code: { value: '', label: 'کد پستی' },
  company_support_hours: { value: '', label: 'ساعات پاسخگویی' },

  // شبکه‌های اجتماعی و پشتیبانی
  instagram_url: { value: '', label: 'لینک اینستاگرام' },
  telegram_url: { value: '', label: 'لینک تلگرام' },
  whatsapp_url: { value: '', label: 'لینک واتساپ' },
  rubika_url: { value: '', label: 'لینک روبیکا' },
  map_embed_url: { value: '', label: 'لینک نقشه (iframe src)' },

  // نمادها
  enemad_code: { value: '', label: 'کد نماد اعتماد الکترونیکی (HTML)' },
  payment_logo_url: { value: '', label: 'آدرس لوگوی درگاه پرداخت' },
};

// Keys safe to expose without authentication (storefront footer, contact & about pages).
const PUBLIC_KEYS = [
  'company_name',
  'company_phone',
  'company_mobile',
  'company_email',
  'company_address',
  'company_postal_code',
  'company_support_hours',
  'instagram_url',
  'telegram_url',
  'whatsapp_url',
  'rubika_url',
  'map_embed_url',
  'enemad_code',
  'payment_logo_url',
];

export class SettingService {
  private repo = AppDataSource.getRepository(AppSetting);

  async list(): Promise<AppSetting[]> {
    const rows = await this.repo.find({ order: { key: 'ASC' } });
    // Merge in any keys that don't yet have a DB row
    const existing = new Set(rows.map((r) => r.key));
    for (const [key, def] of Object.entries(DEFAULTS)) {
      if (!existing.has(key)) {
        rows.push(this.repo.create({ key, value: def.value, label: def.label }));
      }
    }
    return rows;
  }

  /** Whitelisted public settings as a flat key→value map for the storefront. */
  async publicMap(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    const stored = new Map(rows.map((r) => [r.key, r.value]));
    const result: Record<string, string> = {};
    for (const key of PUBLIC_KEYS) {
      result[key] = stored.get(key) ?? DEFAULTS[key]?.value ?? '';
    }
    return result;
  }

  async getByKey(key: string): Promise<{ key: string; value: string; label: string }> {
    const row = await this.repo.findOne({ where: { key } });
    if (row) return row;
    const def = DEFAULTS[key];
    return { key, value: def?.value ?? '', label: def?.label ?? key };
  }

  async upsert(key: string, value: string): Promise<AppSetting> {
    const def = DEFAULTS[key];
    await this.repo.upsert(
      { key, value, label: def?.label ?? key },
      { conflictPaths: ['key'] }
    );
    return this.repo.findOneOrFail({ where: { key } });
  }
}
