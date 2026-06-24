// src/components/ui/styles.ts
// Shared className fragments for form field primitives (Input, Select, Textarea).
// Kept as template-string fragments — no clsx/cva dependency — matching the
// existing convention in Button.tsx / PhoneInput.tsx.

/** Base styles shared by text inputs, selects and textareas. */
export const fieldBase = `
  w-full px-4 py-2.5 bg-surface border rounded-input
  text-text-primary placeholder:text-text-muted
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  disabled:opacity-50 disabled:cursor-not-allowed
`;

/** Border/ring color depending on whether the field has an error. */
export const fieldBorder = (hasError?: boolean) =>
  hasError ? "border-error focus:ring-error" : "border-border";

/** Shared label styling. */
export const fieldLabel = "block text-sm font-medium text-text-secondary";
