"use server";

import { headers } from "next/headers";
import { API_URL } from "@/lib/api-url";
import { clientIpFrom } from "@/lib/client-ip";
import { hasLocale } from "@/lib/i18n";

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
  const ip = clientIpFrom(h.get("x-forwarded-for"));

  // The API stores the message, notifies the owner and sends the auto-reply. It also rate-limits
  // per IP; the visitor IP is forwarded with a shared key so limits apply to real clients.
  try {
    const res = await fetch(`${API_URL}/public/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.INTERNAL_API_KEY
          ? { "x-internal-key": process.env.INTERNAL_API_KEY, "x-client-ip": ip }
          : {}),
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        subject: values.subject || undefined,
        message: values.message,
        lang,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 429) return { status: "error", form: "rateLimited", values };
    if (!res.ok) return { status: "error", form: "server", values };
  } catch (error) {
    // Class only: never log the visitor's data.
    console.error("[contact] API unreachable:", (error as Error).name);
    return { status: "error", form: "server", values };
  }

  return { status: "success" };
}
