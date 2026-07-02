// src/components/home/PromoBanners.tsx
import Link from "next/link";
import Image from "next/image";

// Curated promo campaigns — static for now, like the hero's DEFAULT_SLIDES.
const BANNERS = [
  {
    eyebrow: "مراقبت از پوست",
    title: "روتین درخشش طبیعی",
    subtitle: "محصولات مراقبتی برای پوستی شفاف و سالم",
    cta: "خرید محصولات پوست",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "آرایش لب",
    title: "رنگ‌هایی برای هر لحظه",
    subtitle: "رژ لب‌های ماندگار با رنگ‌دانه‌های غنی",
    cta: "کشف رنگ‌ها",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function PromoBanners() {
  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {BANNERS.map((banner) => (
            <Link
              key={banner.title}
              href={banner.href}
              className="group relative block h-56 overflow-hidden rounded-card shadow-card transition-shadow hover:shadow-card-hover md:h-72"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Start-side plum gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#2A1726]/85 via-[#2A1726]/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 md:p-9">
                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-secondary">
                  <span className="h-px w-7 bg-secondary" aria-hidden />
                  {banner.eyebrow}
                </p>
                <h3 className="text-xl font-bold text-white md:text-2xl">{banner.title}</h3>
                <p className="max-w-[16rem] text-sm leading-6 text-white/80">{banner.subtitle}</p>
                <span className="mt-3 w-fit rounded-full border border-white/60 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white group-hover:text-[#2A1726]">
                  {banner.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
