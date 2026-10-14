"use client";

import { useState } from "react";
import { Container } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { architecture, ui, type ArchNode } from "@/content/experience";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const labelOf = (id: string, lang: Locale) =>
  t(architecture.nodes.find((n) => n.id === id)!.label, lang);

/**
 * Teaching model of a web application. The same buttons are rendered as a positioned diagram
 * (md+) and as a plain list (mobile), so it works with keyboard, touch and screen readers.
 * Selecting a node highlights it, lights up its links and fills the description panel.
 */
export function ArchitectureExplorer({ lang }: { lang: Locale }) {
  const [selected, setSelected] = useState<string | null>("api");
  const node = architecture.nodes.find((n) => n.id === selected) ?? null;
  const u = ui.architecture;

  const linkActive = ([a, b]: [string, string]) => selected !== null && (a === selected || b === selected);
  const connected = new Set(
    architecture.links.filter(linkActive).flatMap(([a, b]) => [a, b]),
  );

  const out = node ? architecture.links.filter(([a]) => a === node.id).map(([, b]) => b) : [];
  const inn = node ? architecture.links.filter(([, b]) => b === node.id).map(([a]) => a) : [];

  const button = (n: ArchNode, className: string, style?: React.CSSProperties) => {
    const isSel = n.id === selected;
    const isNear = !isSel && connected.has(n.id);
    return (
      <button
        key={n.id}
        type="button"
        aria-pressed={isSel}
        onClick={() => setSelected(isSel ? null : n.id)}
        style={style}
        className={cn(
          "font-mono border px-3.5 py-2.5 text-left text-xs uppercase tracking-[0.12em] transition-colors",
          isSel
            ? "border-signal bg-signal text-primary-foreground"
            : isNear
              ? "border-signal/70 bg-surface-2 text-foreground"
              : "border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          className,
        )}
      >
        {t(n.label, lang)}
      </button>
    );
  };

  return (
    <section id="architecture" className="scroll-mt-20 border-t border-border py-24 sm:py-32">
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

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {/* Diagram (md+) */}
          <div
            role="group"
            aria-label={t(u.diagram, lang)}
            className="relative hidden aspect-[16/9] border border-border bg-surface/40 md:block lg:col-span-7"
          >
            <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              {architecture.links.map(([a, b]) => {
                const na = architecture.nodes.find((n) => n.id === a)!;
                const nb = architecture.nodes.find((n) => n.id === b)!;
                const active = linkActive([a, b]);
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={active ? 2 : 1}
                    className={cn(
                      "transition-[stroke] duration-300",
                      active ? "flow-line stroke-signal" : "stroke-foreground/25",
                    )}
                    strokeDasharray={active ? "6 6" : undefined}
                  />
                );
              })}
            </svg>
            {architecture.nodes.map((n) =>
              button(n, "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap", {
                left: `${n.x}%`,
                top: `${n.y}%`,
              }),
            )}
          </div>

          {/* Same nodes as a list (mobile) */}
          <ul className="grid gap-2 md:hidden" aria-label={t(u.diagram, lang)}>
            {architecture.nodes.map((n) => (
              <li key={n.id}>{button(n, "w-full")}</li>
            ))}
          </ul>

          {/* Description panel */}
          <div
            aria-live="polite"
            className="border border-border bg-surface p-6 sm:p-8 lg:col-span-5"
          >
            {node ? (
              <>
                <p className="eyebrow">{t(u.role, lang)}</p>
                <h3 className="font-display mt-3 text-3xl font-semibold">{t(node.label, lang)}</h3>
                <p className="mt-4 text-pretty text-muted-foreground">{t(node.role, lang)}</p>

                <p className="eyebrow mt-7">{t(u.tech, lang)}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {node.tech.map((tech) => (
                    <li key={tech} className="font-mono border border-border px-2.5 py-1 text-xs">
                      {tech}
                    </li>
                  ))}
                </ul>

                {(out.length > 0 || inn.length > 0) && (
                  <dl className="mt-7 space-y-3 text-sm">
                    {inn.length > 0 && (
                      <div>
                        <dt className="eyebrow">{t(u.receivesFrom, lang)}</dt>
                        <dd className="mt-1">{inn.map((id) => labelOf(id, lang)).join(" · ")}</dd>
                      </div>
                    )}
                    {out.length > 0 && (
                      <div>
                        <dt className="eyebrow">{t(u.connectedTo, lang)}</dt>
                        <dd className="mt-1">{out.map((id) => labelOf(id, lang)).join(" · ")}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <p className="eyebrow mt-7">{t(u.example, lang)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(node.example, lang)}</p>
              </>
            ) : (
              <p className="text-muted-foreground">{t(u.hint, lang)}</p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
