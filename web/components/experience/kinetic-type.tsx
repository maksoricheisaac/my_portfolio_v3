"use client";

/**
 * Kinetic typography driven by a single scroll progress value (0 → 1 while the section crosses
 * the viewport). Each word has its own parallax speed and direction; letters are revealed
 * through masks in sequence; the second word changes scale; the whole composition settles
 * back (opacity) to hand over to the next section. Layout never shifts: only transforms and
 * opacity are animated. Reduced motion: all transforms are dropped, text is fully visible.
 */
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/site/section";
import { kinetic } from "@/content/experience";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function Letter({
  char,
  progress,
  from,
  to,
  reduce,
}: {
  char: string;
  progress: MotionValue<number>;
  from: number;
  to: number;
  reduce: boolean;
}) {
  const y = useTransform(progress, [from, to], ["105%", "0%"]);
  return (
    <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
      <motion.span className="inline-block" style={reduce ? undefined : { y }}>
        {char}
      </motion.span>
    </span>
  );
}

function Line({
  word,
  index,
  progress,
  reduce,
  note,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
  note?: string;
}) {
  // Alternate direction, vary speed per line.
  const dir = index % 2 === 0 ? 1 : -1;
  const travel = 6 + index * 3; // % of the line width
  const x = useTransform(progress, [0, 1], [`${dir * travel}%`, `${-dir * travel}%`]);
  const scale = useTransform(progress, [0.25, 0.5], [index === 1 ? 0.78 : 1, 1]);
  const opacity = useTransform(progress, [0.78, 1], [1, 0.25]);
  const start = 0.12 + index * 0.08;
  const outlined = index === 1;

  return (
    <motion.div
      style={reduce ? undefined : { x, scale, opacity, transformOrigin: "left center" }}
      className="relative"
    >
      <p
        aria-hidden="true"
        className={cn(
          "font-display whitespace-nowrap font-semibold leading-[0.9] tracking-tight",
          "text-[clamp(3rem,15.5vw,14rem)]",
          outlined && "text-muted-foreground",
          index === 2 && "text-signal",
        )}
      >
        {[...word].map((c, i) => (
          <Letter
            key={i}
            char={c}
            progress={progress}
            from={start + i * 0.012}
            to={start + 0.16 + i * 0.012}
            reduce={reduce}
          />
        ))}
      </p>
      {note && (
        <span className="font-mono mt-1 block text-[0.7rem] uppercase tracking-[0.18em] text-subtle lg:absolute lg:right-0 lg:top-[18%] lg:mt-0 lg:max-w-[16rem] lg:text-right">
          {note}
        </span>
      )}
    </motion.div>
  );
}

export function KineticType({ lang }: { lang: Locale }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const caption = t(kinetic.caption, lang);
  const words = kinetic.words.map((w) => t(w, lang));

  return (
    <section
      ref={ref}
      aria-label={words.join(" ")}
      className="relative overflow-hidden border-y border-border py-24 sm:py-36"
    >
      <Container>
        <h2 className="sr-only">{words.join(" ")}</h2>
        <div className="flex flex-col gap-2 sm:gap-4">
          {words.map((word, i) => {
            const note = kinetic.notes.find((n) => n.word === i);
            return (
            <Line
              key={word}
              word={word}
              index={i}
              progress={scrollYProgress}
              reduce={reduce}
              note={note && t(note.text, lang)}
            />
            );
          })}
        </div>
        <p className="mt-12 max-w-xl text-pretty text-lg text-muted-foreground">{caption}</p>
      </Container>
    </section>
  );
}
