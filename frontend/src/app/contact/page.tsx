import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import { getSiteSettings } from "@/lib/site-settings";
import {
  MdiPhone,
  LucideSmartphone,
  MdiEmail,
  MdiMapMarker,
  MdiCalendar,
  MdiTelegram,
  MdiInstagram,
  RubikaIcon,
} from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "راه‌های ارتباط با فروشگاه نازی شاپ: تلفن، ایمیل، آدرس و پشتیبانی از طریق تلگرام، اینستاگرام و روبیکا.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSiteSettings();

  const details = [
    { icon: MdiPhone, label: "تلفن ثابت", value: s.company_phone, href: s.company_phone ? `tel:${s.company_phone}` : undefined },
    { icon: LucideSmartphone, label: "تلفن همراه", value: s.company_mobile, href: s.company_mobile ? `tel:${s.company_mobile}` : undefined },
    { icon: MdiEmail, label: "ایمیل", value: s.company_email, href: s.company_email ? `mailto:${s.company_email}` : undefined },
    { icon: MdiMapMarker, label: "آدرس", value: s.company_address },
    { icon: MdiMapMarker, label: "کد پستی", value: s.company_postal_code },
    { icon: MdiCalendar, label: "ساعات پاسخگویی", value: s.company_support_hours },
  ].filter((d) => d.value);

  const channels = [
    { icon: MdiTelegram, label: "تلگرام", href: s.telegram_url },
    { icon: MdiInstagram, label: "اینستاگرام", href: s.instagram_url },
    { icon: RubikaIcon, label: "روبیکا", href: s.rubika_url },
  ].filter((c) => c.href);

  return (
    <ContentPage
      title="تماس با ما"
      subtitle="برای هرگونه پرسش، پیگیری سفارش یا پشتیبانی از راه‌های زیر با ما در ارتباط باشید."
      bare
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Contact details */}
        <section className="bg-surface border border-border rounded-card shadow-card p-6 md:p-8">
          <h2 className="text-lg font-bold text-text-primary mb-5">
            اطلاعات تماس
          </h2>
          {details.length > 0 ? (
            <ul className="space-y-4">
              {details.map((d) => (
                <li key={d.label} className="flex items-start gap-3">
                  <span className="p-2 bg-surface-raised rounded-button text-primary shrink-0">
                    <d.icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">{d.label}</p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-text-primary hover:text-primary transition-colors break-words"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="text-text-primary break-words">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-sm">
              اطلاعات تماس به‌زودی تکمیل می‌شود.
            </p>
          )}
        </section>

        {/* Support channels */}
        <section className="bg-surface border border-border rounded-card shadow-card p-6 md:p-8">
          <h2 className="text-lg font-bold text-text-primary mb-2">
            پشتیبانی آنلاین
          </h2>
          <p className="text-sm text-text-secondary mb-5">
            برای پاسخ سریع‌تر، از طریق شبکه‌های زیر با پشتیبانی ما در ارتباط
            باشید.
          </p>
          {channels.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-raised rounded-button text-text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <c.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{c.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              کانال‌های پشتیبانی به‌زودی فعال می‌شوند.
            </p>
          )}
        </section>
      </div>

      {/* Map */}
      {s.map_embed_url && (
        <div className="mt-6 max-w-5xl overflow-hidden rounded-card border border-border shadow-card">
          <iframe
            src={s.map_embed_url}
            title="موقعیت روی نقشه"
            className="w-full h-[320px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </ContentPage>
  );
}
