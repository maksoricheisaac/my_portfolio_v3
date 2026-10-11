import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Locale } from "@/lib/i18n";

/**
 * SMTP configuration comes only from environment variables (see .env.example).
 * Nothing here is ever sent to the client.
 */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
}

export function readMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER || undefined;
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    user,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.MAIL_FROM || user || "",
    to: process.env.CONTACT_TO || "maksoricheisaac@gmail.com",
  };
}

let cached: { key: string; transporter: Transporter } | null = null;

export function getTransporter(config: MailConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.user}`;
  if (cached?.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
  cached = { key, transporter };
  return transporter;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const autoReply: Record<Locale, { subject: string; body: (name: string) => string }> = {
  fr: {
    subject: "Votre message a bien été reçu",
    body: (name) =>
      `Bonjour ${name},\n\nMerci pour votre message : je l'ai bien reçu et je reviendrai vers vous très bientôt.\n\nRiche Makso\nDéveloppeur Full-Stack & Junior DevOps`,
  },
  en: {
    subject: "Your message has been received",
    body: (name) =>
      `Hello ${name},\n\nThank you for your message: I received it and will get back to you very soon.\n\nRiche Makso\nFull-Stack Developer & Junior DevOps`,
  },
};

export function autoReplyFor(lang: Locale, name: string) {
  const t = autoReply[lang];
  return { subject: t.subject, text: t.body(name) };
}
