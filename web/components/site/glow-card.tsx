"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card with a pointer-tracking glowing border (Aceternity-style, adapted).
 * Purely decorative: the effect also shows on keyboard focus, never hover-only.
 */
export function GlowCard({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn("glow-card rounded-2xl", className)}
      style={glow ? ({ "--glow": glow } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
