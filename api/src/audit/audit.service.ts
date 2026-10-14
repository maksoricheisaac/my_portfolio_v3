import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  userId?: string | null;
  target?: string;
  ip?: string;
  meta?: Prisma.InputJsonValue;
}

/**
 * Security-relevant events are also written to the process log (one line, no personal data
 * beyond the IP) so a log shipper / alert rule can match on "SECURITY".
 */
const SECURITY_EVENTS = new Set([
  'auth.account.locked',
  'auth.login.locked',
  'auth.refresh.reuse',
  'auth.otp.failed',
  'auth.password.reset',
  'auth.password.changed',
  'auth.password.change.failed',
  'auth.2fa.disabled',
  'setup.completed',
]);

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Best effort: an audit failure must never break the request. */
  async log(action: string, entry: AuditEntry = {}): Promise<void> {
    if (SECURITY_EVENTS.has(action)) {
      this.logger.warn(
        `SECURITY ${action} user=${entry.userId ?? '-'} ip=${(entry.ip ?? '-').replace(/[^\w.:-]/g, '?').slice(0, 64)}`,
      );
    }
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          userId: entry.userId ?? null,
          target: entry.target,
          ip: entry.ip,
          meta: entry.meta,
        },
      });
    } catch (error) {
      this.logger.error(`audit "${action}" failed: ${(error as Error).name}`);
    }
  }
}

@Global()
@Module({ providers: [AuditService], exports: [AuditService] })
export class AuditModule {}
