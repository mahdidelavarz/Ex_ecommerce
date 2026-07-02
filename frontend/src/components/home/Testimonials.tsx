// src/components/home/Testimonials.tsx
// Direct imports (not the ui barrel): this is a Server Component and the
// barrel pulls in client-only hooks.
import SectionHeading from "@/components/ui/SectionHeading";
import StarRating from "@/components/ui/StarRating";

// Curated testimonials — static until a testimonial/review-highlight model exists.
const TESTIMONIALS = [
  {
    name: "مریم احمدی",
    city: "تهران",
    rating: 5,
    text: "کیفیت محصولات فوق‌العاده است و بسته‌بندی بسیار شیک و حرفه‌ای بود. سفارشم فقط دو روزه به دستم رسید.",
  },
  {
    name: "سارا موسوی",
    city: "اصفهان",
    rating: 5,
    text: "اولین بار بود اینترنتی لوازم آرایشی می‌خریدم و اصالت کالا برایم خیلی مهم بود. همه چیز اورجینال و عالی بود.",
  },
  {
    name: "نگار کریمی",
    city: "شیراز",
    rating: 4,
    text: "پشتیبانی واقعاً پاسخگوست؛ برای انتخاب رنگ رژ راهنمایی‌ام کردند و نتیجه دقیقاً همانی شد که می‌خواستم.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          align="center"
          eyebrow="نظرات مشتریان"
          title="آنچه مشتریان ما می‌گویند"
          subtitle="تجربه‌ی واقعی خرید از نازی شاپ"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="relative flex flex-col rounded-card bg-surface p-7 shadow-card"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-1 right-5 font-serif text-7xl leading-none text-secondary/25"
              >
                &rdquo;
              </span>
              <StarRating rating={item.rating} size={16} />
              <blockquote className="mt-4 flex-1 text-sm leading-8 text-text-secondary">
                {item.text}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-light text-base font-bold text-primary">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-bold text-text-primary">{item.name}</span>
                  <span className="block text-xs text-text-muted">{item.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
