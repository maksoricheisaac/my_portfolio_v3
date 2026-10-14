import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { AuditService } from '../audit/audit.service';
import { CurrentUser, Public, type AuthUser } from '../auth/auth.types';
import { clientIp } from '../common/client-ip';
import { RevalidateService } from '../common/revalidate.service';
import { PrismaService } from '../prisma/prisma.service';

const localized = (max: number) =>
  z.object({ fr: z.string().max(max), en: z.string().max(max) });
/** Only http(s) links: `javascript:` / `data:` URLs are rejected. */
const httpUrl = z
  .string()
  .url()
  .max(300)
  .refine((v) => /^https?:\/\//i.test(v), 'Only http(s) URLs are allowed');
const optionalUrl = z.union([z.literal(''), httpUrl]);

export const settingsSchema = z.object({
  seo: z.object({
    siteTitle: localized(70),
    description: localized(170),
    keywords: localized(300),
    twitterHandle: z.string().max(40),
    /** Allow search engines to index the site (false = noindex everywhere). */
    indexable: z.boolean(),
    googleSiteVerification: z.string().max(100),
  }),
  profile: z.object({
    name: z.string().max(100),
    jobTitle: localized(100),
    location: z.string().max(100),
    email: z.union([z.literal(''), z.string().email().max(254)]),
    linkedin: optionalUrl,
    github: optionalUrl,
    whatsapp: optionalUrl,
    availability: localized(200),
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;
const KEY = 'site';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Returns null until the owner saved settings: the website then keeps its built-in defaults. */
  async get(): Promise<SiteSettings | null> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: KEY },
    });
    const parsed = settingsSchema.safeParse(row?.value);
    return parsed.success ? parsed.data : null;
  }

  async save(
    input: unknown,
    userId: string,
    ip: string,
  ): Promise<SiteSettings> {
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      );
    }
    await this.prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: parsed.data },
      update: { value: parsed.data },
    });
    await this.audit.log('settings.update', { userId, ip });
    await this.revalidate.tags('settings');
    return parsed.data;
  }
}

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get('public/settings')
  async publicSettings() {
    return { settings: await this.settings.get() };
  }

  @Get('admin/settings')
  async adminSettings() {
    return { settings: await this.settings.get() };
  }

  @Put('admin/settings')
  save(
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.settings.save(body, user.id, clientIp(req));
  }
}

@Module({ controllers: [SettingsController], providers: [SettingsService] })
export class SettingsModule {}
