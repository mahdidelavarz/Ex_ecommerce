// src/utils/formatPrice.ts
import { toPersianDigits } from './toPersianDigits';

/**
 * Formats a price number to Persian Toman format
 * Example: 1250000 → "۱,۲۵۰,۰۰۰ تومان"
 */
export function formatPrice(price: number): string {
  const formatted = price.toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

/**
 * Formats price without currency suffix
 */
export function formatPriceNumber(price: number): string {
  return toPersianDigits(price.toLocaleString());
}