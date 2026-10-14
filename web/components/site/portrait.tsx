import Image from "next/image";
import { cn } from "@/lib/utils";

const photos = {
  crossed: "/me/portrait-crossed.webp",
  pockets: "/me/portrait-pockets.webp",
  jacket: "/me/portrait-jacket.webp",
} as const;

/**
 * Cut-out portrait on a quiet green-tinted panel (the dark suit would vanish on the page background).
 * Images are pre-optimised WebP (900×1200), so Next's runtime optimiser is not needed.
 */
export function Portrait({
  photo,
  alt,
  caption,
  priority,
  className,
}: {
  photo: keyof typeof photos;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border border-border bg-surface-2",
        className,
      )}
    >
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,color-mix(in_oklch,var(--signal)_38%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="bg-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <Image
        src={photos[photo]}
        alt={alt}
        width={900}
        height={1200}
        priority={priority}
        unoptimized
        sizes="(min-width: 1024px) 420px, 80vw"
        className="mx-auto h-auto w-full max-w-sm object-contain"
      />
      {caption && (
        <figcaption className="font-mono absolute bottom-3 left-3 rounded-full border border-border bg-background/70 px-3 py-1 text-[0.7rem] text-muted-foreground backdrop-blur">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
