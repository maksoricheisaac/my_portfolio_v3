import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";
import { skillGroups } from "@/content/skills";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Stack({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const d = dict.stack;
  return (
    <section className="border-t border-border bg-surface/40 py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} />
          {/* Legend: shape + text, not colour alone. */}
          <ul className="font-mono flex flex-wrap gap-5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-foreground" aria-hidden="true" />
              {d.legend.practice}
            </li>
            <li className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full border border-foreground"
                aria-hidden="true"
              />
              {d.legend.learning}
            </li>
          </ul>
        </div>

        <Stagger className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <StaggerItem key={group.id}>
              <h3
                className={cn(
                  "font-mono border-b pb-3 text-xs uppercase tracking-[0.18em]",
                  group.domain === "fullstack"
                    ? "border-signal/40 text-signal"
                    : "border-infra/40 text-infra",
                )}
              >
                {t(group.title, lang)}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm"
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        s.level === "practice"
                          ? "bg-foreground"
                          : "border border-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {s.name}
                    <span className="sr-only">
                      ({s.level === "practice" ? d.legend.practice : d.legend.learning})
                    </span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
