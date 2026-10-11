"use server";

import { headers } from "next/headers";
import { autoReplyFor, escapeHtml, getTransporter, readMailConfig } from "@/lib/mail";
import { hasLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export type ErrorCode =
  | "nameRequired"
  | "emailInvalid"
  | "messageShort"
  | "messageLong"
  | "rateLimited"
  | "notConfigured"
  | "server";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      form?: ErrorCode;
      fields?: Partial<Record<"name" | "email" | "message", ErrorCode>>;
      values: { name: string; email: string; subject: string; message: string };
    };

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

// Best-effort, per-instance limiter. On serverless hosts each instance has its own memory:
// put a shared limiter (Redis, WAF…) in front if abuse becomes a concern.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

/** Single-line fields must never carry CR/LF (header injection). */
const oneLine = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, max);

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const langRaw = String(formData.get("lang") ?? "fr");
  const lang = hasLocale(langRaw) ? langRaw : "fr";

  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  if (String(formData.get("website") ?? "") !== "") return { status: "success" };

  const values = {
    name: oneLine(formData.get("name"), 100),
    email: oneLine(formData.get("email"), 254),
    subject: oneLine(formData.get("subject"), 150),
    message: String(formData.get("message") ?? "").replace(/\r\n/g, "\n").trim(),
  };

  const fields: Partial<Record<"name" | "email" | "message", ErrorCode>> = {};
  if (values.name.length < 2) fields.name = "nameRequired";
  if (!EMAIL_RE.test(values.email)) fields.email = "emailInvalid";
  if (values.message.length < 10) fields.message = "messageShort";
  else if (values.message.length > 5000) fields.message = "messageLong";
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { status: "error", form: "rateLimited", values };

  const config = readMailConfig();
  if (!config || !config.from) return { status: "error", form: "notConfigured", values };

  const transporter = getTransporter(config);
  const subjectLine = values.subject || values.name;

  try {
    // 1. Notification to the site owner.
    await transporter.sendMail({
      from: { name: `${site.name} — Portfolio`, address: config.from },
      to: config.to,
      replyTo: { name: values.name, address: values.email },
      subject: `[Portfolio] ${subjectLine}`,
      text: [
        "Ce message provient du formulaire de contact du portfolio.",
        "",
        `Nom : ${values.name}`,
        `Email : ${values.email}`,
        `Langue du site : ${lang}`,
        values.subject ? `Sujet : ${values.subject}` : "",
        "",
        values.message,
      ]
        .filter((l, i, a) => l !== "" || a[i - 1] !== "")
        .join("\n"),
      html: `<p><strong>Ce message provient du formulaire de contact du portfolio.</strong></p>
<p>Nom : ${escapeHtml(values.name)}<br>Email : ${escapeHtml(values.email)}<br>Langue du site : ${lang}${
        values.subject ? `<br>Sujet : ${escapeHtml(values.subject)}` : ""
      }</p>
<blockquote style="margin:0;padding-left:12px;border-left:3px solid #5b9bff;white-space:pre-wrap">${escapeHtml(values.message)}</blockquote>`,
    });
  } catch (error) {
    // Log the failure class only: never the visitor's data.
    console.error("[contact] owner notification failed:", (error as Error).name);
    return { status: "error", form: "server", values };
  }

  try {
    // 2. Confirmation to the visitor. A failure here must not fail the submission.
    const reply = autoReplyFor(lang, values.name);
    await transporter.sendMail({
      from: { name: site.name, address: config.from },
      to: values.email,
      subject: reply.subject,
      text: reply.text,
    });
  } catch (error) {
    console.error("[contact] auto-reply failed:", (error as Error).name);
  }

  return { status: "success" };
}
