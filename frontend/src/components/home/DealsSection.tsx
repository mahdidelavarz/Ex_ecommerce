// src/components/home/DealsSection.tsx
import ProductCarousel from "@/modules/products/components/ProductCarousel";
import CountdownTimer from "./CountdownTimer";
import type { ProductListResponse } from "@/modules/products/types/product.types";

interface DealsSectionProps {
  products: ProductListResponse[];
}

/**
 * Flash-sale band: discounted products carousel on a dark aubergine gradient
 * with a rolling weekly countdown.
 */
export default function DealsSection({ products }: DealsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-bl from-primary via-[#6E3860] to-[#2A1726] px-5 py-10 md:px-10 md:py-14">
          {/* Decorative champagne glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-primary-hover/40 blur-3xl"
          />

          <div className="relative">
            <ProductCarousel
              products={products}
              eyebrow="پیشنهاد ویژه"
              title="فروش ویژه این هفته"
              href="/products?has_discount=true"
              linkLabel="مشاهده همه تخفیف‌ها"
              onDark
              headerExtra={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-white/75">تا پایان پیشنهاد:</span>
                  <CountdownTimer />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
