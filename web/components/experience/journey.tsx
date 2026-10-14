"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Container } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { journey, ui } from "@/content/experience";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Vertical editorial timeline; the spine fills with the scroll progress through the list. */
export function Journey({
  lang,
  projectsBase,
  projectSlugs,
}: {
  lang: Locale;
  /** Localized URL of the projects index; a case study lives at `${projectsBase}/${slug}`. */
  projectsBase: string;
  /** Slugs that really exist: a link is shown only for those. */
  projectSlugs: string[];
}) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const u = ui.journey;

  return (
    <section id="journey" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
      <Container>
        <Reveal className="max-w-3xl">
          <p className="eyebrow">
            <span className="text-signal">/</span> {t(u.eyebrow, lang)}
          </p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {t(u.title, lang)}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">{t(u.intro, lang)}</p>
        </Reveal>

        <ol ref={ref} className="relative mt-16 max-w-3xl">
          <span className="absolute bottom-0 left-[0.4rem] top-0 w-px bg-border" aria-hidden="true" />
          <motion.span
            className="absolute bottom-0 left-[0.4rem] top-0 w-px origin-top bg-signal"
            style={reduce ? undefined : { scaleY }}
            aria-hidden="true"
          />
          {journey.map((entry, i) => (
            <Reveal as="li" key={entry.id} y={20} className="relative pb-14 pl-10 last:pb-0">
              <span
                className={cn(
                  "absolute left-0 top-2 size-[0.85rem] border bg-background",
                  entry.kind === "learning" ? "border-dashed border-foreground" : "border-signal",
                )}
                aria-hidden="true"
              />
              <p className="font-mono flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-[0.16em] text-subtle">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{t(u.kinds[entry.kind], lang)}</span>
                {entry.period && <span className="text-foreground">{entry.period}</span>}
              </p>
              <h3 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{t(entry.title, lang)}</h3>
              <p className="mt-2 max-w-xl text-pretty text-muted-foreground">{t(entry.text, lang)}</p>
              {entry.project && projectSlugs.includes(entry.project) && (
                <Link
                  href={`${projectsBase}/${entry.project}`}
                  className="group mt-3 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                >
                  {t(u.viewCase, lang)}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              )}
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
