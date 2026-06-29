// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  HugeiconsCustomerSupport,
  MdiShieldCheck,
  MdiTruckFast,
  SolarFolderWithFilesBold,
} from "@/components/icons/Icons";
import { HeroSlider } from "@/components/ui/HeroSlider";
import { fetchCategories } from "@/lib/server-fetch";

export const metadata: Metadata = {
  title: {
    absolute: "نازی شاپ | فروشگاه اینترنتی لوازم آرایشی و بهداشتی",
  },
  description:
    "نازی شاپ، فروشگاه اینترنتی محصولات آرایشی و بهداشتی اصل با بهترین قیمت و ارسال سریع به سراسر کشور.",
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: MdiTruckFast,
    title: "ارسال سریع",
    description: "تحویل در کمترین زمان ممکن به سراسر کشور",
  },
  {
    icon: MdiShieldCheck,
    title: "تضمین کیفیت",
    description: "ضمانت اصالت و کیفیت تمامی محصولات",
  },
  {
    icon: HugeiconsCustomerSupport,
    title: "پشتیبانی ۲۴/۷",
    description: "پاسخگویی در تمام ساعات شبانه‌روز",
  },
];

export default async function HomePage() {
  const { data: categories } = await fetchCategories({
    is_active: true,
    limit: 12,
  });

  return (
    <div className="bg-background">
      {/* Hero (client island) */}
      <div className="w-full h-[80vh] flex justify-center items-center">
        <HeroSlider />
      </div>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            دسته‌بندی‌های محبوب
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-6 text-center group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor:
                      category.color || "var(--color-primary-light)",
                  }}
                >
                  <SolarFolderWithFilesBold className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-medium text-text-primary">
                  {category.name}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {category.products_count} محصول
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface-raised">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
