import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppConfig } from '../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { plain, sanitizeRichText } from '../common/sanitize';
import { RevalidateService } from '../common/revalidate.service';
import { Prisma, type Media, type Project } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { detailsSchema, pruneDetails } from './details.schema';
import { importSeedProjects } from '../setup/seed-projects';
import type { CreateProjectDto, UpdateProjectDto } from './project.dto';

type ProjectWithCover = Project & { cover: Media | null };

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
    private readonly audit: AuditService,
    private readonly revalidate: RevalidateService,
  ) {}

  private mediaUrl(filename: string) {
    return `${this.config.get('MEDIA_PUBLIC_PATH')}/${filename}`;
  }

  // ───────────── shaping ─────────────

  /** Full record for the admin editor. */
  toAdmin(p: ProjectWithCover) {
    return {
      ...p,
      cover: p.cover
        ? {
            id: p.cover.id,
            url: this.mediaUrl(p.cover.filename),
            alt: p.cover.alt,
          }
        : null,
    };
  }

  /** Public shape: mirrors the website's `Project` type so the front can consume it directly. */
  toPublic(p: ProjectWithCover) {
    const details = (p.details ?? {}) as Record<string, unknown>;
    return {
      slug: p.slug,
      published: true,
      featured: p.featured,
      category: p.category,
      status: p.status,
      visual: p.visual,
      domain: p.domain,
      confidential: p.confidential || undefined,
      stackPlanned: p.stackPlanned,
      stack: p.stack,
      title: p.title,
      tagline: { fr: p.taglineFr, en: p.taglineEn },
      summary: { fr: p.summaryFr, en: p.summaryEn },
      problem: { fr: p.problemFr, en: p.problemEn },
      contribution: { fr: p.contributionFr, en: p.contributionEn },
      links:
        p.liveUrl || p.repoUrl || p.siteUrl
          ? {
              live: p.liveUrl ?? undefined,
              repo: p.repoUrl ?? undefined,
              site: p.siteUrl ?? undefined,
            }
          : undefined,
      ...details,
      related: p.related,
      content: { fr: p.contentFr, en: p.contentEn },
      seo: {
        title: { fr: p.seoTitleFr, en: p.seoTitleEn },
        description: { fr: p.seoDescriptionFr, en: p.seoDescriptionEn },
      },
      cover: p.cover
        ? {
            url: this.mediaUrl(p.cover.filename),
            alt: p.cover.alt,
            width: p.cover.width,
            height: p.cover.height,
          }
        : null,
      updatedAt: p.updatedAt,
    };
  }

  // ───────────── public ─────────────

  async listPublished() {
    const rows = await this.prisma.project.findMany({
      where: { published: true },
      include: { cover: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((p) => this.toPublic(p));
  }

  async getPublished(slug: string) {
    const p = await this.prisma.project.findFirst({
      where: { slug, published: true },
      include: { cover: true },
    });
    if (!p) throw new NotFoundException();
    return this.toPublic(p);
  }

  // ───────────── admin ─────────────

  async list(params: { q?: string; published?: boolean }) {
    const where: Prisma.ProjectWhereInput = {};
    if (params.published !== undefined) where.published = params.published;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { slug: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    const rows = await this.prisma.project.findMany({
      where,
      include: { cover: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((p) => this.toAdmin(p));
  }

  async get(id: string) {
    const p = await this.prisma.project.findUnique({
      where: { id },
      include: { cover: true },
    });
    if (!p) throw new NotFoundException();
    return this.toAdmin(p);
  }

  private clean(dto: UpdateProjectDto): Prisma.ProjectUncheckedUpdateInput {
    const data: Prisma.ProjectUncheckedUpdateInput = {};
    const text: (keyof UpdateProjectDto)[] = [
      'title',
      'taglineFr',
      'taglineEn',
      'summaryFr',
      'summaryEn',
      'problemFr',
      'problemEn',
      'contributionFr',
      'contributionEn',
      'seoTitleFr',
      'seoTitleEn',
      'seoDescriptionFr',
      'seoDescriptionEn',
    ];
    for (const key of Object.keys(dto) as (keyof UpdateProjectDto)[]) {
      const value = dto[key];
      if (value === undefined) continue;
      if (text.includes(key)) {
        (data as Record<string, unknown>)[key] =
          value === null ? null : plain(String(value));
      } else if (key === 'contentFr' || key === 'contentEn') {
        (data as Record<string, unknown>)[key] = sanitizeRichText(
          String(value),
        );
      } else if (key === 'stack') {
        data.stack = (value as string[]).map((s) => plain(s)).filter(Boolean);
      } else if (key === 'details') {
        if (value === null) {
          data.details = Prisma.JsonNull;
        } else {
          const parsed = detailsSchema.safeParse(value);
          if (!parsed.success) {
            throw new BadRequestException(
              `details: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
            );
          }
          const pruned = pruneDetails(parsed.data);
          data.details = Object.keys(pruned).length ? pruned : Prisma.JsonNull;
        }
      } else {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return data;
  }

  async create(dto: CreateProjectDto, userId: string, ip: string) {
    try {
      const p = await this.prisma.project.create({
        data: this.clean(dto) as Prisma.ProjectUncheckedCreateInput,
        include: { cover: true },
      });
      await this.afterChange('project.create', p, userId, ip);
      return this.toAdmin(p);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(id: string, dto: UpdateProjectDto, userId: string, ip: string) {
    try {
      const p = await this.prisma.project.update({
        where: { id },
        data: this.clean(dto),
        include: { cover: true },
      });
      await this.afterChange('project.update', p, userId, ip);
      return this.toAdmin(p);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async duplicate(id: string, userId: string, ip: string) {
    const src = await this.prisma.project.findUnique({ where: { id } });
    if (!src) throw new NotFoundException();
    let slug = `${src.slug}-copy`;
    for (
      let i = 2;
      await this.prisma.project.findUnique({ where: { slug } });
      i++
    ) {
      slug = `${src.slug}-copy-${i}`;
    }
    const { id: _id, createdAt: _c, updatedAt: _u, details, ...rest } = src;
    const p = await this.prisma.project.create({
      data: {
        ...rest,
        slug,
        title: `${src.title} (copie)`,
        published: false,
        details:
          details === null
            ? Prisma.JsonNull
            : (details as Prisma.InputJsonValue),
      },
      include: { cover: true },
    });
    await this.afterChange('project.duplicate', p, userId, ip);
    return this.toAdmin(p);
  }

  async remove(id: string, userId: string, ip: string) {
    try {
      const p = await this.prisma.project.delete({
        where: { id },
        include: { cover: true },
      });
      await this.afterChange('project.delete', p, userId, ip);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async reorder(ids: string[], userId: string, ip: string) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.project.update({
          where: { id },
          data: { sortOrder: index * 10 },
        }),
      ),
    );
    await this.audit.log('project.reorder', { userId, ip });
    await this.revalidate.tags('projects');
  }

  /** Imports the original catalogue. Idempotent: existing slugs are left untouched. */
  async importSeed(userId: string, ip: string) {
    const before = await this.prisma.project.count();
    const total = await importSeedProjects(this.prisma);
    const created = (await this.prisma.project.count()) - before;
    await this.audit.log('project.import', { userId, ip });
    if (created > 0) await this.revalidate.tags('projects');
    return { created, total };
  }

  private async afterChange(
    action: string,
    p: Project,
    userId: string,
    ip: string,
  ) {
    await this.audit.log(action, { userId, ip, target: p.slug });
    await this.revalidate.tags('projects', `project:${p.slug}`);
  }

  private rethrow(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException('This slug is already used.');
      if (error.code === 'P2025') throw new NotFoundException();
      if (error.code === 'P2003')
        throw new BadRequestException('Unknown cover image.');
    }
    throw error;
  }
}
