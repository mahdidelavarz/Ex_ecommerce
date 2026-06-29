// src/components/layout/Footer.tsx
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import {
  MdiEmail,
  MdiInstagram,
  MdiMapMarker,
  MdiPhone,
  MdiTelegram,
  MdiWhatsapp,
  RubikaIcon,
} from "../icons/Icons";

const QUICK_LINKS = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "محصولات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const SERVICE_LINKS = [
  { href: "/faq", label: "سوالات متداول" },
  { href: "/shipping", label: "روش‌های ارسال" },
  { href: "/returns-policy", label: "رویه بازگشت کالا" },
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/privacy", label: "حریم خصوصی" },
];

export default async function Footer() {
  const s = await getSiteSettings();
  const name = s.company_name || "نازی شاپ";

  const socials = [
    { href: s.instagram_url, icon: MdiInstagram, label: "اینستاگرام" },
    { href: s.telegram_url, icon: MdiTelegram, label: "تلگرام" },
    { href: s.rubika_url, icon: RubikaIcon, label: "روبیکا" },
    { href: s.whatsapp_url, icon: MdiWhatsapp, label: "واتساپ" },
  ].filter((x) => x.href);

  return (
    <footer className="bg-surface-raised border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">{name}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              فروشگاه اینترنتی {name}، بهترین مقصد برای خرید آنلاین با قیمت‌های
              رقابتی و ارسال سریع.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">خدمات مشتریان</h3>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">اطلاعات تماس</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              {s.company_phone && (
                <li className="flex items-center gap-2">
                  <MdiPhone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${s.company_phone}`} className="hover:text-primary transition-colors">
                    {s.company_phone}
                  </a>
                </li>
              )}
              {s.company_email && (
                <li className="flex items-center gap-2">
                  <MdiEmail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${s.company_email}`} className="hover:text-primary transition-colors break-all">
                    {s.company_email}
                  </a>
                </li>
              )}
              {s.company_address && (
                <li className="flex items-start gap-2">
                  <MdiMapMarker className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{s.company_address}</span>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-surface rounded-button hover:bg-primary hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust seal + payment logo */}
        {(s.enemad_code || s.payment_logo_url) && (
          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-border mt-8 pt-8">
            {s.enemad_code && (
              <div dangerouslySetInnerHTML={{ __html: s.enemad_code }} />
            )}
            {s.payment_logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.payment_logo_url}
                alt="درگاه پرداخت"
                className="h-12 w-auto object-contain"
              />
            )}
          </div>
        )}

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} {name}. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
