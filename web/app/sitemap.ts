import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/api";
import { href, locales, type RouteKey } from "@/lib/i18n";
import { site } from "@/lib/site";

const pages: { route: RouteKey; priority: number }[] = [
  { route: "home", priority: 1 },
  { route: "projects", priority: 0.9 },
  { route: "about", priority: 0.6 },
  { route: "skills", priority: 0.6 },
  { route: "contact", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const entries: {
    route: RouteKey;
    rest: string[];
    priority: number;
    lastModified?: Date;
  }[] = [
    ...pages.map((p) => ({ route: p.route, rest: [] as string[], priority: p.priority })),
    ...projects.map((p) => ({
      route: "projects" as const,
      rest: [p.slug],
      priority: 0.8,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    })),
  ];

  return entries.flatMap(({ route, rest, priority, lastModified }) =>
    locales.map((lang) => ({
      url: `${site.url}${href(lang, route, ...rest)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}${href(l, route, ...rest)}`]),
        ),
      },
    })),
  );
}
