import ProductCarousel from "@/modules/products/components/ProductCarousel";
// import CountdownTimer from "./CountdownTimer";
import type { ProductListResponse } from "@/modules/products/types/product.types";

interface DealsSectionProps {
  products: ProductListResponse[];
}

/**
 * Flash-sale band: discounted products carousel with a rolling weekly countdown.
 */
export default function DealsSection({ products }: DealsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-[linear-gradient(135deg,#2A1726_0%,#4F2746_52%,#2A1726_100%)] py-10 md:py-12">
      <div className="container mx-auto px-4">
        <ProductCarousel
          products={products}
          eyebrow="پیشنهاد ویژه"
          title="فروش ویژه این هفته"
          href="/products?has_discount=true"
          linkLabel="مشاهده همه تخفیف‌ها"
          onDark
          size="compact"
          // headerExtra={
          //   <div className="flex flex-col gap-4 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          //     <div>
          //       <p className="text-sm font-semibold text-white">
          //         تخفیف‌های محدود با موجودی ویژه
          //       </p>
          //       <p className="mt-1 text-xs text-white/65">
          //         محصولات برگزیده با قیمت‌های به‌صرفه
          //       </p>
          //     </div>
          //     <div className="flex flex-wrap items-center gap-3">
          //       <span className="text-xs font-medium text-white/70">
          //         تا پایان پیشنهاد
          //       </span>
               
          //     </div>
          //   </div>
          // }
        />
      </div>
    </section>
  );
}
