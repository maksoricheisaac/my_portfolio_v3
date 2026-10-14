"use client";

/**
 * Cinematic hero. Entrance sequence (≈ 1.6 s, content readable from ~0.9 s):
 *   0.00  guide line draws across the top
 *   0.15  RM monogram strokes draw
 *   0.55  name and tagline rise through their masks
 *   0.55  3D structure assembles behind (see experience/hero-scene.tsx)
 *   1.10  presentation, actions and scroll cue settle
 * Everything is plain Motion; reduced-motion visitors get the final state immediately.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Magnetic } from "@/components/motion/interactive";
import { HeroVisual } from "@/components/experience/hero-visual";
import { Container } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";
import { ui } from "@/content/experience";
import { href, t, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

const ease = [0.2, 0.7, 0.2, 1] as const;

function Mask({ children, delay, className }: { children: string; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ y: "108%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-20" aria-hidden="true" />

      {/* 3D structure: behind the text, never interactive. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[56%] w-full lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[64%]"
      >
        <HeroVisual label={t(ui.hero.sceneLabel, lang)} />
      </motion.div>
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_30%,var(--background)_58%)] lg:bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklch,var(--background)_70%,transparent)_38%,transparent_70%)]"
        aria-hidden="true"
      />

      <Container className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-14 pt-28 sm:pb-16">
        {/* Guide line + monogram */}
        <div className="absolute inset-x-5 top-6 flex items-center gap-4 sm:inset-x-8">
          <motion.span
            className="h-px flex-1 origin-left bg-gradient-to-r from-signal via-border to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease }}
            aria-hidden="true"
          />
          <svg viewBox="0 0 40 40" className="size-10 shrink-0" fill="none" aria-hidden="true">
            <motion.path
              d="M10 29V11h7.5a4.5 4.5 0 0 1 0 9H10m7 0 4 9"
              stroke="var(--foreground)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.15 }}
            />
            <motion.path
              d="M23 29V15l4 7 4-7v14"
              stroke="var(--signal)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.35 }}
            />
          </svg>
        </div>

        {site.availability && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.9 }}
            className="font-mono mb-8 inline-flex w-fit items-center gap-2.5 border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground"
          >
            <span className="pulse-dot size-1.5 rounded-full bg-signal" aria-hidden="true" />
            {t(site.availability, lang)}
          </motion.p>
        )}

        <h1>
          <span className="sr-only">
            Riche Makso — Full-Stack Developer building digital experiences
          </span>
          <span aria-hidden="true" className="font-display block text-[clamp(3.4rem,13.5vw,12rem)] font-semibold uppercase leading-[0.86]">
            <Mask delay={0.55}>Riche</Mask>
            <Mask delay={0.65} className="text-muted-foreground">
              Makso
            </Mask>
          </span>
        </h1>

        <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
          <p
            aria-hidden="true"
            className="font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-muted-foreground sm:text-sm lg:col-span-5"
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block text-foreground"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.85 }}
              >
                Full-Stack Developer
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.95 }}
              >
                Building digital experiences.
              </motion.span>
            </span>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1.1 }}
            className="lg:col-span-7 lg:max-w-xl lg:justify-self-end"
          >
            <p className="text-pretty text-base text-muted-foreground sm:text-lg">{dict.hero.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic>
                <Link
                  href={href(lang, "projects")}
                  className="group inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  {dict.hero.ctaProjects}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
              <Link
                href={href(lang, "contact")}
                className="inline-flex items-center border border-input px-6 py-3 text-sm font-medium transition-colors hover:border-signal/70 hover:text-signal"
              >
                {dict.common.contactMe}
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="font-mono absolute bottom-4 right-5 hidden items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-subtle sm:right-8 lg:flex"
          aria-hidden="true"
        >
          <span>{t(ui.hero.scroll, lang)}</span>
          <span className="relative block h-8 w-px overflow-hidden bg-border">
            <span className="scroll-cue absolute inset-x-0 top-0 h-3 bg-signal" />
          </span>
        </motion.div>
      </Container>
    </section>
  );
}
