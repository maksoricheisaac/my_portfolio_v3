import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { GlowCard } from "@/components/site/glow-card";
import { Container, SectionHeading } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Domain = Dictionary["expertise"]["fullstack"];

function Panel({
  domain,
  data,
  more,
  lang,
}: {
  domain: "fullstack" | "devops";
  data: Domain;
  more: string;
  lang: Locale;
}) {
  const isFull = domain === "fullstack";
  return (
    <Reveal delay={isFull ? 0 : 0.15} className="h-full">
    <GlowCard
      glow={isFull ? "var(--signal)" : "var(--infra)"}
      className="flex h-full flex-col p-7 sm:p-9"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]",
            isFull ? "border-signal/40 text-signal" : "border-infra/40 text-infra",
          )}
        >
          {data.tag}
        </span>
        <span className="font-mono text-xs text-subtle">{isFull ? "01" : "02"}</span>
      </div>

      <h3 className="font-display mt-8 text-3xl font-semibold sm:text-4xl">{data.title}</h3>
      <p className="mt-3 text-muted-foreground">{data.text}</p>

      {/* Flow: Full-Stack is a layered stack, DevOps is a delivery pipeline. */}
      <ol
        className={cn(
          "mt-8 gap-2",
          isFull ? "flex flex-col" : "flex flex-wrap items-center",
        )}
      >
        {data.flow.map((step, i) => (
          <li
            key={step}
            className={cn(
              "font-mono text-xs",
              isFull
                ? cn(
                    "rounded-lg border border-border bg-background/60 px-4 py-3",
                    i === 0 && "ml-0",
                    i === 1 && "ml-4",
                    i === 2 && "ml-8",
                  )
                : "flex items-center gap-2",
            )}
          >
            {isFull ? (
              <>
                <span className="mr-2 text-signal">0{i + 1}</span>
                {step}
              </>
            ) : (
              <>
                <span className="rounded-md border border-infra/30 bg-background/60 px-3 py-2">
                  {step}
                </span>
                {i < data.flow.length - 1 && (
                  <ArrowRight className="size-3.5 text-infra" aria-hidden="true" />
                )}
              </>
            )}
          </li>
        ))}
      </ol>

      <ul className="mt-8 flex flex-col gap-3 text-sm">
        {data.points.map((p) => (
          <li key={p} className="flex gap-3">
            <span
              className={cn(
                "mt-2 size-1.5 shrink-0 rounded-full",
                isFull ? "bg-signal" : "bg-infra",
              )}
              aria-hidden="true"
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`${href(lang, "skills")}#${isFull ? "fullstack" : "devops"}`}
        className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        {more}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </GlowCard>
    </Reveal>
  );
}

export function Expertise({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const d = dict.expertise;
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={d.eyebrow} title={d.title} intro={d.intro} />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Panel domain="fullstack" data={d.fullstack} more={d.more} lang={lang} />
          <Panel domain="devops" data={d.devops} more={d.more} lang={lang} />
        </div>
      </Container>
    </section>
  );
}
