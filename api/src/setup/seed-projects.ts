import type { Prisma, PrismaClient } from '../generated/prisma/client';
import seed from './projects.seed.json';

interface Localized {
  fr: string;
  en: string;
}

interface SeedProject {
  slug: string;
  published: boolean;
  featured: boolean;
  category: string;
  tagline: Localized;
  title: string;
  summary: Localized;
  problem: Localized;
  contribution: Localized;
  status: string;
  stack: string[];
  stackPlanned: boolean;
  visual: string;
  domain: string;
  confidential?: boolean;
  links?: { live?: string; repo?: string; site?: string };
  related?: string[];
  [key: string]: unknown;
}

const DETAIL_KEYS = [
  'context',
  'goals',
  'users',
  'solution',
  'features',
  'responsibilities',
  'architecture',
  'decisions',
  'challenges',
  'nextSteps',
] as const;

/**
 * Imports the initial projects. Idempotent: existing slugs are never overwritten, so edits made
 * from the admin are preserved. Returns the number of projects in the catalogue.
 */
export async function importSeedProjects(
  prisma: Pick<PrismaClient, 'project'>,
): Promise<number> {
  const projects = seed as unknown as SeedProject[];
  let order = 0;
  for (const p of projects) {
    const details = Object.fromEntries(
      DETAIL_KEYS.filter((k) => p[k] !== undefined).map((k) => [k, p[k]]),
    );
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        published: p.published,
        featured: p.featured,
        sortOrder: order * 10,
        category: p.category,
        status: p.status,
        visual: p.visual,
        domain: p.domain,
        confidential: Boolean(p.confidential),
        stackPlanned: p.stackPlanned,
        stack: p.stack,
        title: p.title,
        taglineFr: p.tagline.fr,
        taglineEn: p.tagline.en,
        summaryFr: p.summary.fr,
        summaryEn: p.summary.en,
        problemFr: p.problem.fr,
        problemEn: p.problem.en,
        contributionFr: p.contribution.fr,
        contributionEn: p.contribution.en,
        liveUrl: p.links?.live ?? null,
        repoUrl: p.links?.repo ?? null,
        siteUrl: p.links?.site ?? null,
        details: Object.keys(details).length
          ? (details as Prisma.InputJsonObject)
          : undefined,
        related: p.related ?? [],
      },
    });
    order += 1;
  }
  return projects.length;
}
