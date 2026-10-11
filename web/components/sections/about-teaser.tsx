import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/site/section";
import { Portrait } from "@/components/site/portrait";
import type { Dictionary } from "@/content/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function AboutTeaser({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const d = dict.aboutTeaser;
  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Portrait
            photo="pockets"
            alt={dict.about.portraitAlt}
            caption={site.location}
            className="mx-auto max-w-sm"
          />
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
          <p className="eyebrow">
            <span className="text-signal">/</span> {d.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {d.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{dict.about.blocks[0].text}</p>
          <Link
            href={href(lang, "about")}
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            {d.cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
