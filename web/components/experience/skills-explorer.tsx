"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { ui } from "@/content/experience";
import { skillGroups, type Skill } from "@/content/skills";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface SkillProject {
  slug: string;
  title: string;
  stack: string[];
  href: string;
}

const domains = [
  { id: "fullstack", groups: ["frontend", "backend", "data"] },
  { id: "devops", groups: ["devops", "quality"] },
  { id: "infra", groups: ["infra"] },
] as const;

type DomainId = (typeof domains)[number]["id"];

/**
 * Three domains, each listing technologies. Switching domain re-orders the chips with a layout
 * animation; selecting a technology shows its role, honest status and the related project when
 * one actually lists it in its stack. No percentages, no invented levels.
 */
export function SkillsExplorer({ lang, projects }: { lang: Locale; projects: SkillProject[] }) {
  const [domain, setDomain] = useState<DomainId>("fullstack");
  const [selected, setSelected] = useState<string | null>(null);
  const baseId = useId();
  const u = ui.skills;

  const groups = skillGroups.filter((g) =>
    (domains.find((d) => d.id === domain)!.groups as readonly string[]).includes(g.id),
  );
  const skills: (Skill & { group: string })[] = groups.flatMap((g) =>
    g.skills.map((s) => ({ ...s, group: t(g.title, lang) })),
  );
  const current = skills.find((s) => s.name === selected) ?? skills[0];
  const related = projects.filter((p) =>
    p.stack.some((s) => s.toLowerCase() === current.name.toLowerCase()),
  );

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = domains.length;
    const next = domains[(i + (e.key === "ArrowRight" ? 1 : n - 1)) % n].id;
    setDomain(next);
    setSelected(null);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section id="expertise" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
      <Container>
        <Reveal className="max-w-3xl">
          <p className="eyebrow">
            <span className="text-signal">/</span> {t(u.eyebrow, lang)}
          </p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {t(u.title, lang)}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">{t(u.intro, lang)}</p>
        </Reveal>

        <div className="mt-12">
          <div role="tablist" aria-label={t(u.eyebrow, lang)} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border">
            {domains.map((d, i) => {
              const active = d.id === domain;
              return (
                <button
                  key={d.id}
                  id={`${baseId}-tab-${d.id}`}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => {
                    setDomain(d.id);
                    setSelected(null);
                  }}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    "font-display relative -mb-px pb-4 text-xl font-semibold uppercase tracking-tight transition-colors sm:text-2xl",
                    active ? "text-foreground" : "text-subtle hover:text-foreground",
                  )}
                >
                  {t(u.domains[d.id], lang)}
                  {active && (
                    <motion.span
                      layoutId={`${baseId}-underline`}
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-signal"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${domain}`}
            className="mt-10 grid gap-10 lg:grid-cols-12"
          >
            <ul className="flex flex-wrap content-start gap-3 lg:col-span-7">
              <AnimatePresence mode="popLayout" initial={false}>
                {skills.map((s) => {
                  const isSel = s.name === current.name;
                  return (
                    <motion.li
                      key={s.name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <button
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => setSelected(s.name)}
                        className={cn(
                          "font-display border px-5 py-3 text-lg font-semibold transition-colors",
                          isSel
                            ? "border-signal bg-signal text-primary-foreground"
                            : "border-border bg-surface hover:border-foreground/40",
                          s.level === "learning" && !isSel && "border-dashed",
                        )}
                      >
                        {s.name}
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div aria-live="polite" className="border border-border bg-surface p-6 sm:p-8 lg:col-span-5">
              <p className="eyebrow">{current.group}</p>
              <h3 className="font-display mt-3 text-3xl font-semibold">{current.name}</h3>

              <p className="eyebrow mt-6">{t(u.role, lang)}</p>
              <p className="mt-2 text-pretty text-muted-foreground">{t(current.usedFor, lang)}</p>

              <p className="eyebrow mt-6">{t(u.status, lang)}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    current.level === "practice" ? "bg-signal" : "border border-foreground",
                  )}
                  aria-hidden="true"
                />
                {t(u[current.level], lang)}
              </p>

              <p className="eyebrow mt-6">{t(u.project, lang)}</p>
              {related.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={p.href}
                        className="group inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                      >
                        {p.title}
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t(u.noProject, lang)}</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
