import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/motion/interactive";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CopyButton } from "@/components/site/copy-button";
import { Container } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";
import { ui } from "@/content/experience";
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
        className="bg-grid absolute inset-0 -z-10 opacity-60"
        aria-hidden="true"
      />
      <Container>
      <Stagger className="flex flex-col items-start gap-8">
        <StaggerItem as="p" className="eyebrow">
          <span className="text-signal">/</span> {dict.cta.eyebrow}
        </StaggerItem>
        {title ? (
          <StaggerItem as="h2" className="font-display max-w-4xl text-balance text-[clamp(2.25rem,5.5vw,5rem)] font-semibold leading-[1]">
            {title}
          </StaggerItem>
        ) : (
          <StaggerItem
            as="h2"
            className="font-display text-[clamp(2.6rem,10vw,9rem)] font-semibold uppercase leading-[0.9]"
          >
            <span className="block">{ui.contact.lines[lang][0]}</span>
            <span className="block text-muted-foreground">
              {ui.contact.lines[lang][1]}
            </span>
            <span className="block text-signal">{ui.contact.lines[lang][2]}</span>
          </StaggerItem>
        )}
        <StaggerItem as="p" className="max-w-xl text-lg text-muted-foreground">
          {text ?? dict.cta.text}
        </StaggerItem>
        <StaggerItem className="flex flex-wrap gap-3">
          <Magnetic>
            <Link
              href={href(lang, "contact")}
              className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {dict.common.contactMe}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Magnetic>
          {site.email && (
            <CopyButton
              value={site.email}
              label={`${dict.contact.copyEmail} — ${site.email}`}
              doneLabel={dict.contact.copied}
            />
          )}
          {site.linkedin && (
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-input px-7 py-3.5 font-medium transition-colors hover:border-signal/60"
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
