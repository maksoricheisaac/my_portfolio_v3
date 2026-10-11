"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  sendContact,
  type ContactState,
  type ErrorCode,
} from "@/app/[lang]/contact/actions";
import type { Dictionary } from "@/content/dictionaries";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const initial: ContactState = { status: "idle" };

const field =
  "w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-subtle focus:border-signal aria-[invalid=true]:border-destructive";

export function ContactForm({
  lang,
  form,
}: {
  lang: Locale;
  form: Dictionary["contact"]["form"];
}) {
  const [state, action, pending] = useActionState(sendContact, initial);
  const error = state.status === "error" ? state : null;
  const msg = (code?: ErrorCode) => (code ? form.errors[code] : undefined);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === "success" ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="status"
          className="rounded-2xl border border-signal/40 bg-surface p-8"
        >
          <CheckCircle2 className="size-8 text-signal" aria-hidden="true" />
          <h3 className="font-display mt-4 text-2xl font-semibold">{form.successTitle}</h3>
          <p className="mt-2 text-muted-foreground">{form.successText}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          action={action}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <input type="hidden" name="lang" value={lang} />
          {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {error?.form && (
            <p role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
              {msg(error.form)}
            </p>
          )}
          {error?.fields && !error.form && (
            <p role="alert" className="sr-only">
              {form.errors.fix}
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="mb-2 block text-sm">
                {form.name}
              </label>
              <input
                id="cf-name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={error?.values.name}
                aria-invalid={Boolean(error?.fields?.name)}
                aria-describedby={error?.fields?.name ? "cf-name-err" : undefined}
                className={field}
              />
              {error?.fields?.name && (
                <p id="cf-name-err" className="mt-1.5 text-sm text-destructive">
                  {msg(error.fields.name)}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cf-email" className="mb-2 block text-sm">
                {form.email}
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                defaultValue={error?.values.email}
                aria-invalid={Boolean(error?.fields?.email)}
                aria-describedby={error?.fields?.email ? "cf-email-err" : undefined}
                className={field}
              />
              {error?.fields?.email && (
                <p id="cf-email-err" className="mt-1.5 text-sm text-destructive">
                  {msg(error.fields.email)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cf-subject" className="mb-2 block text-sm">
              {form.subject}
            </label>
            <input
              id="cf-subject"
              name="subject"
              maxLength={150}
              defaultValue={error?.values.subject}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="cf-message" className="mb-2 block text-sm">
              {form.message}
            </label>
            <textarea
              id="cf-message"
              name="message"
              rows={7}
              required
              maxLength={5000}
              defaultValue={error?.values.message}
              aria-invalid={Boolean(error?.fields?.message)}
              aria-describedby={error?.fields?.message ? "cf-message-err" : "cf-message-hint"}
              className={cn(field, "resize-y")}
            />
            {error?.fields?.message ? (
              <p id="cf-message-err" className="mt-1.5 text-sm text-destructive">
                {msg(error.fields.message)}
              </p>
            ) : (
              <p id="cf-message-hint" className="mt-1.5 text-sm text-subtle">
                {form.messageHint}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {pending ? form.sending : form.send}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
