'use client';

import { useRouter } from 'next/navigation';
import { MdiChevronLeft, MdiChevronRight } from '@/components/icons/Icons';

interface BrandsPaginationProps {
  currentPage: number;
  totalPages: number;
}

/** Thin client island: brand-list pagination that navigates via the URL (?page=). */
export default function BrandsPagination({ currentPage, totalPages }: BrandsPaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const page = Math.min(Math.max(1, p), totalPages);
    router.push(page === 1 ? '/brands' : `/brands?page=${page}`);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
        aria-label="صفحه قبل"
      >
        <MdiChevronRight className="w-5 h-5" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`w-10 h-10 rounded-button text-sm font-medium ${
            p === currentPage ? 'bg-primary text-white' : 'hover:bg-surface text-text-secondary'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
        aria-label="صفحه بعد"
      >
        <MdiChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
}
