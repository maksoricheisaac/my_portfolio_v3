import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/sections/contact-cta";
import { Reveal } from "@/components/motion/reveal";
import { Container, PageHeader } from "@/components/site/section";
import { getDictionary } from "@/content/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = await getDictionary(lang);
  return pageMetadata({ lang, route: "about", ...meta.pages.about });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.about;

  return (
    <>
      <Container className="py-20 sm:py-28">
        <PageHeader eyebrow={d.eyebrow} title={d.title} />

        <div className="mt-20 grid gap-16 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            {d.blocks.map((b, i) => (
              <Reveal as="section" key={b.title}>
                <p className="font-mono text-xs text-subtle">0{i + 1}</p>
                <h2 className="font-display mt-2 text-2xl font-semibold">{b.title}</h2>
                <p className="mt-3 text-lg text-muted-foreground">{b.text}</p>
              </Reveal>
            ))}
          </div>

          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            <Reveal as="section" delay={0.1} className="rounded-2xl border border-border bg-surface p-7">
              <h2 className="eyebrow text-signal">{d.principlesTitle}</h2>
              <ul className="mt-5 space-y-4">
                {d.principles.map((p) => (
                  <li key={p} className="flex gap-3 text-sm">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
                      aria-hidden="true"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal as="section" delay={0.2}>
              <h2 className="eyebrow">{d.goalsTitle}</h2>
              <p className="mt-4 text-muted-foreground">{d.goals}</p>
            </Reveal>
          </aside>
        </div>
      </Container>
      <ContactCta lang={lang} dict={dict} />
    </>
  );
}
