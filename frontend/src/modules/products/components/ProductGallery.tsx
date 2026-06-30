'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ProductImage } from '../types/product.types';
import {
  MdiImageOff,
  MdiClose,
  MdiChevronLeft,
  MdiChevronRight,
} from '@/components/icons/Icons';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

/**
 * Premium product gallery.
 * - Desktop: vertical thumbnail rail + large image with cursor-tracked hover-zoom.
 * - Mobile: horizontal scroll-snap carousel with dot indicators.
 * - Tap/click opens a full-screen lightbox (arrows / Esc / swipe).
 */
export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  const trackRef = useRef<HTMLDivElement>(null);

  // Keep `active` clamped if the image list ever changes length.
  const safeActive = Math.min(active, Math.max(0, images.length - 1));

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-card bg-surface-raised flex items-center justify-center">
        <MdiImageOff className="w-24 h-24 text-text-muted" />
      </div>
    );
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ on: true, x, y });
  };

  // Track the active slide in the mobile carousel (RTL-safe via Math.abs).
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    setActive(idx);
  };

  return (
    <div className="lg:flex lg:gap-4">
      {/* Desktop thumbnail rail */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-3 shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActive(idx)}
              aria-label={`نمایش تصویر ${idx + 1}`}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors duration-200 cursor-pointer ${
                idx === safeActive
                  ? 'border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${title} - تصویر ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Desktop main image with hover-zoom */}
      <div className="hidden lg:block flex-1">
        <div
          className="group relative aspect-square w-full overflow-hidden rounded-card bg-surface shadow-card cursor-zoom-in"
          onMouseMove={handleMove}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={images[safeActive].image_url}
            alt={images[safeActive].alt_text || title}
            fill
            priority
            sizes="50vw"
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform: zoom.on ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
            }}
          />
        </div>
      </div>

      {/* Mobile swipe carousel */}
      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-card"
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square w-full shrink-0 snap-center bg-surface"
              aria-label={`بزرگ‌نمایی تصویر ${idx + 1}`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${title} - تصویر ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {images.map((img, idx) => (
              <span
                key={img.id}
                className={`h-2 rounded-full transition-all duration-200 ${
                  idx === safeActive ? 'w-5 bg-primary' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          title={title}
          index={safeActive}
          onIndexChange={setActive}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Full-screen lightbox ───────────────────────────────────────── */

function Lightbox({
  images,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  images: ProductImage[];
  title: string;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      onIndexChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  // Keyboard navigation + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: ArrowRight visually moves to the previous image.
      else if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-text-primary/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`گالری تصاویر ${title}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm tabular-nums" dir="ltr">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="بستن"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <MdiClose className="w-6 h-6" />
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex-1"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <Image
          src={images[index].image_url}
          alt={images[index].alt_text || title}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="تصویر بعدی"
            className="absolute end-4 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <MdiChevronRight className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="تصویر قبلی"
            className="absolute start-4 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <MdiChevronLeft className="w-7 h-7" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex justify-center gap-2 overflow-x-auto p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onIndexChange(idx)}
              aria-label={`تصویر ${idx + 1}`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                idx === index ? 'border-primary' : 'border-white/20 hover:border-white/50'
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${title} - تصویر ${idx + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
