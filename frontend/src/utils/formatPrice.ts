// src/utils/formatPrice.ts
import { toPersianDigits } from './toPersianDigits';

/**
 * Formats a price number to Persian Toman format
 * Example: 1250000 → "۱,۲۵۰,۰۰۰ تومان"
 */
export function formatPrice(price: number): string {
  // Postgres `numeric` columns arrive as strings (e.g. "2000.00"); coerce to a
  // number so grouping applies and the trailing decimals are dropped (Toman is
  // a whole-number currency).
  const formatted = Number(price).toLocaleString('fa-IR', { maximumFractionDigits: 0 });
  return `${formatted} تومان`;
}

/**
 * Formats price without currency suffix
 */
export function formatPriceNumber(price: number): string {
  return toPersianDigits(Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 }));
}