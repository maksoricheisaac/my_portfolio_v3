import type { ReactNode } from "react";
import { DrawLine } from "@/components/motion/interactive";
import { Reveal, WordReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <p className="eyebrow">
        <span className="text-signal">/</span> {eyebrow}
      </p>
      <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">
        {title}
      </h2>
      <DrawLine className="mt-6 block h-px w-20 origin-left bg-gradient-to-r from-signal to-transparent" />
      {intro && (
        <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
          {intro}
        </p>
      )}
    </Reveal>
  );
}

/** Inner-page title block: animated eyebrow, word-reveal H1, intro. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div>
      <Reveal y={12}>
        <p className="eyebrow">
          <span className="text-signal">/</span> {eyebrow}
        </p>
      </Reveal>
      <h1 className="font-display mt-4 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] sm:text-7xl">
        <WordReveal text={title} delay={0.1} />
      </h1>
      {intro && (
        <Reveal delay={0.35} className="mt-6 max-w-2xl text-lg text-muted-foreground">
          <p>{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
