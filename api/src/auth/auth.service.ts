import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from '@node-rs/argon2';
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { AppConfig } from '../config/app-config.service';
import { OtpPurpose, type AdminUser } from '../generated/prisma/client';
import { escapeHtml, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { passwordProblem } from './password-policy';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 5;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_AFTER_SECONDS = 30;
const ROTATION_GRACE_MS = 10_000;

export interface RequestContext {
  ip: string;
  userAgent?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
  refreshExpiresAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
}

export type LoginResult =
  | { step: 'otp'; challenge: string; emailHint: string }
  | { step: 'done'; user: PublicUser; tokens: Tokens };

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

@Injectable()
export class AuthService {
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
    private readonly mail: MailService,
    private readonly audit: AuditService,
  ) {}

  // ───────────── login ─────────────

  async login(
    email: string,
    password: string,
    ctx: RequestContext,
  ): Promise<LoginResult> {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });

    if (!user) {
      // Burn the same CPU time as a real verification to avoid user enumeration by timing.
      this.dummyHash ??= hash('not-a-real-password');
      await verify(await this.dummyHash, password).catch(() => false);
      await this.audit.log('auth.login.failed', {
        ip: ctx.ip,
        meta: { reason: 'unknown-user' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.audit.log('auth.login.locked', {
        userId: user.id,
        ip: ctx.ip,
      });
      // Same answer as a wrong password: the lock must not reveal that the account exists.
      await verify(user.passwordHash, password).catch(() => false);
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await verify(user.passwordHash, password).catch(() => false);
    if (!ok) {
      const failed = user.failedLogins + 1;
      const lock = failed >= MAX_FAILED_LOGINS;
      await this.prisma.adminUser.update({
        where: { id: user.id },
        data: {
          failedLogins: lock ? 0 : failed,
          lockedUntil: lock
            ? new Date(Date.now() + LOCK_MINUTES * 60_000)
            : null,
        },
      });
      await this.audit.log(lock ? 'auth.account.locked' : 'auth.login.failed', {
        userId: user.id,
        ip: ctx.ip,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.failedLogins > 0 || user.lockedUntil) {
      await this.prisma.adminUser.update({
        where: { id: user.id },
        data: { failedLogins: 0, lockedUntil: null },
      });
    }

    if (user.twoFactorEnabled) {
      const challenge = await this.startOtp(user, OtpPurpose.LOGIN);
      return { step: 'otp', challenge, emailHint: maskEmail(user.email) };
    }

    return this.completeLogin(user, ctx);
  }

  async verifyLoginOtp(
    challenge: string,
    code: string,
    ctx: RequestContext,
  ): Promise<LoginResult> {
    const { userId, otpId } = await this.readChallenge(challenge);
    await this.consumeOtp(otpId, userId, OtpPurpose.LOGIN, code, ctx);
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('Invalid or expired code');
    return this.completeLogin(user, ctx);
  }

  async resendLoginOtp(challenge: string): Promise<{ challenge: string }> {
    const { userId } = await this.readChallenge(challenge, true);
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('Invalid challenge');
    const last = await this.prisma.otpCode.findFirst({
      where: { userId, purpose: OtpPurpose.LOGIN },
      orderBy: { createdAt: 'desc' },
    });
    if (
      last &&
      Date.now() - last.createdAt.getTime() < OTP_RESEND_AFTER_SECONDS * 1000
    ) {
      throw new HttpException(
        'Please wait before requesting a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return { challenge: await this.startOtp(user, OtpPurpose.LOGIN) };
  }

  private async completeLogin(
    user: AdminUser,
    ctx: RequestContext,
  ): Promise<LoginResult> {
    const updated = await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const tokens = await this.createSession(
      user.id,
      randomBytes(16).toString('hex'),
      ctx,
    );
    await this.audit.log('auth.login.success', { userId: user.id, ip: ctx.ip });
    return { step: 'done', user: this.toPublic(updated), tokens };
  }

  // ───────────── sessions ─────────────

  private async createSession(
    userId: string,
    family: string,
    ctx: RequestContext,
  ): Promise<Tokens> {
    const raw = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(
      Date.now() + this.config.get('REFRESH_TTL_DAYS') * 24 * 3600 * 1000,
    );
    const session = await this.prisma.refreshSession.create({
      data: {
        userId,
        family,
        tokenHash: sha256(raw),
        userAgent: ctx.userAgent?.slice(0, 255),
        ip: ctx.ip,
        expiresAt: refreshExpiresAt,
      },
    });
    const access = await this.jwt.signAsync(
      { sub: userId, sid: session.id },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: `${this.config.get('ACCESS_TTL_MINUTES')}m`,
        audience: 'access',
      },
    );
    return { access, refresh: raw, refreshExpiresAt };
  }

  /** Rotate a refresh token. A replayed (already rotated) token revokes the whole family. */
  async refresh(
    rawToken: string,
    ctx: RequestContext,
  ): Promise<{ user: PublicUser; tokens: Tokens }> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: sha256(rawToken) },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException();

    if (session.revokedAt) {
      const withinGrace =
        Date.now() - session.revokedAt.getTime() < ROTATION_GRACE_MS;
      if (!withinGrace) {
        await this.prisma.refreshSession.updateMany({
          where: { family: session.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        await this.audit.log('auth.refresh.reuse', {
          userId: session.userId,
          ip: ctx.ip,
        });
      }
      throw new UnauthorizedException();
    }
    if (session.expiresAt < new Date()) throw new UnauthorizedException();

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await this.createSession(
      session.userId,
      session.family,
      ctx,
    );
    return { user: this.toPublic(session.user), tokens };
  }

  async logout(
    rawToken: string | undefined,
    userId?: string,
    ip?: string,
  ): Promise<void> {
    if (!rawToken) return;
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: sha256(rawToken) },
    });
    if (!session) return;
    await this.prisma.refreshSession.updateMany({
      where: { family: session.family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.log('auth.logout', {
      userId: userId ?? session.userId,
      ip,
    });
  }

  async isSessionActive(sid: string, userId: string): Promise<boolean> {
    const s = await this.prisma.refreshSession.findUnique({
      where: { id: sid },
    });
    return Boolean(
      s && s.userId === userId && !s.revokedAt && s.expiresAt > new Date(),
    );
  }

  async listSessions(userId: string, currentSid: string) {
    const rows = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });
    return rows.map((s) => ({
      id: s.id,
      current: s.id === currentSid,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
    }));
  }

  async revokeSession(userId: string, id: string, ip: string) {
    const session = await this.prisma.refreshSession.findFirst({
      where: { id, userId },
    });
    if (!session) return;
    await this.prisma.refreshSession.updateMany({
      where: { family: session.family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.log('auth.session.revoked', { userId, ip });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    return this.toPublic(user);
  }

  // ───────────── password ─────────────

  async forgotPassword(email: string, ctx: RequestContext): Promise<void> {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    // Same response and similar work whether or not the account exists.
    if (user) {
      const last = await this.prisma.otpCode.findFirst({
        where: { userId: user.id, purpose: OtpPurpose.PASSWORD_RESET },
        orderBy: { createdAt: 'desc' },
      });
      const tooSoon =
        last &&
        Date.now() - last.createdAt.getTime() < OTP_RESEND_AFTER_SECONDS * 1000;
      if (!tooSoon) await this.startOtp(user, OtpPurpose.PASSWORD_RESET);
    }
    await this.audit.log('auth.password.forgot', {
      userId: user?.id,
      ip: ctx.ip,
    });
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
    ctx: RequestContext,
  ): Promise<void> {
    const problem = passwordProblem(newPassword, email);
    if (problem) throw new BadRequestException(problem);

    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    const otp = user
      ? await this.prisma.otpCode.findFirst({
          where: {
            userId: user.id,
            purpose: OtpPurpose.PASSWORD_RESET,
            consumedAt: null,
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;
    if (!user || !otp) throw new BadRequestException('Invalid or expired code');

    await this.consumeOtp(
      otp.id,
      user.id,
      OtpPurpose.PASSWORD_RESET,
      code,
      ctx,
    );
    await this.setPassword(user.id, newPassword);
    await this.audit.log('auth.password.reset', {
      userId: user.id,
      ip: ctx.ip,
    });
    void this.notifyPasswordChanged(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    keepSid: string,
    ctx: RequestContext,
  ): Promise<void> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    if (
      !(await verify(user.passwordHash, currentPassword).catch(() => false))
    ) {
      await this.audit.log('auth.password.change.failed', {
        userId,
        ip: ctx.ip,
      });
      throw new BadRequestException('Current password is incorrect');
    }
    const problem = passwordProblem(newPassword, user.email);
    if (problem) throw new BadRequestException(problem);
    await this.setPassword(userId, newPassword, keepSid);
    await this.audit.log('auth.password.changed', { userId, ip: ctx.ip });
    void this.notifyPasswordChanged(user);
  }

  async setTwoFactor(
    userId: string,
    enabled: boolean,
    password: string,
    ip: string,
  ) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    if (!(await verify(user.passwordHash, password).catch(() => false))) {
      throw new BadRequestException('Password is incorrect');
    }
    const updated = await this.prisma.adminUser.update({
      where: { id: userId },
      data: { twoFactorEnabled: enabled },
    });
    await this.audit.log(enabled ? 'auth.2fa.enabled' : 'auth.2fa.disabled', {
      userId,
      ip,
    });
    return this.toPublic(updated);
  }

  /** Used by the bootstrap seed. */
  async hashPassword(password: string): Promise<string> {
    return hash(password);
  }

  private async setPassword(
    userId: string,
    password: string,
    keepSid?: string,
  ) {
    const passwordHash = await hash(password);
    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLogins: 0,
          lockedUntil: null,
        },
      }),
      // Every other session is signed out.
      this.prisma.refreshSession.updateMany({
        where: {
          userId,
          revokedAt: null,
          ...(keepSid ? { id: { not: keepSid } } : {}),
        },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async notifyPasswordChanged(user: AdminUser) {
    await this.mail.send({
      to: user.email,
      fromName: 'Portfolio — Sécurité',
      subject: 'Votre mot de passe a été modifié',
      text: `Bonjour ${user.name},\n\nLe mot de passe de votre espace d'administration vient d'être modifié. Si ce n'est pas vous, réinitialisez-le immédiatement et vérifiez vos sessions actives.`,
    });
  }

  // ───────────── OTP ─────────────

  private otpHash(userId: string, purpose: OtpPurpose, code: string): string {
    return createHmac('sha256', this.config.get('OTP_SECRET'))
      .update(`${userId}:${purpose}:${code}`)
      .digest('hex');
  }

  /** Creates a code, emails it, and returns a signed challenge bound to that code. */
  private async startOtp(
    user: AdminUser,
    purpose: OtpPurpose,
  ): Promise<string> {
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const otp = await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        purpose,
        codeHash: this.otpHash(user.id, purpose, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      },
    });

    const login = purpose === OtpPurpose.LOGIN;
    const title = login
      ? 'Code de connexion'
      : 'Réinitialisation du mot de passe';
    await this.mail.send({
      to: user.email,
      fromName: 'Portfolio — Sécurité',
      subject: `${code} — ${title}`,
      text: `Bonjour ${user.name},\n\nVotre code ${login ? 'de connexion' : 'de réinitialisation'} : ${code}\n\nIl expire dans ${OTP_TTL_MINUTES} minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message et changez votre mot de passe.`,
      html: `<p>Bonjour ${escapeHtml(user.name)},</p><p>Votre code ${login ? 'de connexion' : 'de réinitialisation'} :</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>Il expire dans ${OTP_TTL_MINUTES} minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
    });
    this.mail.devEcho(`OTP (${purpose}) for ${user.email}`, code);

    return this.jwt.signAsync(
      { sub: user.id, otp: otp.id },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: `${OTP_TTL_MINUTES}m`,
        audience: 'otp-challenge',
      },
    );
  }

  private async readChallenge(token: string, allowExpiredOtp = false) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; otp: string }>(
        token,
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          audience: 'otp-challenge',
          ignoreExpiration: allowExpiredOtp,
        },
      );
      return { userId: payload.sub, otpId: payload.otp };
    } catch {
      throw new UnauthorizedException('Invalid or expired code');
    }
  }

  /** Verifies a code with attempt counting; marks it consumed on success. */
  private async consumeOtp(
    otpId: string,
    userId: string,
    purpose: OtpPurpose,
    code: string,
    ctx: RequestContext,
  ): Promise<void> {
    const otp = await this.prisma.otpCode.findUnique({ where: { id: otpId } });
    const invalid = () => new UnauthorizedException('Invalid or expired code');
    if (
      !otp ||
      otp.userId !== userId ||
      otp.purpose !== purpose ||
      otp.consumedAt ||
      otp.expiresAt < new Date() ||
      otp.attempts >= OTP_MAX_ATTEMPTS
    ) {
      throw invalid();
    }

    const expected = Buffer.from(otp.codeHash, 'hex');
    const given = Buffer.from(this.otpHash(userId, purpose, code), 'hex');
    const match =
      expected.length === given.length && timingSafeEqual(expected, given);

    if (!match) {
      const attempts = otp.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: {
          attempts,
          ...(attempts >= OTP_MAX_ATTEMPTS ? { consumedAt: new Date() } : {}),
        },
      });
      await this.audit.log('auth.otp.failed', {
        userId,
        ip: ctx.ip,
        meta: { purpose },
      });
      throw invalid();
    }

    // Atomic: a code can only ever be consumed once, even with concurrent requests.
    const res = await this.prisma.otpCode.updateMany({
      where: { id: otp.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (res.count !== 1) throw invalid();
  }

  toPublic(user: AdminUser): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
