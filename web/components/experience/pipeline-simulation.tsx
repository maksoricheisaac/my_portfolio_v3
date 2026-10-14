"use client";

import { useEffect, useState } from "react";
import { Check, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { pipeline, ui } from "@/content/experience";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEP_MS = 900;

type Phase = "idle" | "running" | "done";

/**
 * Local, timer-driven simulation of a delivery pipeline. Nothing is executed or sent anywhere:
 * the badge says so, and the log is generated from `content/experience.ts`.
 * `current` is the index of the step being "run"; steps before it are passed.
 */
export function PipelineSimulation({ lang }: { lang: Locale }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [current, setCurrent] = useState(-1);
  const [focus, setFocus] = useState(0);
  const u = ui.pipeline;

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setTimeout(() => {
      if (current + 1 >= pipeline.length) setPhase("done");
      else setCurrent(current + 1);
    }, current === -1 ? 400 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [phase, current]);

  // Selecting the running step follows the simulation unless the visitor picked another one.
  const shown = pipeline[phase === "running" && current >= 0 ? current : focus];

  const start = () => {
    setCurrent(-1);
    setPhase("running");
    setFocus(0);
  };

  const status = (i: number): "idle" | "active" | "passed" => {
    if (phase === "done") return "passed";
    if (phase === "idle") return "idle";
    return i < current ? "passed" : i === current ? "active" : "idle";
  };
  const passedCount = phase === "done" ? pipeline.length : Math.max(0, current);
  const logLines = pipeline.slice(0, phase === "done" ? pipeline.length : current < 0 ? 0 : current);

  return (
    <section id="pipeline" className="scroll-mt-20 border-t border-border bg-surface/30 py-24 sm:py-32">
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

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={start}
            disabled={phase === "running"}
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
          >
            {phase === "done" ? (
              <RotateCcw className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {phase === "idle" ? t(u.run, lang) : phase === "running" ? t(u.running, lang) : t(u.replay, lang)}
          </button>
          <p className="font-mono inline-flex items-center gap-2 border border-dashed border-foreground/30 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            {t(u.badge, lang)}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Steps with a connecting line that fills as steps pass */}
          <ol className="relative lg:col-span-6">
            <span className="absolute bottom-6 left-[1.05rem] top-6 w-px bg-border" aria-hidden="true" />
            <motion.span
              className="absolute left-[1.05rem] top-6 w-px origin-top bg-signal"
              style={{ height: "calc(100% - 3rem)" }}
              animate={{ scaleY: passedCount / (pipeline.length - 1 || 1) }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              aria-hidden="true"
            />
            {pipeline.map((step, i) => {
              const s = status(i);
              const isShown = shown.id === step.id;
              return (
                <li key={step.id} className="relative">
                  <button
                    type="button"
                    onClick={() => phase !== "running" && setFocus(i)}
                    aria-current={isShown ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-4 py-3 pr-2 text-left transition-colors",
                      isShown ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono relative z-10 grid size-[2.1rem] shrink-0 place-items-center border text-xs transition-colors",
                        s === "passed" && "border-signal bg-signal text-primary-foreground",
                        s === "active" && "border-signal bg-background text-signal",
                        s === "idle" && "border-border bg-background",
                      )}
                    >
                      {s === "passed" ? <Check className="size-4" aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl font-semibold">{step.label}</span>
                    <span className="font-mono ml-auto text-[0.7rem] uppercase tracking-[0.14em]">
                      {t(u[s === "idle" ? "idle" : s === "active" ? "active" : "passed"], lang)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="space-y-6 lg:col-span-6">
            <div aria-live="polite" className="border border-border bg-surface p-6 sm:p-8">
              <p className="eyebrow">{t(u.stepRole, lang)}</p>
              <h3 className="font-display mt-3 text-2xl font-semibold">{shown.label}</h3>
              <p className="mt-3 text-pretty text-muted-foreground">{t(shown.role, lang)}</p>
            </div>

            <div className="font-mono border border-border bg-background p-5 text-xs leading-relaxed">
              <p className="eyebrow mb-3">{t(u.log, lang)}</p>
              {logLines.length === 0 ? (
                <p className="text-subtle">{t(u.emptyLog, lang)}</p>
              ) : (
                <ul className="space-y-1" aria-live="polite">
                  {logLines.map((step, i) => (
                    <li key={step.id} className="flex gap-3">
                      <span className="text-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-signal">✓</span>
                      <span>
                        {step.label} — <span className="text-muted-foreground">{t(step.log, lang)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {phase === "done" && (
                <p className="mt-4 border-t border-border pt-3 text-signal" role="status">
                  {t(u.done, lang)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
