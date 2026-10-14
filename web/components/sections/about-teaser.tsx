import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Parallax } from "@/components/motion/interactive";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/site/section";
import { Portrait } from "@/components/site/portrait";
import type { Dictionary } from "@/content/dictionaries";
import { ui } from "@/content/experience";
import { href, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

/** Editorial About: oversized background word, real portrait with scroll depth, fine rules. */
export function AboutTeaser({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const d = dict.aboutTeaser;
  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none">
        <Parallax distance={60}>
          <p
            aria-hidden="true"
            className="font-display whitespace-nowrap text-center text-[clamp(6rem,28vw,26rem)] font-semibold uppercase leading-none text-foreground/[0.04]"
          >
            {ui.about.bgWord}
          </p>
        </Parallax>
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-6 lg:col-start-1">
          <p className="eyebrow">
            <span className="text-signal">/</span> {d.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.02] sm:text-6xl">
            {d.title}
          </h2>
          <span className="mt-6 block h-px w-24 bg-signal" aria-hidden="true" />
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            {dict.about.blocks[0].text}
          </p>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {ui.about.points[lang].map((p, i) => (
              <li key={p} className="font-mono flex items-center gap-4 py-3 text-sm">
                <span className="text-subtle">{String(i + 1).padStart(2, "0")}</span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            href={href(lang, "about")}
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            {d.cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={0.15} y={40} className="mx-auto w-full max-w-sm lg:col-span-5 lg:col-start-8 lg:max-w-none">
          <Parallax distance={28}>
            <Portrait photo="crossed" alt={dict.about.portraitAlt} caption={site.location} />
          </Parallax>
        </Reveal>
      </Container>
    </section>
  );
}
