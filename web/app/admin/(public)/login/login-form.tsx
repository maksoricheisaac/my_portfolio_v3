"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/admin/client";
import { btn, ErrorNote, Field, Input, Spinner } from "@/components/admin/ui";

type Step =
  | { name: "credentials" }
  | { name: "otp"; challenge: string; emailHint: string };

/** Only same-site /admin paths are valid redirect targets (no open redirect). */
function safeNext(value: string | null): string {
  return value && /^\/admin(\/[\w\-./]*)?$/.test(value) && !value.startsWith("//")
    ? value
    : "/admin";
}

export function LoginForm() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>({ name: "credentials" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Unclaimed instance: send the owner to the setup wizard.
    api<{ required: boolean }>("/setup/status")
      .then((s) => s.required && window.location.replace("/admin/setup"))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step.name === "otp") codeRef.current?.focus();
  }, [step.name]);

  function done() {
    // Full navigation so the new session cookies are used by every request.
    window.location.assign(safeNext(params.get("next")));
  }

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<
        { step: "otp"; challenge: string; emailHint: string } | { step: "done" }
      >("/auth/login", { method: "POST", json: { email, password } });
      if (res.step === "done") return done();
      setStep({ name: "otp", challenge: res.challenge, emailHint: res.emailHint });
      setCooldown(30);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Identifiants incorrects."
          : err instanceof ApiError && err.status === 429
            ? "Trop de tentatives. Réessayez dans quelques minutes."
            : "Connexion impossible pour le moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    if (step.name !== "otp") return;
    setBusy(true);
    setError(null);
    try {
      await api("/auth/login/verify", {
        method: "POST",
        json: { challenge: step.challenge, code },
      });
      done();
    } catch (err) {
      setCode("");
      setError(
        err instanceof ApiError && err.status === 401
          ? "Code invalide ou expiré."
          : err instanceof ApiError && err.status === 429
            ? "Trop de tentatives. Patientez un instant."
            : "Vérification impossible pour le moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (step.name !== "otp") return;
    setError(null);
    setInfo(null);
    try {
      const res = await api<{ challenge: string }>("/auth/login/resend", {
        method: "POST",
        json: { challenge: step.challenge },
      });
      setStep({ ...step, challenge: res.challenge });
      setCooldown(30);
      setInfo("Un nouveau code vient d'être envoyé.");
    } catch {
      setError("Impossible de renvoyer le code pour le moment.");
    }
  }

  if (step.name === "otp") {
    return (
      <form onSubmit={submitCode} className="space-y-5" noValidate>
        <div>
          <h1 className="font-display text-2xl font-semibold">Vérification</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez le code à 6 chiffres envoyé à{" "}
            <span className="text-foreground">{step.emailHint}</span>. Il expire dans 10 minutes.
          </p>
        </div>
        <ErrorNote message={error} />
        {info && (
          <p role="status" className="text-sm text-emerald-300">
            {info}
          </p>
        )}
        <Field label="Code de vérification">
          {(id) => (
            <Input
              id={id}
              ref={codeRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="font-mono text-center text-2xl tracking-[0.5em]"
              required
            />
          )}
        </Field>
        <button type="submit" className={`${btn.primary} w-full`} disabled={busy || code.length !== 6}>
          {busy && <Spinner />} Valider
        </button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={cooldown > 0}
            onClick={resend}
          >
            {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep({ name: "credentials" });
              setCode("");
              setError(null);
            }}
          >
            Retour
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submitCredentials} className="space-y-5" noValidate>
      <div>
        <h1 className="font-display text-2xl font-semibold">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accès réservé au propriétaire du site.</p>
      </div>
      <ErrorNote message={error} />
      <Field label="Adresse e-mail">
        {(id) => (
          <Input
            id={id}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        )}
      </Field>
      <Field label="Mot de passe">
        {(id) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
      </Field>
      <button type="submit" className={`${btn.primary} w-full`} disabled={busy || !email || !password}>
        {busy && <Spinner />} Se connecter
      </button>
      <p className="text-center text-sm">
        <Link href="/admin/forgot-password" className="text-muted-foreground hover:text-foreground">
          Mot de passe oublié ?
        </Link>
      </p>
    </form>
  );
}
