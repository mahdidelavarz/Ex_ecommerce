// src/components/home/CategoryShowcase.tsx
import Link from "next/link";
import Image from "next/image";
// Direct import (not the ui barrel): this is a Server Component and the
// barrel pulls in client-only hooks.
import SectionHeading from "@/components/ui/SectionHeading";
import { MdiArrowRight, SolarFolderWithFilesBold } from "@/components/icons/Icons";
import { toPersianDigits } from "@/utils/toPersianDigits";
import { getImageSrc } from "@/utils/imageUrl";
import type { Category } from "@/modules/categories/types/category.types";

interface CategoryShowcaseProps {
  categories: Category[];
}

/**
 * Editorial category grid: top-level categories are shown with image-backed
 * tiles when available and a styled color fallback otherwise.
 */
export default function CategoryShowcase({
  categories,
}: CategoryShowcaseProps) {
  const items = categories.filter((c) => !c.parent_id).slice(0, 5);
  if (items.length === 0) return null;


  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="دسته‌بندی‌ها"
          title="دنیای زیبایی خود را انتخاب کنید"
        />

        <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[190px] md:grid-cols-4">
          {items.map((category, index) => {
            const isHero = index === 0;
            const imageSrc = getImageSrc(category.image);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-card shadow-card transition-shadow hover:shadow-card-hover ${
                  isHero ? "col-span-2 row-span-2" : ""
                }`}
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={category.name}
                    fill
                    sizes={
                      isHero
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                    }
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 grid place-items-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      backgroundColor: category.color || "var(--color-primary)",
                    }}
                  >
                    <SolarFolderWithFilesBold className="h-14 w-14 text-white/70 md:h-20 md:w-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1726]/80 via-[#2A1726]/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 md:p-5">
                  <div>
                    <h3
                      className={`font-bold text-white ${isHero ? "text-xl md:text-2xl" : "text-sm md:text-base"}`}
                    >
                      {category.name}
                    </h3>
                    {category.products_count > 0 && (
                      <p className="mt-0.5 text-[11px] text-white/70 md:text-xs">
                        {toPersianDigits(category.products_count)} محصول
                      </p>
                    )}
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <MdiArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
