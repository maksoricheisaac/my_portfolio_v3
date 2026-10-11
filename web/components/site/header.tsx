"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { href, locales, routeKeyOf, switchPath, type Locale, type RouteKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface HeaderProps {
  lang: Locale;
  labels: {
    home: string;
    projects: string;
    about: string;
    skills: string;
    contact: string;
    menu: string;
    closeMenu: string;
    language: string;
    switchTo: string;
  };
}

const links: RouteKey[] = ["home", "projects", "skills", "about", "contact"];

export function Header({ lang, labels }: HeaderProps) {
  const pathname = usePathname();
  // The menu is open for one specific pathname, so navigating closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const [hovered, setHovered] = useState<RouteKey | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Compare route keys (not raw paths) so server and client agree despite localised rewrites.
  const segment = pathname.split("/")[2];
  const current: RouteKey | undefined = segment ? routeKeyOf(segment) : "home";
  const isActive = (key: RouteKey) => current === key;

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        className="pointer-events-auto mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-border bg-background/70 pl-2.5 pr-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <Link
          href={href(lang, "home")}
          className="flex items-center gap-2.5 rounded-full pr-2"
          aria-label="Riche Makso"
        >
          <Logo className="size-9" />
          <span className="font-display hidden text-base font-semibold lg:block">
            Riche Makso
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          <ul className="flex items-center" onMouseLeave={() => setHovered(null)}>
            {links.map((key) => {
              const active = isActive(key);
              return (
                <li key={key} onMouseEnter={() => setHovered(key)}>
                  <Link
                    href={href(lang, key)}
                    aria-current={active ? "page" : undefined}
                    onFocus={() => setHovered(key)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-sm transition-colors",
                      active || hovered === key
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {hovered === key && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-surface-2"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <span className="relative">{labels[key]}</span>
                    {active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Segmented language switch: both languages visible, current one marked. */}
          <div
            role="group"
            aria-label={labels.language}
            className="font-mono flex items-center rounded-full border border-border p-0.5 text-[0.7rem] uppercase tracking-widest"
          >
            {locales.map((l) =>
              l === lang ? (
                <span
                  key={l}
                  aria-current="true"
                  className="rounded-full bg-primary px-2.5 py-1 font-medium text-primary-foreground"
                >
                  {l}
                </span>
              ) : (
                <Link
                  key={l}
                  href={switchPath(pathname, l)}
                  hrefLang={l}
                  lang={l}
                  aria-label={labels.switchTo}
                  className="rounded-full px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </Link>
              ),
            )}
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-border md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? labels.closeMenu : labels.menu}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={menuId}
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto mx-auto mt-2 max-w-5xl rounded-3xl border border-border bg-background/95 p-3 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((key, i) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={href(lang, key)}
                    aria-current={isActive(key) ? "page" : undefined}
                    className={cn(
                      "font-display flex items-center justify-between rounded-2xl px-4 py-3.5 text-2xl",
                      isActive(key) ? "bg-surface-2 text-signal" : "text-foreground",
                    )}
                  >
                    {labels[key]}
                    <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
