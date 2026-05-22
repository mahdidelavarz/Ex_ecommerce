// src/utils/formatDate.ts
/**
 * Formats a date to Persian (Jalali) calendar
 * Note: Install jalaali-js for production: npm install jalaali-js
 */
export function formatDate(date: Date | string): string {
  // For now, simple Persian locale formatting
  // TODO: Replace with jalaali-js for proper Jalali dates
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}