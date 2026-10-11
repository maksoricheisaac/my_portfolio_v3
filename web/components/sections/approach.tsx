import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/site/section";
import type { Dictionary } from "@/content/dictionaries";

export function Approach({ dict }: { dict: Dictionary }) {
  const d = dict.approach;
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={d.eyebrow} title={d.title} intro={d.note} />
        <Stagger as="ol" gap={0.1} className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {d.steps.map((step, i) => (
            <StaggerItem
              as="li"
              key={step.title}
              className="group relative flex flex-col bg-background p-6 transition-colors hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className="font-display text-5xl font-semibold text-foreground/15 transition-colors group-hover:text-signal"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-10 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
