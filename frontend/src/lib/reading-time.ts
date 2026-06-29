// src/lib/reading-time.ts
// Estimate reading time (in minutes) from HTML or plain-text content.
// Persian/mixed text averages ~200 words per minute; minimum 1 minute.

const WORDS_PER_MINUTE = 200;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTimeMinutes(content: string): number {
  const text = stripHtml(content || "");
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Localized label, e.g. "۵ دقیقه مطالعه". */
export function readingTimeLabel(content: string): string {
  return `${readingTimeMinutes(content)} دقیقه مطالعه`;
}
