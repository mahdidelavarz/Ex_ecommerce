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
  desktopImage: string;
  phoneImage: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondary?: {
    label: string;
    href: string;
  };
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
    desktopImage:"images/cosmetics-banner-desktop.webp",
    phoneImage : "images/cosmetics-banner-phone.webp",
    title: "مجموعه‌ی لوکس آرایشی",
    subtitle: "زیبایی ماندگار با بهترین برندهای جهان",
    ctaLabel: "مشاهده محصولات",
    ctaHref: "/products",
    align: "start",
  },
  {
    id: "skincare",
    desktopImage:"images/skin.webp",
    phoneImage : "images/skin2.webp",
    title: "مراقبت از پوست",
    subtitle: "درخششی طبیعی برای هر روز شما",
    ctaLabel: "خرید محصولات مراقبت پوست",
    ctaHref: "/products",
    align: "start",
  },
  {
    id: "fragrance",
    desktopImage:"images/hair.webp",
    phoneImage : "images/hair2.webp",
    title: "مراقبت از مو",
    subtitle: "زیبایی و سلامت موهای شما با محصولات حرفه‌ای",
    ctaLabel: "خرید محصولات مراقبت مو",
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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
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

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasControls || !phone) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!hasControls || !phone || !start) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) {
      window.setTimeout(() => setPaused(false), 800);
      return;
    }

    if (dx < 0) {
      next();
    } else {
      prev();
    }
    window.setTimeout(() => setPaused(false), 800);
  };

  const onTouchCancel = () => {
    touchStart.current = null;
    setPaused(false);
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
      dir="rtl"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
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
                    src={slide.desktopImage}
                    alt={slide.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover hidden lg:block"
                  />
                  {/* RTL-aware legibility gradient: darker on the right (caption side). */}
                  <div
                    className={`absolute inset-0 ${
                      alignCenter
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-black/10"
                        : "bg-gradient-to-l from-black/70 via-black/35 to-transparent"
                    }`}
                  />
                  <Image
                    src={slide.phoneImage}
                    alt={slide.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover lg:hidden"
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
                    className={`absolute inset-0 flex flex-col justify-end gap-3 px-5 pb-24 pt-16 mb-12 md:justify-center md:gap-4 md:p-16 md:mb-0 ${
                      alignCenter
                        ? "items-center text-center"
                        : "items-start text-right"
                    }`}
                  >
                    {isActive && (
                      <div
                        className={`flex max-w-[18rem] flex-col gap-2.5 md:max-w-xl md:gap-4 lg:mr-30 ${
                          alignCenter ? "items-center" : "items-start"
                        }`}
                      >
                        {slide.eyebrow && (
                          <p
                            className="animate-fade-in flex items-center gap-3 text-xs font-bold tracking-[0.35em] text-secondary md:text-sm"
                            style={{ animationFillMode: "both" }}
                          >
                            <span className="h-px w-10 bg-secondary" aria-hidden />
                            {slide.eyebrow}
                          </p>
                        )}
                        <h2
                          className="animate-fade-in text-2xl font-black leading-[1.25] text-white drop-shadow-md sm:text-3xl md:text-6xl"
                          style={{
                            animationDelay: "120ms",
                            animationFillMode: "both",
                          }}
                        >
                          {slide.title}
                        </h2>
                        {slide.subtitle && (
                          <p
                            className="animate-fade-in max-w-[17rem] text-sm font-light leading-6 text-white/85 drop-shadow md:max-w-md md:text-xl md:leading-8"
                            style={{
                              animationDelay: "240ms",
                              animationFillMode: "both",
                            }}
                          >
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.ctaLabel && slide.ctaHref && (
                          <div
                            className="animate-fade-in mt-2 flex flex-wrap items-center gap-3"
                            style={{
                              animationDelay: "360ms",
                              animationFillMode: "both",
                            }}
                          >
                            <Link
                              href={slide.ctaHref}
                              className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-[#2A1726] shadow-card transition-all duration-200 hover:gap-3 hover:bg-secondary-hover md:px-8 md:py-3.5 md:text-base"
                            >
                              {slide.ctaLabel}
                              <MdiChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </Link>
                            {slide.ctaSecondary && (
                              <Link
                                href={slide.ctaSecondary.href}
                                className="inline-flex items-center rounded-full border border-white/50 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 md:px-8 md:py-3.5 md:text-base"
                              >
                                {slide.ctaSecondary.label}
                              </Link>
                            )}
                          </div>
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
                className="absolute top-1/2 start-4 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-card backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-surface md:flex"
              >
                <MdiChevronRight className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="اسلاید قبلی"
                className="absolute top-1/2 end-4 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-card backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-surface md:flex"
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
