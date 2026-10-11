import { ArrowDown, ArrowRight } from "lucide-react";
import type { ArchitectureLayer } from "@/content/projects";
import { t, type Locale } from "@/lib/i18n";

/** Layered flow diagram in HTML/CSS: stacks vertically on mobile, flows horizontally on desktop. */
export function ArchitectureDiagram({
  layers,
  lang,
  label,
}: {
  layers: ArchitectureLayer[];
  lang: Locale;
  label: string;
}) {
  return (
    <figure aria-label={label}>
      <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
        {layers.map((layer, i) => (
          <li key={i} className="flex flex-1 flex-col items-stretch gap-3 lg:flex-row">
            <div className="flex-1 rounded-xl border border-border bg-surface p-5">
              <p className="eyebrow text-signal">{t(layer.label, lang)}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {layer.items.map((item) => (
                  <li
                    key={item}
                    className="font-mono rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {i < layers.length - 1 && (
              <span className="grid place-items-center text-subtle" aria-hidden="true">
                <ArrowDown className="size-5 lg:hidden" />
                <ArrowRight className="hidden size-5 lg:block" />
              </span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
