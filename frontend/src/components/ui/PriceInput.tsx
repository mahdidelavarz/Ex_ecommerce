"use client";

import { forwardRef } from "react";
import Input, { type InputProps } from "./Input";

export interface PriceInputProps
  extends Omit<InputProps, "value" | "onChange" | "type" | "inputMode"> {
  /** Current numeric value (integer Toman) or null when empty. */
  value: number | null;
  /** Called with the parsed integer value, or null when cleared. */
  onValueChange: (value: number | null) => void;
}

/** Group an integer with Latin thousands separators, e.g. 2000000 -> "2,000,000". */
function groupDigits(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Money input that shows live thousands separators while typing and stores a
 * plain integer (Toman has no fractional unit). Strips any non-digit input.
 */
const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={groupDigits(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onValueChange(digits === "" ? null : Number(digits));
        }}
        {...props}
      />
    );
  },
);

PriceInput.displayName = "PriceInput";

export default PriceInput;
