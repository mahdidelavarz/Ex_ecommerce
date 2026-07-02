// src/components/home/TrustStrip.tsx
import {
  HugeiconsCustomerSupport,
  MdiKeyboardReturn,
  MdiShieldCheck,
  MdiTruckFast,
} from "@/components/icons/Icons";

const FEATURES = [
  {
    icon: MdiTruckFast,
    title: "ارسال سریع",
    description: "تحویل در کمترین زمان ممکن به سراسر کشور",
  },
  {
    icon: MdiShieldCheck,
    title: "ضمانت اصالت کالا",
    description: "تضمین اصالت و کیفیت تمامی محصولات",
  },
  {
    icon: MdiKeyboardReturn,
    title: "۷ روز ضمانت بازگشت",
    description: "بازگشت آسان کالا تا هفت روز پس از خرید",
  },
  {
    icon: HugeiconsCustomerSupport,
    title: "پشتیبانی ۲۴/۷",
    description: "پاسخگویی در تمام ساعات شبانه‌روز",
  },
];

export default function TrustStrip() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border shadow-card lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center gap-3 bg-surface p-7 text-center md:p-9"
            >
              <feature.icon className="h-9 w-9 text-secondary-hover" />
              <h3 className="text-sm font-bold text-text-primary md:text-base">
                {feature.title}
              </h3>
              <p className="text-xs leading-6 text-text-secondary md:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
