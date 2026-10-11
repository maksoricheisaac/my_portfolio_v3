import { cn } from "@/lib/utils";

/** RM monogram: an "R" whose leg continues into an "M" stroke, built on a node grid. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-9", className)}
      fill="none"
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="39" height="39" rx="10" className="stroke-border" />
      <path
        d="M10 29V11h7.5a4.5 4.5 0 0 1 0 9H10m7 0 4 9"
        className="stroke-foreground"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 29V15l4 7 4-7v14"
        className="stroke-signal"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
