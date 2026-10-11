import type { MetadataRoute } from "next";
import { publishedProjects } from "@/content/projects";
import { href, locales, type RouteKey } from "@/lib/i18n";
import { site } from "@/lib/site";

const pages: RouteKey[] = ["home", "projects", "about", "skills", "contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { route: RouteKey; rest: string[] }[] = [
    ...pages.map((route) => ({ route, rest: [] as string[] })),
    ...publishedProjects.map((p) => ({ route: "projects" as const, rest: [p.slug] })),
  ];

  return entries.flatMap(({ route, rest }) =>
    locales.map((lang) => ({
      url: `${site.url}${href(lang, route, ...rest)}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}${href(l, route, ...rest)}`]),
        ),
      },
    })),
  );
}
