"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Category } from "@/content/projects";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  slug: string;
  url: string;
  category: Category;
  tagline: string;
  title: string;
  summary: string;
  problem: string;
  contribution: string;
  status: string;
  stack: string[];
  stackLabel: string;
  links: { label: string; url: string }[];
  accent: "signal" | "infra";
  visual: ReactNode;
  /** True when `visual` is the CSS mockup (not a real image): the "conceptual" note applies. */
  conceptual: boolean;
}

export interface ShowcaseLabels {
  filterLabel: string;
  filters: Record<"all" | Category, string>;
  problem: string;
  contribution: string;
  previewNote: string;
  viewCase: string;
  empty: string;
  external: string;
}

const ease = [0.2, 0.7, 0.2, 1] as const;

export function ProjectShowcase({
  items,
  labels,
}: {
  items: ShowcaseItem[];
  labels: ShowcaseLabels;
}) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const present = new Set(items.map((i) => i.category));
  const keys = (["all", "saas", "entrepreneurship", "impact", "infra"] as const).filter(
    (k) => k === "all" || present.has(k),
  );
  const visible = items.filter((i) => filter === "all" || i.category === filter);

  return (
    <div>
      <div
        role="group"
        aria-label={labels.filterLabel}
        className="flex flex-wrap gap-2 border-y border-border py-4"
      >
        {keys.map((k) => {
          const active = filter === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(k)}
              className={cn(
                "relative rounded-full border px-4 py-2 text-sm transition-colors",
                active
                  ? "border-transparent text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-signal/50 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">{labels.filters[k]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <motion.article
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease }}
                className="group relative grid items-center gap-8 border-b border-border py-14 lg:grid-cols-12 lg:gap-14 lg:py-20"
              >
                <div className={cn("lg:col-span-6", flip ? "lg:order-2" : "lg:order-1")}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <div
                      className={cn(
                        "rounded-2xl border border-border p-3 sm:p-5",
                        p.accent === "signal"
                          ? "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--signal)_10%,transparent),transparent_70%)]"
                          : "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--infra)_10%,transparent),transparent_70%)]",
                      )}
                    >
                      {p.visual}
                    </div>
                  </motion.div>
                  {p.conceptual && (
                    <p className="font-mono mt-3 text-[0.7rem] text-subtle">{labels.previewNote}</p>
                  )}
                </div>

                <div className={cn("lg:col-span-6", flip ? "lg:order-1" : "lg:order-2")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="eyebrow">{p.tagline}</span>
                    <span className="font-mono inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-muted-foreground">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          p.accent === "signal" ? "bg-signal" : "bg-infra",
                        )}
                        aria-hidden="true"
                      />
                      {p.status}
                    </span>
                  </div>

                  <h2 className="font-display mt-4 text-5xl font-semibold leading-none sm:text-6xl">
                    <Link href={p.url} className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-5 max-w-xl text-lg text-muted-foreground">{p.summary}</p>

                  <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="eyebrow">{labels.problem}</dt>
                      <dd className="mt-2 text-sm text-muted-foreground">{p.problem}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow">{labels.contribution}</dt>
                      <dd className="mt-2 text-sm text-muted-foreground">{p.contribution}</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <p className="font-mono text-[0.7rem] text-subtle">{p.stackLabel}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <li
                          key={s}
                          className="font-mono rounded-md border border-border px-2 py-1 text-xs"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-signal">
                      {labels.viewCase}
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    {p.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {l.label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">{labels.external}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && <p className="py-16 text-muted-foreground">{labels.empty}</p>}
      </div>
    </div>
  );
}
