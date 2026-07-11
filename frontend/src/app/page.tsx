// src/app/page.tsx
import type { Metadata } from "next";
import { HeroSlider } from "@/components/ui/HeroSlider";
import BlogSlider from "@/modules/blog/components/BlogSlider";
import ProductCarousel from "@/modules/products/components/ProductCarousel";
import Reveal from "@/components/home/Reveal";
import DealsSection from "@/components/home/DealsSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import BrandStrip from "@/components/home/BrandStrip";
import PromoBanners from "@/components/home/PromoBanners";
import Testimonials from "@/components/home/Testimonials";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import TrustStrip from "@/components/home/TrustStrip";
import {
  fetchBlogPosts,
  fetchBrands,
  fetchCategories,
  fetchProducts,
} from "@/lib/server-fetch";

export const metadata: Metadata = {
  title: {
    absolute: "نازی شاپ | فروشگاه اینترنتی لوازم آرایشی و بهداشتی",
  },
  description:
    "نازی شاپ، فروشگاه اینترنتی محصولات آرایشی و بهداشتی اصل با بهترین قیمت و ارسال سریع به سراسر کشور.",
  alternates: { canonical: "/" },
};

const PUBLIC = { is_active: true, is_public: true } as const;

export default async function HomePage() {
  const [
    { data: deals },
    { data: bestSellers },
    { data: newArrivals },
    { data: categories },
    { data: brands },
    { data: blogPosts },
  ] = await Promise.all([
    fetchProducts({ ...PUBLIC, has_discount: true, has_stock: true, limit: 10 }, 600),
    fetchProducts({ ...PUBLIC, sort_by: "sales", sort_order: "DESC", has_stock: true, limit: 10 }),
    fetchProducts({ ...PUBLIC, sort_by: "created_at", sort_order: "DESC", limit: 10 }),
    fetchCategories({ is_active: true, parent_id: "null", limit: 5 }),
    fetchBrands({ is_active: true, limit: 20 }),
    fetchBlogPosts({ is_published: true, limit: 8, sort_by: "published_at", sort_order: "DESC" }),
  ]);

  return (
    <div className="bg-background">
      {/* Hero (client island) */}
      <div className="flex h-[93svh] w-full items-center justify-center md:h-screen">
        <HeroSlider />
      </div>

      {/* Rich category tiles */}
      <Reveal>
        <CategoryShowcase categories={categories} />
      </Reveal>

      {/* Flash sale — discounted products carousel + countdown */}
      <Reveal>
        <DealsSection products={deals} />
      </Reveal>

      {/* Curated promo banners */}
      <Reveal>
        <PromoBanners />
      </Reveal>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <Reveal>
          <section className="py-14 md:py-16">
            <div className="container mx-auto px-4">
              <ProductCarousel
                products={bestSellers}
                eyebrow="محبوب‌ترین‌ها"
                title="پرفروش‌ترین محصولات"
                href="/products?sort_by=sales&sort_order=DESC"
              />
            </div>
          </section>
        </Reveal>
      )}

      {/* Brand marquee */}
      <Reveal>
        <BrandStrip brands={brands} />
      </Reveal>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <Reveal>
          <section className="py-14 md:py-16">
            <div className="container mx-auto px-4">
              <ProductCarousel
                products={newArrivals}
                eyebrow="تازه‌ها"
                title="جدیدترین محصولات"
                href="/products"
              />
            </div>
          </section>
        </Reveal>
      )}

      {/* Testimonials */}
      <Reveal>
        <Testimonials />
      </Reveal>

      {/* Blog */}
      <Reveal>
        <BlogSlider posts={blogPosts} />
      </Reveal>

      {/* Newsletter */}
      <Reveal>
        <NewsletterSignup />
      </Reveal>

      {/* Trust strip */}
      <Reveal>
        <TrustStrip />
      </Reveal>
    </div>
  );
}
