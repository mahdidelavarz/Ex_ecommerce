// src/components/ui/Table.tsx
// Composable styled wrappers for the repeated admin table markup.
// Pages still compose rows/cells themselves — these just remove the
// duplicated className strings and standardize loading/empty states.
//
// Responsive behaviour: below `md` the table collapses into stacked cards
// (header hidden, each row a bordered card, each cell shows its `label`).
// At `md`+ it renders as a normal table.
import {
  ComponentType,
  HTMLAttributes,
  ReactNode,
  SVGProps,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

type Align = "right" | "center" | "left";

const alignClass: Record<Align, string> = {
  right: "md:text-right",
  center: "md:text-center",
  left: "md:text-left",
};

// Static class maps so Tailwind sees every breakpoint variant as a literal
// string (interpolated `${bp}:table-cell` names get purged and never emitted).
const thHideBelow: Record<"sm" | "md" | "lg", string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

// The table is stacked cards below `md` and a real table at `md+`, so a hidden
// column's "show" breakpoint must be `md`+ to use `table-cell`; `sm` shows as a
// flex card-field in the sm→md range. `none` is the default (always visible).
const tdDisplay: Record<"none" | "sm" | "md" | "lg", string> = {
  none: "flex md:table-cell",
  sm: "hidden sm:flex md:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /**
   * Tailwind max-height class for the scroll viewport (md+ only). The body
   * scrolls vertically within this height while the header stays pinned.
   * Defaults to `md:max-h-[70vh]`.
   */
  maxHeight?: string;
}

/** Outer container + scroll viewport (sticky header / scrollable body) + <table>. */
export function Table({
  className = "",
  maxHeight = "md:max-h-[60vh]",
  children,
  ...props
}: TableProps) {
  return (
    <div className="bg-surface rounded-card shadow-card md:overflow-hidden">
      {/* This div is the scroll container that the sticky header pins to. */}
      <div className={`md:overflow-auto p-3 md:p-0 ${maxHeight}`}>
        <table className={`block md:table w-full ${className}`} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    // Header is meaningless in the mobile card layout — hide it there.
    <thead className="hidden md:table-header-group" {...props}>
      <tr className={`border-b border-border ${className}`}>{children}</tr>
    </thead>
  );
}

interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** Hide the column below a breakpoint, e.g. "md" or "lg". */
  hideBelow?: "sm" | "md" | "lg";
}

export function TH({
  align = "right",
  hideBelow,
  className = "",
  children,
  ...props
}: THProps) {
  const hidden = hideBelow ? thHideBelow[hideBelow] : "";
  return (
    <th
      // Pin to the scroll viewport. The bg sits on each cell (not the row) so
      // sticky elements stay opaque as rows scroll underneath.
      className={`px-4 py-3 text-sm font-medium text-text-secondary md:sticky md:top-0 md:z-10 md:bg-surface-raised ${alignClass[align]} ${hidden} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`block md:table-row-group ${className}`} {...props}>
      {children}
    </tbody>
  );
}

/** Mobile = bordered card; md+ = normal table row with zebra striping. */
const rowCardClass = `
  block rounded-card border border-border bg-surface p-4 mb-3
  md:table-row md:rounded-none md:border-0 md:border-b md:bg-transparent md:p-0 md:mb-0
  md:even:bg-surface-raised/40
`;

interface TRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Adds hover highlight + pointer cursor (for clickable rows). */
  hover?: boolean;
}

export function TRow({
  hover = false,
  className = "",
  children,
  ...props
}: TRowProps) {
  return (
    <tr
      className={`${rowCardClass} ${
        hover
          ? "transition-colors hover:border-primary md:hover:bg-surface-raised"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TDProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  hideBelow?: "sm" | "md" | "lg";
  /** Field label shown beside the value in the mobile card layout. */
  label?: ReactNode;
}

export function TD({
  align = "right",
  hideBelow,
  label,
  className = "",
  children,
  ...props
}: TDProps) {
  const display = tdDisplay[hideBelow ?? "none"];
  return (
    <td
      className={`
        items-center justify-between gap-4 py-1.5
        ${display} md:px-4 md:py-3 text-sm text-text-primary
        ${alignClass[align]} ${className}
      `}
      {...props}
    >
      {label != null && (
        <span className="md:hidden text-text-secondary font-medium shrink-0">
          {label}
        </span>
      )}
      <span className="md:contents">{children}</span>
    </td>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

/** Loading placeholder rows — drop inside <TBody> while data is fetching. */
export function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className={rowCardClass}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="block py-1.5 md:table-cell md:px-4 md:py-3">
              <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children?: ReactNode;
}

/** Empty-state row — drop inside <TBody> when there are no records. */
export function TableEmpty({
  colSpan,
  message,
  icon: Icon,
  children,
}: TableEmptyProps) {
  return (
    <tr className="block md:table-row">
      <td colSpan={colSpan} className="block md:table-cell text-center py-12">
        {Icon && (
          <Icon className="text-text-muted mx-auto mb-3" width={48} height={48} />
        )}
        <p className="text-text-secondary">{message}</p>
        {children && <div className="mt-3">{children}</div>}
      </td>
    </tr>
  );
}
