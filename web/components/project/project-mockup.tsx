import type { VisualKind } from "@/content/projects";
import { cn } from "@/lib/utils";

/**
 * Abstract interface previews drawn in CSS. They illustrate the product idea;
 * they are NOT screenshots and are labelled as conceptual wherever they are shown.
 */
const bar = "rounded-full bg-foreground/10";
const block = "rounded-md border border-border bg-background/70";

function Frame({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent: "signal" | "infra";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        accent === "signal" ? "[--a:var(--signal)]" : "[--a:var(--infra)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className={cn(bar, "ml-3 h-2 w-24")} />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Marketplace() {
  return (
    <div className="grid grid-cols-[1fr_2.2fr] gap-3">
      <div className="space-y-2">
        <div className={cn(bar, "h-2 w-3/4")} />
        <div className={cn(bar, "h-2 w-1/2")} />
        <div className={cn(bar, "h-2 w-2/3")} />
        <div className="mt-4 h-6 rounded-md bg-[var(--a)]/80" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <div
              className="aspect-[3/4] rounded-sm border border-border"
              style={{
                background: `color-mix(in oklch, var(--a) ${14 + (i % 3) * 14}%, var(--background))`,
              }}
            />
            <div className={cn(bar, "h-1.5 w-4/5")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Studio() {
  return (
    <div className="space-y-3">
      <div className="font-display text-3xl font-semibold leading-none">
        Kivoa<span className="text-[var(--a)]">.</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["FlashMenu", "Maintivo"].map((n) => (
          <div key={n} className={cn(block, "p-3")}>
            <div className="size-5 rounded bg-[var(--a)]/70" />
            <div className="font-mono mt-3 text-[0.7rem] text-muted-foreground">{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pos() {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-3">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn(block, "space-y-2 p-2")}>
            <div className="aspect-square rounded bg-[var(--a)]/20" />
            <div className={cn(bar, "h-1.5 w-full")} />
          </div>
        ))}
      </div>
      <div className={cn(block, "flex flex-col gap-2 p-3")}>
        <div className={cn(bar, "h-2 w-2/3")} />
        <div className={cn(bar, "h-1.5 w-full")} />
        <div className={cn(bar, "h-1.5 w-5/6")} />
        <div className={cn(bar, "h-1.5 w-3/4")} />
        <div className="mt-auto h-6 rounded bg-[var(--a)]/80" />
      </div>
    </div>
  );
}

function Sports() {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-3">
      <div className={cn(block, "space-y-2 p-3")}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono w-3 text-[0.65rem] text-subtle">{i + 1}</span>
            <div className={cn(bar, "h-2 flex-1")} />
            <div
              className="h-2 rounded-full bg-[var(--a)]/70"
              style={{ width: `${44 - i * 9}%` }}
            />
          </div>
        ))}
      </div>
      {/* Phone */}
      <div className="mx-auto w-20 rounded-xl border border-border bg-background/80 p-2">
        <div className={cn(bar, "mx-auto mb-2 h-1 w-6")} />
        <div className="space-y-1.5">
          <div className="h-8 rounded bg-[var(--a)]/25" />
          <div className={cn(bar, "h-1.5 w-full")} />
          <div className={cn(bar, "h-1.5 w-2/3")} />
        </div>
      </div>
    </div>
  );
}

function Maintenance() {
  const states = ["bg-[var(--a)]/80", "bg-foreground/30", "bg-[var(--a)]/40", "bg-foreground/15"];
  return (
    <div className={cn(block, "divide-y divide-border")}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <span className={cn("size-2 rounded-full", states[i])} />
          <div className={cn(bar, "h-2 flex-1")} />
          <div className={cn(bar, "h-2 w-10")} />
        </div>
      ))}
    </div>
  );
}

function Pipeline() {
  return (
    <div className="flex items-center gap-2">
      {["commit", "build", "test", "deploy"].map((s, i, a) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <div className={cn(block, "flex-1 p-2 text-center")}>
            <div className="mx-auto mb-1.5 size-2 rounded-full bg-[var(--a)]" />
            <span className="font-mono text-[0.65rem] text-muted-foreground">{s}</span>
          </div>
          {i < a.length - 1 && <span className="h-px w-3 shrink-0 bg-foreground/20" />}
        </div>
      ))}
    </div>
  );
}

const visuals: Record<VisualKind, () => React.JSX.Element> = {
  marketplace: Marketplace,
  studio: Studio,
  pos: Pos,
  sports: Sports,
  maintenance: Maintenance,
  pipeline: Pipeline,
};

export function ProjectMockup({
  kind,
  accent,
  className,
}: {
  kind: VisualKind;
  accent: "signal" | "infra";
  className?: string;
}) {
  const Visual = visuals[kind];
  return (
    <Frame accent={accent} className={className}>
      <Visual />
    </Frame>
  );
}
