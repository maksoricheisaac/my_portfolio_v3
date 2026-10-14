import { ProjectMockup } from "@/components/project/project-mockup";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

/** True when the project has a real image uploaded from the admin. */
export function hasCover(project: Pick<Project, "cover">): boolean {
  return Boolean(project.cover?.url);
}

/**
 * The project's real cover image when one was uploaded, otherwise the conceptual CSS mockup.
 * A plain <img> is used on purpose: the URL is a relative `/backend/media/*` path proxied to
 * the API, which next/image's optimiser would have to re-fetch.
 */
export function ProjectVisual({
  project,
  accent,
  className,
}: {
  project: Pick<Project, "cover" | "visual" | "title">;
  accent: "signal" | "infra";
  className?: string;
}) {
  const cover = project.cover;
  if (!cover?.url) return <ProjectMockup kind={project.visual} accent={accent} />;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover.url}
        alt={cover.alt || project.title}
        width={cover.width ?? 1200}
        height={cover.height ?? 630}
        loading="lazy"
        decoding="async"
        className="aspect-[1200/630] h-auto w-full object-cover"
      />
    </div>
  );
}
