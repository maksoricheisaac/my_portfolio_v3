import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { plain } from '../common/sanitize';
import { AppConfig } from '../config/app-config.service';
import { MessageStatus, Prisma } from '../generated/prisma/client';
import { escapeHtml, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ContactDto } from './messages.dto';

// The auto-reply is sent to an address typed by an anonymous visitor: it must never carry
// visitor-controlled text (no name) and it is capped per address (see receive()).
const AUTO_REPLY = {
  fr: {
    subject: 'Votre message a bien été reçu',
    body: "Bonjour,\n\nMerci pour votre message : je l'ai bien reçu et je reviendrai vers vous très bientôt.\n\nSi vous n'êtes pas à l'origine de ce message, ignorez simplement cet email.\n\nRiche Makso\nDéveloppeur Full-Stack & Junior DevOps",
  },
  en: {
    subject: 'Your message has been received',
    body: 'Hello,\n\nThank you for your message: I received it and will get back to you very soon.\n\nIf you did not send this message, simply ignore this email.\n\nRiche Makso\nFull-Stack Developer & Junior DevOps',
  },
} as const;

/** Per destination address, per rolling 24 h. */
const MAX_MESSAGES_PER_EMAIL_PER_DAY = 5;
const MAX_AUTO_REPLIES_PER_EMAIL_PER_DAY = 1;
/** Visitor IPs and user agents are personal data: they are erased after this delay. */
const PERSONAL_DATA_RETENTION_DAYS = 90;

@Injectable()
export class MessagesService implements OnModuleInit, OnModuleDestroy {
  private purgeTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: AppConfig,
    private readonly audit: AuditService,
  ) {}

  onModuleInit() {
    const run = () => void this.purgePersonalData().catch(() => undefined);
    run();
    this.purgeTimer = setInterval(run, 24 * 3600 * 1000);
    this.purgeTimer.unref();
  }

  onModuleDestroy() {
    if (this.purgeTimer) clearInterval(this.purgeTimer);
  }

  /** Retention: drop the visitor IP / user agent of old messages (the message itself is kept). */
  async purgePersonalData(): Promise<number> {
    const before = new Date(
      Date.now() - PERSONAL_DATA_RETENTION_DAYS * 24 * 3600 * 1000,
    );
    const res = await this.prisma.message.updateMany({
      where: {
        createdAt: { lt: before },
        OR: [{ ip: { not: null } }, { userAgent: { not: null } }],
      },
      data: { ip: null, userAgent: null },
    });
    return res.count;
  }

  /** Public contact form: store first (nothing is ever lost), then notify by email. */
  async receive(
    dto: ContactDto,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    // Honeypot: pretend success, store nothing.
    if (dto.website) return;

    const lang = dto.lang ?? 'fr';
    const name = plain(dto.name);
    const subject = dto.subject ? plain(dto.subject) : undefined;
    const body = plain(dto.message).replace(/\r\n/g, '\n');

    // Independent of the client IP (which can be rotated): bound what one address can trigger.
    const email = dto.email.toLowerCase();
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const recent = await this.prisma.message.count({
      where: { email, createdAt: { gte: since } },
    });
    if (recent >= MAX_MESSAGES_PER_EMAIL_PER_DAY) {
      throw new HttpException(
        'Too many messages for this address. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const saved = await this.prisma.message.create({
      data: {
        name,
        email,
        subject,
        body,
        lang,
        ip,
        userAgent: userAgent?.slice(0, 255),
      },
    });

    const owner = this.config.get('CONTACT_TO');
    if (!owner) return;
    const sent = await this.mail.send({
      to: owner,
      fromName: 'Portfolio',
      replyTo: { name, address: saved.email },
      subject: `[Portfolio] ${subject || name}`,
      text: `Nom : ${name}\nEmail : ${saved.email}\nLangue : ${lang}\n${subject ? `Sujet : ${subject}\n` : ''}\n${body}`,
      html: `<p>Nom : ${escapeHtml(name)}<br>Email : ${escapeHtml(saved.email)}<br>Langue : ${lang}${
        subject ? `<br>Sujet : ${escapeHtml(subject)}` : ''
      }</p><blockquote style="margin:0;padding-left:12px;border-left:3px solid #5b9bff;white-space:pre-wrap">${escapeHtml(body)}</blockquote><p><a href="${escapeHtml(this.config.siteUrl)}/admin/messages/${saved.id}">Ouvrir dans l'administration</a></p>`,
    });
    if (sent) {
      await this.prisma.message.update({
        where: { id: saved.id },
        data: { mailSent: true },
      });
      // At most one automatic reply per address and day, whatever the number of submissions.
      if (recent < MAX_AUTO_REPLIES_PER_EMAIL_PER_DAY) {
        const reply = AUTO_REPLY[lang];
        await this.mail.send({
          to: saved.email,
          fromName: 'Riche Makso',
          subject: reply.subject,
          text: reply.body,
        });
      }
    }
  }

  async list(params: {
    status?: MessageStatus;
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.MessageWhereInput = {};
    if (params.status) where.status = params.status;
    else where.status = { not: MessageStatus.SPAM };
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
        { subject: { contains: params.q, mode: 'insensitive' } },
        { body: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    const [items, total, counts] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        omit: { userAgent: true },
      }),
      this.prisma.message.count({ where }),
      this.prisma.message.groupBy({
        by: ['status'],
        _count: { id: true },
        orderBy: { status: 'asc' },
      }),
    ]);
    const byStatus = Object.fromEntries(
      counts.map((c) => [
        c.status,
        (c._count as { id?: number } | undefined)?.id ?? 0,
      ]),
    );
    return {
      items,
      total,
      page: params.page,
      pageSize: params.pageSize,
      counts: byStatus,
    };
  }

  async get(id: string) {
    const m = await this.prisma.message.findUnique({ where: { id } });
    if (!m) throw new NotFoundException();
    if (m.status === MessageStatus.NEW) {
      return this.prisma.message.update({
        where: { id },
        data: { status: MessageStatus.READ, readAt: new Date() },
      });
    }
    return m;
  }

  async update(
    id: string,
    data: { status?: MessageStatus; note?: string },
    userId: string,
    ip: string,
  ) {
    try {
      const m = await this.prisma.message.update({
        where: { id },
        data: {
          status: data.status,
          note: data.note === undefined ? undefined : plain(data.note),
          ...(data.status === MessageStatus.READ ? { readAt: new Date() } : {}),
        },
      });
      await this.audit.log('message.update', {
        userId,
        ip,
        target: id,
        meta: { status: data.status ?? null },
      });
      return m;
    } catch {
      throw new NotFoundException();
    }
  }

  async remove(id: string, userId: string, ip: string) {
    await this.prisma.message.delete({ where: { id } }).catch(() => {
      throw new NotFoundException();
    });
    await this.audit.log('message.delete', { userId, ip, target: id });
  }

  async reply(id: string, body: string, userId: string, ip: string) {
    const m = await this.prisma.message.findUnique({ where: { id } });
    if (!m) throw new NotFoundException();
    const sent = await this.mail.send({
      to: m.email,
      fromName: 'Riche Makso',
      replyTo: this.config.get('CONTACT_TO')
        ? { name: 'Riche Makso', address: this.config.get('CONTACT_TO')! }
        : undefined,
      subject: `Re: ${m.subject || 'Votre message'}`,
      text: `${body}\n\n---\nLe ${m.createdAt.toISOString().slice(0, 10)}, ${m.name} a écrit :\n${m.body
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n')}`,
    });
    if (!sent)
      throw new ServiceUnavailableException('Email could not be sent (SMTP).');
    await this.prisma.message.update({
      where: { id },
      data: { status: MessageStatus.ARCHIVED },
    });
    await this.audit.log('message.reply', { userId, ip, target: id });
    return { ok: true };
  }
}
