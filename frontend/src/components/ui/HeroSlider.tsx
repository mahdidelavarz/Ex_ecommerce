"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  buildFramePath,
  frameNotchRect,
  useIsPhone,
  type PathOpts,
} from "./SliderFrame";
import { MdiChevronLeft, MdiChevronRight } from "../icons/Icons";

export type HeroSlide = {
  id: string | number;
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Horizontal alignment of the caption block. Defaults to "start". */
  align?: "start" | "center";
};

type HeroSliderProps = {
  slides?: HeroSlide[];
  /** Autoplay interval (ms). Set to 0 to disable autoplay. */
  autoPlayMs?: number;
  className?: string;
  style?: CSSProperties;
};

/** Drop-in placeholder promo slides — swap image / title / ctaHref for real banners. */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "lux",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=80",
    title: "مجموعه‌ی لوکس آرایشی",
    subtitle: "زیبایی ماندگار با بهترین برندهای جهان",
    ctaLabel: "مشاهده محصولات",
    ctaHref: "/products",
    align: "start",
  },
  {
    id: "skincare",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1920&q=80",
    title: "مراقبت از پوست",
    subtitle: "درخششی طبیعی برای هر روز شما",
    ctaLabel: "خرید مراقبت پوست",
    ctaHref: "/products",
    align: "start",
  },
  {
    id: "fragrance",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1920&q=80",
    title: "عطرهای اصیل",
    subtitle: "رایحه‌ای که شخصیت شما را روایت می‌کند",
    ctaLabel: "کشف عطرها",
    ctaHref: "/products",
    align: "start",
  },
];

/** Responsive frame geometry — smaller notch on phones (mirrors SliderFrame usage notes). */
function frameOptsFor(phone: boolean): PathOpts {
  return {
    radius: 0,
    notchWidth: phone ? 150 : 260,
    notchDepth: phone ? 60 : 76,
    notchFlat: phone ? 64 : 110,
    notchRound: phone ? 18 : 28,
    inset: 0,
  };
}

export function HeroSlider({
  slides = DEFAULT_SLIDES,
  autoPlayMs = 6000,
  className,
  style,
}: HeroSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const phone = useIsPhone();

  const count = slides.length;
  const hasControls = count > 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const opts = frameOptsFor(phone);
  const d = buildFramePath(w, h, opts);
  const notch = frameNotchRect(w, h, opts);

  const goTo = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Autoplay — paused on hover/focus or when the tab is hidden.
  useEffect(() => {
    if (!hasControls || autoPlayMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [hasControls, autoPlayMs, paused, count]);

  // Keyboard nav (RTL): ArrowRight = previous, ArrowLeft = next.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hasControls) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      prev();
    }
  };

  const ready = w > 0 && h > 0;

  return (
    <div
      ref={ref}
      className={`relative h-full w-full select-none ${className ?? ""}`}
      style={{ width: "100%", height: "100%", ...style }}
      role="region"
      aria-roledescription="carousel"
      aria-label="بنرهای فروشگاه"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {ready && (
        <>
          {/* Slides — clipped to the exact frame shape (rounded corners + notch). */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `path('${d}')`, WebkitClipPath: `path('${d}')` }}
          >
            {slides.map((slide, i) => {
              const isActive = i === active;
              const alignCenter = slide.align === "center";
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    isActive ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={!isActive}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} از ${count}`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  {/* RTL-aware legibility gradient: darker on the right (caption side). */}
                  <div
                    className={`absolute inset-0 ${
                      alignCenter
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-black/10"
                        : "bg-gradient-to-l from-black/70 via-black/35 to-transparent"
                    }`}
                  />

                  {/* Caption */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-center gap-4 p-8 md:p-16 ${
                      alignCenter
                        ? "items-center text-center"
                        : "items-start text-right"
                    }`}
                  >
                    {isActive && (
                      <div
                        className={`animate-fade-in flex flex-col gap-4 ${
                          alignCenter ? "items-center" : "items-start"
                        } max-w-xl`}
                      >
                        <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-md md:text-5xl">
                          {slide.title}
                        </h2>
                        {slide.subtitle && (
                          <p className="text-base text-white/90 drop-shadow md:text-xl">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.ctaLabel && slide.ctaHref && (
                          <Link
                            href={slide.ctaHref}
                            className="mt-2 inline-flex items-center gap-2 rounded-button bg-primary px-7 py-3 text-base font-bold text-white shadow-card transition-all duration-200 hover:bg-primary-hover hover:gap-3"
                          >
                            {slide.ctaLabel}
                            <MdiChevronLeft className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrows — vertically centered, RTL: right = previous, left = next. */}
          {hasControls && (
            <>
              <button
                type="button"
                onClick={next}
                aria-label="اسلاید بعدی"
                className="absolute top-1/2 start-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-card backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-surface"
              >
                <MdiChevronRight className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="اسلاید قبلی"
                className="absolute top-1/2 end-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-card backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-surface"
              >
                <MdiChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Dots — seated inside the carved bottom-center notch. */}
          {hasControls && notch.visible && (
            <div
              className="absolute left-[50%] z-10 flex items-center gap-2"
              style={{
                left: notch.cx,
                top: notch.top + notch.depth / 2,
                transform: "translate(-50%, -50%)",
              }}
              role="tablist"
              aria-label="انتخاب اسلاید"
            >
              {slides.map((slide, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`اسلاید ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-primary"
                        : "w-2 bg-text-muted/40 hover:bg-text-muted/70"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HeroSlider;
