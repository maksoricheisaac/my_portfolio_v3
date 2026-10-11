import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectMockup } from "@/components/project/project-mockup";
import {
  ProjectShowcase,
  type ShowcaseItem,
} from "@/components/sections/project-showcase";
import { Reveal } from "@/components/motion/reveal";
import { Container, PageHeader } from "@/components/site/section";
import { getDictionary } from "@/content/dictionaries";
import { publishedProjects, type Project } from "@/content/projects";
import { hasLocale, href, t, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = await getDictionary(lang);
  return pageMetadata({ lang, route: "projects", ...meta.pages.projects });
}

/** The most frequent technologies across the published projects (derived, never invented). */
function recurringStack(list: Project[], n = 4): string[] {
  const counts = new Map<string, number>();
  for (const p of list) for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([s]) => s);
}

export default async function ProjectsPage({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.projects;

  const items: ShowcaseItem[] = publishedProjects.map((p) => {
    const accent = p.domain === "devops" ? "infra" : "signal";
    return {
      slug: p.slug,
      url: href(lang as Locale, "projects", p.slug),
      category: p.category,
      tagline: t(p.tagline, lang),
      title: p.title,
      summary: t(p.summary, lang),
      problem: t(p.problem, lang),
      contribution: t(p.contribution, lang),
      status: d.status[p.status],
      stack: p.stack,
      stackLabel: p.stackPlanned ? d.stackPlanned : d.stackLabel,
      links: [
        p.links?.live && { label: d.linkLabels.live, url: p.links.live },
        p.links?.site && { label: d.linkLabels.site, url: p.links.site },
        p.links?.repo && { label: d.linkLabels.repo, url: p.links.repo },
      ].filter((l): l is { label: string; url: string } => Boolean(l)),
      accent,
      visual: <ProjectMockup kind={p.visual} accent={accent} />,
    };
  });

  const domains = new Set(publishedProjects.map((p) => p.category)).size;
  const stats = [
    { label: d.stats.projects, value: String(publishedProjects.length) },
    { label: d.stats.domains, value: String(domains) },
    { label: d.stats.stack, value: recurringStack(publishedProjects).join(" · ") },
  ];

  return (
    <Container className="py-16 sm:py-24">
      <PageHeader eyebrow={dict.nav.projects} title={d.title} intro={d.intro} />

      <Reveal as="dl" delay={0.1} className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-5">
            <dt className="eyebrow">{s.label}</dt>
            <dd className="font-display mt-2 text-2xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </Reveal>

      <div className="mt-12">
        <ProjectShowcase
          items={items}
          labels={{
            filterLabel: d.filterLabel,
            filters: d.filters,
            problem: d.problem,
            contribution: d.contribution,
            previewNote: d.previewNote,
            viewCase: d.viewCase,
            empty: d.emptyFilter,
            external: dict.common.external,
          }}
        />
      </div>
    </Container>
  );
}
