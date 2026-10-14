import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from '@node-rs/argon2';
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { passwordProblem } from '../auth/password-policy';
import { RevalidateService } from '../common/revalidate.service';
import { plain } from '../common/sanitize';
import { AppConfig } from '../config/app-config.service';
import { Prisma } from '../generated/prisma/client';
import { escapeHtml, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { settingsSchema } from '../settings/settings';
import type { SetupCompleteDto } from './setup.dto';
import { importSeedProjects } from './seed-projects';

const MAX_TOKEN_FAILURES = 10;
const EMAIL_CODE_TTL_MINUTES = 15;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * First-run setup. While no administrator exists, the instance is "unclaimed": the wizard can
 * create the owner account, but only with a one-time setup token that is printed in the API logs
 * (or provided through SETUP_TOKEN). Once an account exists every setup endpoint answers 404.
 */
@Injectable()
export class SetupService implements OnModuleInit {
  private readonly logger = new Logger('Setup');
  private token: string | null = null;
  private failures = 0;
  private completing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly jwt: JwtService,
    private readonly revalidate: RevalidateService,
  ) {}

  async onModuleInit() {
    if (await this.required()) this.issueToken();
  }

  async required(): Promise<boolean> {
    return (await this.prisma.adminUser.count()) === 0;
  }

  private issueToken() {
    this.token =
      this.config.get('SETUP_TOKEN') || randomBytes(12).toString('hex');
    this.failures = 0;
    const url = `${this.config.siteUrl}/admin/setup`;
    const line = '='.repeat(64);
    this.logger.warn(
      `\n${line}\n  FIRST-RUN SETUP\n  No administrator exists yet. Open: ${url}\n  Setup token: ${this.token}\n${line}`,
    );
  }

  async status() {
    // Nothing is disclosed once the instance is configured.
    if (!(await this.required())) return { required: false };
    return { required: true, mailEnabled: this.mail.enabled };
  }

  /** Throws 404 once configured, 401 on a wrong token (and rotates it after repeated failures). */
  private async assertToken(provided: string) {
    if (!(await this.required()) || !this.token) throw new NotFoundException();
    if (!safeEqual(provided.trim(), this.token)) {
      this.failures += 1;
      if (this.failures >= MAX_TOKEN_FAILURES) this.issueToken();
      throw new UnauthorizedException('Invalid setup token');
    }
  }

  async verifyToken(token: string) {
    await this.assertToken(token);
    return { ok: true };
  }

  private emailHash(email: string, code: string) {
    return createHmac('sha256', this.config.get('OTP_SECRET'))
      .update(`setup:${email}:${code}`)
      .digest('hex');
  }

  /** Proves the owner can read mail at this address (so 2FA cannot lock them out). */
  async sendEmailCode(token: string, email: string) {
    await this.assertToken(token);
    if (!this.mail.enabled) {
      throw new BadRequestException('SMTP is not configured on the server.');
    }
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const sent = await this.mail.send({
      to: email,
      fromName: 'Portfolio — Installation',
      subject: `${code} — Code de vérification`,
      text: `Votre code de vérification d'installation : ${code}\n\nIl expire dans ${EMAIL_CODE_TTL_MINUTES} minutes.`,
      html: `<p>Votre code de vérification d'installation :</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${escapeHtml(code)}</p><p>Il expire dans ${EMAIL_CODE_TTL_MINUTES} minutes.</p>`,
    });
    if (!sent) {
      throw new HttpException(
        'The email could not be sent. Check the SMTP settings.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    this.mail.devEcho(`Setup code for ${email}`, code);
    const challenge = await this.jwt.signAsync(
      { email, h: this.emailHash(email, code) },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: `${EMAIL_CODE_TTL_MINUTES}m`,
        audience: 'setup-email',
      },
    );
    return { challenge };
  }

  private async checkEmailCode(
    email: string,
    challenge?: string,
    code?: string,
  ) {
    const fail = () => new BadRequestException('Invalid or expired email code');
    if (!challenge || !code) throw fail();
    try {
      const payload = await this.jwt.verifyAsync<{ email: string; h: string }>(
        challenge,
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          audience: 'setup-email',
        },
      );
      if (payload.email !== email) throw fail();
      if (!safeEqual(payload.h, this.emailHash(email, code))) throw fail();
    } catch {
      throw fail();
    }
  }

  async complete(dto: SetupCompleteDto, ip: string) {
    await this.assertToken(dto.token);

    const name = plain(dto.name);
    if (name.length < 2) throw new BadRequestException('Name is too short.');
    const problem = passwordProblem(dto.password, dto.email);
    if (problem) throw new BadRequestException(problem);

    // With working mail, the address must be proven; without it 2FA cannot be enforced.
    const mailEnabled = this.mail.enabled;
    if (mailEnabled)
      await this.checkEmailCode(dto.email, dto.challenge, dto.code);
    const twoFactorEnabled = mailEnabled && dto.twoFactor;

    const settings = settingsSchema.safeParse({
      seo: {
        siteTitle: { fr: plain(dto.siteTitleFr), en: plain(dto.siteTitleEn) },
        description: {
          fr: plain(dto.descriptionFr),
          en: plain(dto.descriptionEn),
        },
        keywords: { fr: '', en: '' },
        twitterHandle: '',
        indexable: dto.indexable,
        googleSiteVerification: '',
      },
      profile: {
        name,
        jobTitle: { fr: '', en: '' },
        location: '',
        email: '',
        linkedin: '',
        github: '',
        whatsapp: '',
        availability: { fr: '', en: '' },
      },
    });
    if (!settings.success) {
      throw new BadRequestException(
        settings.error.issues.map((i) => i.message).join('; '),
      );
    }

    if (this.completing)
      throw new ConflictException('Setup already in progress.');
    this.completing = true;
    try {
      const passwordHash = await hash(dto.password);
      await this.prisma.$transaction(async (tx) => {
        if ((await tx.adminUser.count()) > 0) {
          throw new ConflictException('Setup has already been completed.');
        }
        await tx.adminUser.create({
          data: { email: dto.email, name, passwordHash, twoFactorEnabled },
        });
        await tx.siteSetting.upsert({
          where: { key: 'site' },
          create: { key: 'site', value: settings.data },
          update: { value: settings.data },
        });
      });
      const projects = dto.importProjects
        ? await importSeedProjects(this.prisma)
        : 0;

      this.token = null;
      await this.audit.log('setup.completed', {
        ip,
        meta: { projects, twoFactorEnabled } as Prisma.InputJsonValue,
      });
      await this.revalidate.tags('projects', 'settings');
      this.logger.log('Setup completed: administrator created.');
      return { ok: true, twoFactorEnabled, projects };
    } finally {
      this.completing = false;
    }
  }
}
