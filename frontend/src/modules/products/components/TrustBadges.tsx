import {
  MdiTruckFast,
  MdiShieldCheck,
  MdiKeyboardReturn,
  HugeiconsCustomerSupport,
} from '@/components/icons/Icons';

const BADGES = [
  { icon: MdiTruckFast, title: 'ارسال سریع', subtitle: 'تحویل در سریع‌ترین زمان' },
  { icon: MdiShieldCheck, title: 'ضمانت اصالت', subtitle: 'تضمین کالای اصل' },
  { icon: MdiKeyboardReturn, title: '۷ روز بازگشت', subtitle: 'بازگشت آسان کالا' },
  { icon: HugeiconsCustomerSupport, title: 'پشتیبانی', subtitle: 'پاسخگویی تمام‌وقت' },
];

/** Reassurance row of shipping & purchase guarantees. */
export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {BADGES.map(({ icon: Icon, title, subtitle }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-card bg-surface-raised px-3 py-3"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{title}</p>
            <p className="truncate text-xs text-text-muted">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
