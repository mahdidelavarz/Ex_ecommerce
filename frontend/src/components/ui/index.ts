// src/components/ui/index.ts
// Barrel export for shared UI primitives.
// Usage: import { Input, Select, Table, Badge } from "@/components/ui";

// Form fields
export { default as Input } from "./Input";
export type { InputProps } from "./Input";
export { default as Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
export { default as Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";
export { default as Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";
export { default as Toggle } from "./Toggle";
export type { ToggleProps } from "./Toggle";

// Display
export { default as Badge } from "./Badge";
export type { BadgeProps } from "./Badge";
export { default as Card } from "./Card";

// Table
export {
  Table,
  THead,
  TH,
  TBody,
  TRow,
  TD,
  TableSkeleton,
  TableEmpty,
} from "./Table";
export { default as Pagination } from "./Pagination";
export type { PaginationProps, PaginationMeta } from "./Pagination";

// Overlays & feedback
export { default as Modal } from "./Modal";
export type { ModalProps } from "./Modal";
export { default as Drawer } from "./Drawer";
export type { DrawerProps } from "./Drawer";
export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";
export { default as Skeleton } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

// Existing primitives (re-exported for a single import surface)
export { default as Button } from "./Button";
export { default as PhoneInput } from "./PhoneInput";
export { default as OtpInput } from "./OtpInput";
export { default as StarRating } from "./StarRating";
export { default as ErrorState } from "./ErrorState";
