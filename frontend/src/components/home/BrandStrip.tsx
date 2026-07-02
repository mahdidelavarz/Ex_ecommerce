// src/components/home/BrandStrip.tsx
import Link from "next/link";
import Image from "next/image";
import type { Brand } from "@/modules/brands/types/brand.types";

interface BrandStripProps {
  brands: Brand[];
}

/**
 * Pure-CSS brand logo marquee: the list is rendered twice inside a w-max
 * track animated by translateX(50%) (drifts start-ward in RTL). Pauses on
 * hover; disabled entirely under prefers-reduced-motion.
 */
export default function BrandStrip({ brands }: BrandStripProps) {
  if (!brands || brands.length < 4) return null;

  const items = [...brands, ...brands];

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 flex items-center justify-center gap-3 text-xs font-bold tracking-[0.3em] text-secondary-hover">
          <span className="h-px w-10 bg-secondary" aria-hidden />
          برندهای اصل
          <span className="h-px w-10 bg-secondary" aria-hidden />
        </p>

        <div className="overflow-hidden [mask-image:linear-gradient(to_left,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee flex w-max items-center">
            {items.map((brand, i) => (
              <Link
                key={`${brand.id}-${i}`}
                href={`/products?brand=${brand.id}`}
                aria-hidden={i >= brands.length}
                tabIndex={i >= brands.length ? -1 : undefined}
                className="flex h-16 shrink-0 items-center justify-center px-8 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:px-10"
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={112}
                    height={48}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="whitespace-nowrap text-lg font-bold text-text-muted">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
