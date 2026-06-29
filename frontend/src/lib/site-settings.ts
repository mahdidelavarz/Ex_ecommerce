// src/lib/site-settings.ts
// Server-side reader for public store settings (contact info, socials, seals).
// Single source of truth for the footer, contact and about pages.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface SiteSettings {
  company_name: string;
  company_phone: string;
  company_mobile: string;
  company_email: string;
  company_address: string;
  company_postal_code: string;
  company_support_hours: string;
  instagram_url: string;
  telegram_url: string;
  whatsapp_url: string;
  rubika_url: string;
  map_embed_url: string;
  enemad_code: string;
  payment_logo_url: string;
}

const EMPTY_SETTINGS: SiteSettings = {
  company_name: 'نازی شاپ',
  company_phone: '',
  company_mobile: '',
  company_email: '',
  company_address: '',
  company_postal_code: '',
  company_support_hours: '',
  instagram_url: '',
  telegram_url: '',
  whatsapp_url: '',
  rubika_url: '',
  map_embed_url: '',
  enemad_code: '',
  payment_logo_url: '',
};

/**
 * Fetches whitelisted public settings from the backend. Cached for one hour via
 * Next's data cache; falls back to safe defaults if the API is unreachable so
 * pages never crash during build or an outage.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/public`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return EMPTY_SETTINGS;
    const json = (await res.json()) as { data?: Partial<SiteSettings> };
    return { ...EMPTY_SETTINGS, ...(json.data ?? {}) };
  } catch {
    return EMPTY_SETTINGS;
  }
}
