// src/app/page.tsx
'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useCategories } from '@/modules/categories/hooks/useCategories';

export default function HomePage() {
  const { data: categoriesData } = useCategories({ parent_id: null });

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            به نازی شاپ خوش آمدید
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            بهترین مقصد برای خرید آنلاین با قیمت‌های رقابتی و ارسال سریع
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-button text-lg font-bold hover:bg-primary-light transition-colors"
          >
            مشاهده محصولات
            <Icon icon="mdi:arrow-left" className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            دسته‌بندی‌های محبوب
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesData?.data?.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-6 text-center group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: category.color || 'var(--color-primary-light)' }}
                >
                  <Icon
                    icon={category.icon || 'mdi:folder'}
                    className="w-8 h-8 text-white"
                  />
                </div>
                <h3 className="font-medium text-text-primary">{category.name}</h3>
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
                  <Icon icon={feature.icon} className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: 'mdi:truck-fast',
    title: 'ارسال سریع',
    description: 'تحویل در کمترین زمان ممکن به سراسر کشور',
  },
  {
    icon: 'mdi:shield-check',
    title: 'تضمین کیفیت',
    description: 'ضمانت اصالت و کیفیت تمامی محصولات',
  },
  {
    icon: 'mdi:headset',
    title: 'پشتیبانی ۲۴/۷',
    description: 'پاسخگویی در تمام ساعات شبانه‌روز',
  },
];