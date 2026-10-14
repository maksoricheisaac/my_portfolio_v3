import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { API_URL } from "@/lib/api-url";
import { projects as fallbackProjects, type Project } from "@/content/projects";

/**
 * Server-side client of the NestJS API (public, read-only endpoints).
 * Every read degrades gracefully: when the API is unreachable the site keeps serving the
 * built-in content (content/projects.ts) so a back-end outage never takes the portfolio down.
 */

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Published projects, ordered. */
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const remote = await getJson<Project[]>("/public/projects");
  return remote ?? fallbackProjects.filter((p) => p.published);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

// ───────────── site settings (SEO / profile) ─────────────

export interface SiteSettings {
  seo: {
    siteTitle: { fr: string; en: string };
    description: { fr: string; en: string };
    keywords: { fr: string; en: string };
    twitterHandle: string;
    indexable: boolean;
    googleSiteVerification: string;
  };
  profile: {
    name: string;
    jobTitle: { fr: string; en: string };
    location: string;
    email: string;
    linkedin: string;
    github: string;
    whatsapp: string;
    availability: { fr: string; en: string };
  };
}

/** null until the owner saved settings in the admin: built-in defaults then apply. */
export async function getSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheTag("settings");
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const res = await getJson<{ settings: SiteSettings | null }>("/public/settings");
  return res?.settings ?? null;
}
