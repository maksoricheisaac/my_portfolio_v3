import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export function ContactCta({
  lang,
  dict,
  title,
  text,
}: {
  lang: Locale;
  dict: Dictionary;
  title?: string;
  text?: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-border py-28 sm:py-40">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,color-mix(in_oklch,var(--signal)_14%,transparent),transparent)]"
        aria-hidden="true"
      />
      <Container>
      <Stagger className="flex flex-col items-start gap-8">
        <StaggerItem as="p" className="eyebrow">
          <span className="text-signal">/</span> {dict.cta.eyebrow}
        </StaggerItem>
        <StaggerItem as="h2" className="font-display max-w-4xl text-balance text-[clamp(2.25rem,5.5vw,5rem)] font-semibold leading-[1]">
          {title ?? dict.cta.title}
        </StaggerItem>
        <StaggerItem as="p" className="max-w-xl text-lg text-muted-foreground">
          {text ?? dict.cta.text}
        </StaggerItem>
        <StaggerItem className="flex flex-wrap gap-3">
          <Link
            href={href(lang, "contact")}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {dict.common.contactMe}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {site.linkedin && (
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-input px-7 py-3.5 font-medium transition-colors hover:border-signal/60"
            >
              LinkedIn
              <span className="sr-only"> {dict.common.external}</span>
            </a>
          )}
        </StaggerItem>
      </Stagger>
      </Container>
    </section>
  );
}
