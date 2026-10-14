import { z } from 'zod';

const localized = z.object({
  fr: z.string().max(2000),
  en: z.string().max(2000),
});
const list = z.array(localized).max(20);

/** Optional structured case-study blocks of a project. Unknown keys are dropped. */
export const detailsSchema = z
  .object({
    context: localized.optional(),
    goals: list.optional(),
    users: list.optional(),
    solution: localized.optional(),
    features: list.optional(),
    responsibilities: list.optional(),
    architecture: z
      .array(
        z.object({
          label: localized,
          items: z.array(z.string().max(120)).max(20),
        }),
      )
      .max(10)
      .optional(),
    decisions: z
      .array(z.object({ name: z.string().max(120), why: localized }))
      .max(20)
      .optional(),
    challenges: z
      .array(z.object({ problem: localized, solution: localized }))
      .max(20)
      .optional(),
    nextSteps: list.optional(),
  })
  .strip();

export type ProjectDetails = z.infer<typeof detailsSchema>;

const blank = (v: { fr: string; en: string }) => !v.fr.trim() && !v.en.trim();

/**
 * Drops blank entries (e.g. the admin's insert-template placeholders) so the website never
 * renders empty bullets, and omits sections left empty so they stay hidden.
 */
export function pruneDetails(details: ProjectDetails): ProjectDetails {
  const out: ProjectDetails = {};
  const put = <K extends keyof ProjectDetails>(k: K, v: ProjectDetails[K]) => {
    if (v !== undefined) out[k] = v;
  };
  const text = (v?: { fr: string; en: string }) =>
    v && !blank(v) ? v : undefined;
  const texts = (v?: { fr: string; en: string }[]) => {
    const kept = v?.filter((x) => !blank(x));
    return kept?.length ? kept : undefined;
  };
  const items = <T>(v: T[] | undefined, keep: (x: T) => boolean) => {
    const kept = v?.filter(keep);
    return kept?.length ? kept : undefined;
  };

  put('context', text(details.context));
  put('goals', texts(details.goals));
  put('users', texts(details.users));
  put('solution', text(details.solution));
  put('features', texts(details.features));
  put('responsibilities', texts(details.responsibilities));
  put('nextSteps', texts(details.nextSteps));
  put(
    'architecture',
    items(
      details.architecture
        ?.map((l) => ({ ...l, items: l.items.filter((i) => i.trim()) }))
        .filter((l) => !blank(l.label)),
      (l) => l.items.length > 0,
    ),
  );
  put(
    'decisions',
    items(details.decisions, (d) => d.name.trim() !== '' && !blank(d.why)),
  );
  put(
    'challenges',
    items(details.challenges, (c) => !blank(c.problem) && !blank(c.solution)),
  );
  return out;
}
