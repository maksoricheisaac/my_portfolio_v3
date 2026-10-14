import { cn } from "@/lib/utils";

/**
 * Infinite horizontal ticker. Items are duplicated for a seamless loop (the copy is hidden from
 * assistive tech); motion pauses on hover/focus and is disabled under prefers-reduced-motion.
 */
export function Marquee({
  items,
  label,
  className,
}: {
  items: string[];
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div className="marquee-track flex w-max gap-3">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3">
            {items.map((name) => (
              <li
                key={name}
                className="font-mono rounded-full border border-border bg-surface/60 px-4 py-1.5 text-sm text-muted-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
