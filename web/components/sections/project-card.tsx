import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectVisual } from "@/components/project/project-visual";
import { GlowCard } from "@/components/site/glow-card";
import type { Dictionary } from "@/content/dictionaries";
import type { Project } from "@/content/projects";
import { href, t, type Locale } from "@/lib/i18n";

/** Compact card used on the home page and in "other projects". */
export function ProjectCard({
  project,
  lang,
  dict,
}: {
  project: Project;
  lang: Locale;
  dict: Dictionary;
}) {
  const accent = project.domain === "devops" ? "infra" : "signal";
  return (
    <GlowCard
      glow={`var(--${accent})`}
      className="group flex h-full flex-col gap-5 p-5 transition-transform duration-300 hover:-translate-y-1"
    >
      <ProjectVisual project={project} accent={accent} />
      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="eyebrow">{t(project.tagline, lang)}</p>
        <h3 className="font-display mt-2 text-2xl font-semibold">
          <Link
            href={href(lang, "projects", project.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">{t(project.summary, lang)}</p>
        <p className="font-mono mt-4 text-xs text-subtle">
          {dict.projects.status[project.status]}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal">
          {dict.projects.viewCase}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </GlowCard>
  );
}
