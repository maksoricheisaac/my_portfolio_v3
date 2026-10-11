import Link from "next/link";
import { Logo } from "@/components/site/logo";
import type { Dictionary } from "@/content/dictionaries";
import { href, type Locale, type RouteKey } from "@/lib/i18n";
import { site } from "@/lib/site";

const links: RouteKey[] = ["projects", "skills", "about", "contact"];

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const external = [
    { label: "LinkedIn", url: site.linkedin },
    { label: "GitHub", url: site.github },
    { label: "WhatsApp", url: site.whatsapp },
  ].filter((l): l is { label: string; url: string } => Boolean(l.url));

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo className="size-11" />
          <p className="font-display text-xl">{site.name}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {dict.footer.tagline} · {site.location}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
          {links.map((key) => (
            <Link
              key={key}
              href={href(lang, key)}
              className="w-fit text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.nav[key]}
            </Link>
          ))}
        </nav>
        <ul className="flex flex-col gap-3 text-sm">
          {external.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="sr-only"> {dict.common.external}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border">
        <p className="font-mono mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-5 text-xs text-subtle sm:px-8">
          <span>
            © {site.name}. {dict.footer.rights}
          </span>
          <span>{dict.footer.built}</span>
        </p>
      </div>
    </footer>
  );
}
