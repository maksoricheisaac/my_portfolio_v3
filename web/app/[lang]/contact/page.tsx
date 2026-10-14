import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFallback } from "@/components/site/page-fallback";
import { notFound } from "next/navigation";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { Portrait } from "@/components/site/portrait";
import { Container, PageHeader } from "@/components/site/section";
import { CopyButton } from "@/components/site/copy-button";
import { getDictionary } from "@/content/dictionaries";
import { locales, hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = await getDictionary(lang);
  return pageMetadata({ lang, route: "contact", ...meta.pages.contact });
}

async function ContactPageContent({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.contact;

  const channels = [
    { label: d.linkedin, url: site.linkedin },
    { label: d.whatsapp, url: site.whatsapp },
    { label: d.github, url: site.github },
  ].filter((c): c is { label: string; url: string } => Boolean(c.url));

  return (
    <Container className="py-16 sm:py-24">
      <PageHeader eyebrow={d.eyebrow} title={d.title} intro={d.text} />

      <div className="mt-16 grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <ContactForm lang={lang} form={d.form} />
        </Reveal>
      <Reveal as="section" delay={0.1} className="lg:col-span-5" aria-labelledby="channels">
        <Portrait
          photo="jacket"
          alt={dict.about.portraitAlt}
          className="mb-10 max-w-[14rem]"
        />
        <h2 id="channels" className="eyebrow">
          {d.channels}
        </h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {site.email && (
            <li className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <p className="eyebrow">{d.email}</p>
                <a
                  href={`mailto:${site.email}`}
                  className="font-display mt-1 block text-xl sm:text-2xl"
                >
                  {site.email}
                </a>
              </div>
              <CopyButton value={site.email} label={d.copyEmail} doneLabel={d.copied} />
            </li>
          )}
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-5"
              >
                <span className="font-display text-2xl font-semibold transition-colors group-hover:text-signal sm:text-3xl">
                  {c.label}
                  <span className="sr-only"> {dict.common.external}</span>
                </span>
                <ArrowUpRight className="size-6 shrink-0 text-subtle transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden="true" />
          {d.location}: {site.location}
        </p>
        <p className="mt-2 text-sm text-subtle">{d.noForm}</p>
      </Reveal>
      </div>
    </Container>
  );
}

export default function ContactPage(props: PageProps<"/[lang]/contact">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ContactPageContent {...props} />
    </Suspense>
  );
}
