import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, WordReveal } from "@/components/motion/reveal";
import { Container } from "@/components/site/section";
import { HeroScene } from "@/components/three/hero-scene";
import type { Dictionary } from "@/content/dictionaries";
import { href, t, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
      <Container className="grid min-h-[calc(100svh-4rem)] items-center gap-8 py-16 lg:grid-cols-12 lg:py-10">
        <div className="lg:col-span-7">
          {site.availability && (
            <Reveal y={12} className="mb-8">
              <p className="font-mono inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground">
                <span className="pulse-dot size-1.5 rounded-full bg-signal" aria-hidden="true" />
                {t(site.availability, lang)}
              </p>
            </Reveal>
          )}
          <Reveal y={12} delay={0.05}>
            <p className="eyebrow">{dict.hero.eyebrow}</p>
          </Reveal>
          <h1 className="font-display mt-5 text-balance text-[clamp(2.5rem,6.2vw,5.5rem)] font-semibold leading-[0.98]">
            <WordReveal text={dict.hero.title} delay={0.15} />
          </h1>
          <Reveal delay={0.7} className="mt-7 max-w-xl text-pretty text-lg text-muted-foreground sm:text-xl">
            <p>{dict.hero.subtitle}</p>
          </Reveal>
          <Reveal delay={0.85} className="mt-10 flex flex-wrap gap-3">
            <Link
              href={href(lang, "projects")}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {dict.hero.ctaProjects}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href={href(lang, "contact")}
              className="inline-flex items-center rounded-full border border-input px-6 py-3 text-sm font-medium transition-colors hover:border-signal/60"
            >
              {dict.hero.ctaContact}
            </Link>
          </Reveal>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md lg:col-span-5 lg:max-w-none">
          <HeroScene label={dict.hero.scene} className="size-full" />
          <span className="font-mono absolute left-0 top-[12%] text-xs uppercase tracking-[0.2em] text-signal">
            {dict.hero.labelBuild}
          </span>
          <span className="font-mono absolute bottom-[12%] right-0 text-xs uppercase tracking-[0.2em] text-infra">
            {dict.hero.labelRun}
          </span>
        </div>
      </Container>
    </section>
  );
}
