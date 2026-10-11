import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/sections/contact-cta";
import { Reveal } from "@/components/motion/reveal";
import { Container, PageHeader } from "@/components/site/section";
import { getDictionary } from "@/content/dictionaries";
import { skillGroups } from "@/content/skills";
import { hasLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/skills">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = await getDictionary(lang);
  return pageMetadata({ lang, route: "skills", ...meta.pages.skills });
}

export default async function SkillsPage({ params }: PageProps<"/[lang]/skills">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.skills;

  const domains = [
    { id: "fullstack", title: dict.expertise.fullstack.title, accent: "signal" },
    { id: "devops", title: dict.expertise.devops.title, accent: "infra" },
  ] as const;

  return (
    <>
      <Container className="py-20 sm:py-28">
        <PageHeader eyebrow={d.eyebrow} title={d.title} intro={d.intro} />

        <div className="mt-20 space-y-24">
          {domains.map((domain) => (
            <section key={domain.id} id={domain.id} className="scroll-mt-24">
              <h2
                className={cn(
                  "font-display border-b pb-4 text-3xl font-semibold",
                  domain.accent === "signal" ? "border-signal/40" : "border-infra/40",
                )}
              >
                {domain.title}
              </h2>
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                {skillGroups
                  .filter((g) => g.domain === domain.id)
                  .map((group) => (
                    <Reveal key={group.id}>
                      <h3 className="eyebrow">{t(group.title, lang)}</h3>
                      <ul className="mt-4 divide-y divide-border">
                        {group.skills.map((s) => (
                          <li key={s.name} className="py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-display text-lg font-semibold">
                                {s.name}
                              </span>
                              <span
                                className={cn(
                                  "font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem]",
                                  s.level === "learning"
                                    ? "border-dashed border-foreground/40 text-muted-foreground"
                                    : "border-foreground/30",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    s.level === "practice"
                                      ? "bg-foreground"
                                      : "border border-foreground",
                                  )}
                                  aria-hidden="true"
                                />
                                {d.levels[s.level]}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {t(s.usedFor, lang)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
      <ContactCta lang={lang} dict={dict} />
    </>
  );
}
