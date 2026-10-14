import type { Metadata } from "next";
import { href, locales, type Locale, type RouteKey } from "@/lib/i18n";
import { site } from "@/lib/site";

/** Absolute URL for a site-relative path (or returns absolute URLs untouched). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Per-page metadata: canonical, hreflang alternates, Open Graph and Twitter cards. */
export function pageMetadata(opts: {
  lang: Locale;
  route: RouteKey;
  rest?: string[];
  title: string;
  description: string;
  /** Social-sharing image (site-relative or absolute). Falls back to the generated OG image. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** ISO date of the last content change. */
  modified?: string;
}): Metadata {
  const { lang, route, rest = [], title, description, image, imageAlt, type = "website", modified } = opts;
  const languages = Object.fromEntries(
    locales.map((l) => [l, href(l, route, ...rest)]),
  );
  const images = image
    ? [{ url: absoluteUrl(image), alt: imageAlt ?? title }]
    : undefined;
  return {
    title,
    description,
    alternates: {
      canonical: href(lang, route, ...rest),
      languages: { ...languages, "x-default": href("fr", route, ...rest) },
    },
    openGraph: {
      title,
      description,
      url: href(lang, route, ...rest),
      siteName: site.name,
      locale: lang === "fr" ? "fr_FR" : "en_US",
      alternateLocale: lang === "fr" ? "en_US" : "fr_FR",
      type,
      ...(type === "article" && modified ? { modifiedTime: modified } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}
