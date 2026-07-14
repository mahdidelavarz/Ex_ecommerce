import ProductCarousel from "@/modules/products/components/ProductCarousel";
import CountdownTimer from "./CountdownTimer";
import type { ProductListResponse } from "@/modules/products/types/product.types";

interface DealsSectionProps {
  products: ProductListResponse[];
}

export default function DealsSection({ products }: DealsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(194,168,120,.2),transparent_30%),linear-gradient(135deg,#24131F_0%,#4F2746_55%,#281521_100%)] py-7 md:py-9">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="container relative mx-auto px-4">
        <ProductCarousel
          products={products}
          eyebrow="پیشنهاد ویژه"
          title="فروش ویژه این هفته"
          href="/products?has_discount=true"
          linkLabel="مشاهده همه تخفیف‌ها"
          onDark
          size="compact"
          cardStyle="deal"
          inlineHeaderContent={<CountdownTimer compactOnMobile />}
        />
      </div>
    </section>
  );
}
