// src/modules/products/components/ProductCarousel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { SectionHeading } from "@/components/ui";
import { MdiArrowRight, MdiChevronLeft, MdiChevronRight, MdiImageOff } from "@/components/icons/Icons";
import { formatPrice } from "@/utils/formatPrice";
import { toPersianDigits } from "@/utils/toPersianDigits";
import {
  getCarouselState,
  getDragScrollDelta,
  scrollCarouselByCards,
} from "@/lib/carousel-scroll";
import type { ProductListResponse } from "../types/product.types";
import type { ReactNode } from "react";

interface ProductCarouselProps {
  products: ProductListResponse[];
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  /** Inverts heading colors for dark/banded sections */
  onDark?: boolean;
  /** Extra full-width row between the heading and the track (e.g. countdown) */
  headerExtra?: ReactNode;
  size?: "default" | "compact";
  cardStyle?: "default" | "deal";
  inlineHeaderContent?: ReactNode;
  className?: string;
}

function DealProductCard({ product }: { product: ProductListResponse }) {
  const minPrice = Number(product.price_range.min);
  const outOfStock = product.total_stock === 0 || minPrice <= 0;
  const hasDiscount = !outOfStock && product.discount_percent > 0 && product.discount_percent < 100;
  const originalPrice = hasDiscount ? Math.round(minPrice / (1 - product.discount_percent / 100)) : null;

  return (
    <Link href={`/products/${product.slug}`} aria-label={`مشاهده ${product.title}`} className="group/card flex h-full flex-col overflow-hidden rounded-2xl bg-white text-text-primary shadow-[0_16px_40px_-24px_rgba(0,0,0,.65)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-22px_rgba(0,0,0,.75)] focus-visible:outline-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-raised">
        {product.thumbnail ? (
          <Image src={product.thumbnail} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]" sizes="(max-width: 640px) 58vw, (max-width: 1024px) 29vw, 20vw" />
        ) : (
          <div className="grid h-full place-items-center"><MdiImageOff className="h-12 w-12 text-text-muted" /></div>
        )}
        {product.variants_count > 1 && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-text-secondary shadow-sm backdrop-blur">{toPersianDigits(product.variants_count)} تنوع</span>
        )}
      </div>
      <div className="flex min-h-32 flex-1 flex-col p-3.5">
        {product.brand?.name && <p className="mb-1 truncate text-[10px] font-semibold text-primary">{product.brand.name}</p>}
        <h3 className="line-clamp-2 text-sm font-bold leading-6 transition-colors group-hover/card:text-primary">{product.title}</h3>
        <div className="mt-auto pt-3">
          {outOfStock ? <p className="text-sm font-bold text-text-muted">ناموجود</p> : (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[15px] font-extrabold text-text-primary">{formatPrice(minPrice)}</span>
              {originalPrice && <span className="text-[11px] text-text-muted line-through decoration-error/70">{formatPrice(originalPrice)}</span>}
              {hasDiscount && <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-extrabold text-white">{toPersianDigits(product.discount_percent)}٪</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductCarousel({
  products,
  title,
  eyebrow,
  href,
  linkLabel,
  onDark = false,
  headerExtra,
  size = "default",
  cardStyle = "default",
  inlineHeaderContent,
  className = "",
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  // Drag-to-scroll state (kept in refs — no re-render per pointermove)
  const drag = useRef({ active: false, lastX: 0, moved: false });

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const state = getCarouselState(el, "[data-carousel-card]");
    setAtStart(state.atStart);
    setAtEnd(state.atEnd);
    setProgress(state.progress);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState, products.length]);

  if (!products || products.length === 0) return null;

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    scrollCarouselByCards(el, "[data-carousel-card]", dir);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only hijack mouse drags; touch scrolls natively via snap
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, lastX: e.clientX, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.lastX;
    if (Math.abs(delta) > 5 && !drag.current.moved) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) {
      el.scrollBy({ left: getDragScrollDelta(el, delta), behavior: "auto" });
      drag.current.lastX = e.clientX;
    }
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    // Swallow the click that ends a drag so cards don't navigate
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const arrowClass = `flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:opacity-35 disabled:cursor-default ${
    onDark
      ? "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      : "bg-surface text-text-primary shadow-card hover:bg-surface-raised"
  }`;
  const compact = size === "compact";
  const trackClass = compact
    ? "gap-3 md:gap-4"
    : "gap-4 md:gap-6";
  const slideClass = compact
    ? "w-[76%] max-w-[18rem] sm:w-[35%] sm:max-w-none md:w-[26%] lg:w-[19%] xl:w-[17%]"
    : "w-[70%] sm:w-[45%] md:w-[31%] lg:w-[23%]";

  return (
    <div className={className}>
      {inlineHeaderContent ? (
        <div className="mb-5 flex flex-nowrap items-center justify-between gap-2 border-b border-white/10 pb-4 sm:gap-4 sm:pb-5">
          <div className="min-w-fit">
            {eyebrow && <p className="mb-1 hidden text-[11px] font-bold tracking-[0.18em] text-secondary sm:block">{eyebrow}</p>}
            <h2 className="text-sm font-extrabold text-white sm:text-xl md:text-2xl">{title}</h2>
          </div>
          <div className="w-auto shrink-0">{inlineHeaderContent}</div>
          <div className="hidden items-center gap-2 md:flex">
            {href && <Link href={href} className="ml-1 hidden items-center gap-1 text-xs font-bold text-secondary transition hover:text-white md:flex"><MdiArrowRight className="h-4 w-4" />{linkLabel ?? "مشاهده همه"}</Link>}
            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" onClick={() => scrollByCards(1)} disabled={atEnd} aria-label="بعدی" className={arrowClass}><MdiChevronRight className="h-5 w-5" /></button>
              <button type="button" onClick={() => scrollByCards(-1)} disabled={atStart} aria-label="قبلی" className={arrowClass}><MdiChevronLeft className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      ) : <SectionHeading
        title={title}
        eyebrow={eyebrow}
        href={href}
        linkLabel={linkLabel}
        onDark={onDark}
        actions={
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-label="بعدی"
              className={arrowClass}
            >
              <MdiChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-label="قبلی"
              className={arrowClass}
            >
              <MdiChevronLeft className="h-5 w-5" />
            </button>
          </div>
        }
      />}

      {headerExtra && <div className={compact ? "mb-5" : "mb-6"}>{headerExtra}</div>}

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={`flex cursor-grab snap-x snap-mandatory overflow-x-auto pb-2 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClass}`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-card
            className={`${slideClass} shrink-0 snap-start`}
          >
            {cardStyle === "deal" ? <DealProductCard product={product} /> : <ProductCard product={product} />}
          </div>
        ))}
      </div>

      {/* Scroll progress */}
      <div
        className={`mx-auto mt-4 h-0.5 w-full max-w-xs overflow-hidden rounded-full ${
          onDark ? "bg-white/15" : "bg-border"
        }`}
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-secondary to-primary transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
