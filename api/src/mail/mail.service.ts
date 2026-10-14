import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfig } from '../config/app-config.service';

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: { name: string; address: string };
  fromName?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: AppConfig) {}

  get enabled(): boolean {
    return Boolean(this.config.get('SMTP_HOST') && this.from);
  }

  private get from(): string {
    return this.config.get('MAIL_FROM') || this.config.get('SMTP_USER') || '';
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;
    const port = this.config.get('SMTP_PORT');
    const user = this.config.get('SMTP_USER');
    const secureFlag = this.config.get('SMTP_SECURE');
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port,
      secure: secureFlag ? secureFlag === 'true' : port === 465,
      auth: user ? { user, pass: this.config.get('SMTP_PASS') } : undefined,
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
    return this.transporter;
  }

  /** Returns true when the mail was handed to the SMTP server. Never throws. */
  async send(input: MailInput): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn(
        `SMTP not configured: mail "${input.subject}" was not sent.`,
      );
      return false;
    }
    try {
      await this.getTransporter().sendMail({
        from: { name: input.fromName ?? 'Portfolio', address: this.from },
        to: input.to,
        replyTo: input.replyTo,
        subject: input.subject.replace(/[\r\n]+/g, ' '),
        text: input.text,
        html: input.html,
      });
      return true;
    } catch (error) {
      // Class only: never log recipients, codes or message bodies.
      this.logger.error(
        `Mail "${input.subject}" failed: ${(error as Error).name}`,
      );
      return false;
    }
  }

  /** Development convenience: without SMTP, show the OTP in the server console (never in prod). */
  devEcho(label: string, value: string) {
    if (!this.config.isProd && !this.enabled) {
      this.logger.warn(`[dev only] ${label}: ${value}`);
    }
  }
}
