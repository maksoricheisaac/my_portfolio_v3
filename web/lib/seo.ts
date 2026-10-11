import type { Metadata } from "next";
import { href, locales, type Locale, type RouteKey } from "@/lib/i18n";
import { site } from "@/lib/site";

/** Per-page metadata: canonical, hreflang alternates and Open Graph. */
export function pageMetadata(opts: {
  lang: Locale;
  route: RouteKey;
  rest?: string[];
  title: string;
  description: string;
}): Metadata {
  const { lang, route, rest = [], title, description } = opts;
  const languages = Object.fromEntries(
    locales.map((l) => [l, href(l, route, ...rest)]),
  );
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
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
