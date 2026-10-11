export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A string available in both languages. */
export type Localized = Record<Locale, string>;

export function t(value: Localized, lang: Locale): string {
  return value[lang];
}

/** Public path segment of each page, per language. */
export const routes = {
  home: { fr: "", en: "" },
  projects: { fr: "projets", en: "projects" },
  about: { fr: "a-propos", en: "about" },
  skills: { fr: "competences", en: "skills" },
  contact: { fr: "contact", en: "contact" },
} as const satisfies Record<string, Localized>;

export type RouteKey = keyof typeof routes;

export function href(lang: Locale, key: RouteKey, ...rest: string[]): string {
  const parts = [lang, routes[key][lang], ...rest].filter(Boolean);
  return `/${parts.join("/")}`;
}

/**
 * Resolve a path segment to its route. Accepts any language's segment: prerendered HTML is built
 * for the internal folder name (/fr/projects) while the browser shows /fr/projets.
 */
export function routeKeyOf(segment: string): RouteKey | undefined {
  return (Object.keys(routes) as RouteKey[]).find(
    (k) => k !== "home" && locales.some((l) => routes[k][l] === segment),
  );
}

/** Translate a current pathname (/fr/projets/x) into the equivalent in another language. */
export function switchPath(pathname: string, to: Locale): string {
  const [, from, segment, ...rest] = pathname.split("/");
  if (!hasLocale(from)) return `/${to}`;
  if (!segment) return `/${to}`;
  const key = routeKeyOf(segment);
  if (!key) return `/${to}`;
  return `/${[to, routes[key][to], ...rest].filter(Boolean).join("/")}`;
}
