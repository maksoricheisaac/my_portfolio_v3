import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { ArchitectureDiagram } from "@/components/project/architecture-diagram";
import { ProjectMockup } from "@/components/project/project-mockup";
import { ContactCta } from "@/components/sections/contact-cta";
import { ProjectCard } from "@/components/sections/project-card";
import { Container } from "@/components/site/section";
import { getDictionary } from "@/content/dictionaries";
import { getProject, publishedProjects } from "@/content/projects";
import { hasLocale, href, locales, t, type Localized } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    publishedProjects.map((p) => ({ lang, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(lang) || !project) return {};
  return pageMetadata({
    lang,
    route: "projects",
    rest: [slug],
    title: project.title,
    description: t(project.summary, lang),
  });
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal
      as="section"
      className="grid gap-4 border-t border-border py-10 md:grid-cols-[14rem_1fr] md:gap-10"
    >
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="max-w-3xl space-y-4 text-muted-foreground">{children}</div>
    </Reveal>
  );
}

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(lang) || !project) notFound();
  const dict = await getDictionary(lang);
  const d = dict.projects;
  const s = d.sections;
  const accent = project.domain === "devops" ? "infra" : "signal";

  const list = (items: Localized[]) => (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span
            className={`mt-2.5 size-1.5 shrink-0 rounded-full ${accent === "infra" ? "bg-infra" : "bg-signal"}`}
            aria-hidden="true"
          />
          <span>{t(it, lang)}</span>
        </li>
      ))}
    </ul>
  );

  const related = (project.related ?? [])
    .map(getProject)
    .filter((p) => p !== undefined);

  const links = [
    project.links?.live && { label: d.linkLabels.live, url: project.links.live },
    project.links?.site && { label: d.linkLabels.site, url: project.links.site },
    project.links?.repo && { label: d.linkLabels.repo, url: project.links.repo },
  ].filter((l): l is { label: string; url: string } => Boolean(l));

  return (
    <>
      <Container className="py-14 sm:py-20">
        <Link
          href={href(lang, "projects")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dict.common.backToProjects}
        </Link>

        <div className="mt-10 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal y={12}>
              <p className="eyebrow">{t(project.tagline, lang)}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-display mt-4 text-balance text-6xl font-semibold leading-[0.98] sm:text-8xl">
                {project.title}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
                {t(project.summary, lang)}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3} className="lg:col-span-5">
            <ProjectMockup kind={project.visual} accent={accent} />
            <p className="font-mono mt-3 text-[0.7rem] text-subtle">{d.previewNote}</p>
          </Reveal>
        </div>

        <Reveal
          as="dl"
          className="mt-14 grid gap-6 border-y border-border py-6 sm:grid-cols-3"
        >
          <div>
            <dt className="eyebrow">{d.categories[project.category]}</dt>
            <dd className="mt-2 text-sm">{d.status[project.status]}</dd>
          </div>
          <div>
            <dt className="eyebrow">{d.contribution}</dt>
            <dd className="mt-2 text-sm">{t(project.contribution, lang)}</dd>
          </div>
          <div>
            <dt className="eyebrow">
              {project.stackPlanned ? d.stackPlanned : d.stackLabel}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((x) => (
                <span
                  key={x}
                  className="font-mono rounded-md border border-border px-2 py-1 text-xs"
                >
                  {x}
                </span>
              ))}
            </dd>
          </div>
        </Reveal>

        {project.confidential && (
          <p className="mt-6 border-l-2 border-infra/60 pl-4 text-sm text-muted-foreground">
            {d.confidential}
          </p>
        )}

        <div className="mt-6">
          <Block title={s.problem}>
            {project.context && <p>{t(project.context, lang)}</p>}
            <p className="text-foreground">{t(project.problem, lang)}</p>
          </Block>
          {project.goals && <Block title={s.goals}>{list(project.goals)}</Block>}
          {project.users && <Block title={s.users}>{list(project.users)}</Block>}
          {project.solution && (
            <Block title={s.solution}>
              <p>{t(project.solution, lang)}</p>
            </Block>
          )}
          {project.features && <Block title={s.features}>{list(project.features)}</Block>}
          {project.responsibilities && (
            <Block title={s.role}>{list(project.responsibilities)}</Block>
          )}
          {project.architecture && (
            <Reveal as="section" className="border-t border-border py-10">
              <h2 className="font-display mb-6 text-xl font-semibold">{s.architecture}</h2>
              <ArchitectureDiagram
                layers={project.architecture}
                lang={lang}
                label={d.diagramLabel}
              />
              {project.stackPlanned && (
                <p className="font-mono mt-4 text-[0.7rem] text-subtle">{d.stackPlanned}</p>
              )}
            </Reveal>
          )}
          {project.decisions && (
            <Block title={s.decisions}>
              <dl className="space-y-4">
                {project.decisions.map((c) => (
                  <div key={c.name}>
                    <dt className="text-foreground">{c.name}</dt>
                    <dd>{t(c.why, lang)}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}
          {project.challenges && (
            <Block title={s.challenges}>
              <ul className="space-y-5">
                {project.challenges.map((c, i) => (
                  <li key={i}>
                    <p className="text-foreground">
                      <span className="eyebrow mr-2">{d.challengeProblem}</span>
                      {t(c.problem, lang)}
                    </p>
                    <p>
                      <span className="eyebrow mr-2">{d.challengeSolution}</span>
                      {t(c.solution, lang)}
                    </p>
                  </li>
                ))}
              </ul>
            </Block>
          )}
          <Block title={s.state}>
            <p className="text-foreground">{d.status[project.status]}</p>
            {project.nextSteps && list(project.nextSteps)}
          </Block>
          {links.length > 0 && (
            <Block title={s.links}>
              <ul className="flex flex-wrap gap-5">
                {links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-signal underline-offset-4 hover:underline"
                    >
                      {l.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">{dict.common.external}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold">{s.related}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} lang={lang} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </Container>
      <ContactCta lang={lang} dict={dict} title={d.ctaTitle} text={d.ctaText} />
    </>
  );
}
