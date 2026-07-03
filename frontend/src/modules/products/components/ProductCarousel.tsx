// src/modules/products/components/ProductCarousel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { SectionHeading } from "@/components/ui";
import { MdiChevronLeft, MdiChevronRight } from "@/components/icons/Icons";
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
  className?: string;
}

export default function ProductCarousel({
  products,
  title,
  eyebrow,
  href,
  linkLabel,
  onDark = false,
  headerExtra,
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

  return (
    <div className={className}>
      <SectionHeading
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
      />

      {headerExtra && <div className="mb-6">{headerExtra}</div>}

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-2 select-none active:cursor-grabbing md:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-card
            className="w-[70%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[23%]"
          >
            <ProductCard product={product} />
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
