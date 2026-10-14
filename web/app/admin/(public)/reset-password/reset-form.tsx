"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/admin/client";
import { btn, ErrorNote, Field, Input, Spinner } from "@/components/admin/ui";
import { PasswordHint, passwordIssues } from "@/components/admin/password-strength";

export function ResetForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirm !== "" && confirm !== password;
  const valid =
    email && code.length === 6 && passwordIssues(password).length === 0 && password === confirm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/password/reset", {
        method: "POST",
        json: { email, code, newPassword: password },
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? "Trop de tentatives. Réessayez dans quelques minutes."
          : err instanceof ApiError && err.status === 400 && err.message !== "Invalid or expired code"
            ? err.message
            : "Code invalide ou expiré.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-semibold">Mot de passe modifié</h1>
        <p className="text-sm text-muted-foreground">
          Toutes vos sessions ont été fermées. Vous pouvez vous reconnecter avec le nouveau mot de
          passe.
        </p>
        <Link href="/admin/login" className={`${btn.primary} w-full`}>
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h1 className="font-display text-2xl font-semibold">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez le code reçu par e-mail (valable 10 minutes) puis choisissez un nouveau mot de
          passe.
        </p>
      </div>
      <ErrorNote message={error} />
      <Field label="Adresse e-mail">
        {(id) => (
          <Input id={id} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        )}
      </Field>
      <Field label="Code à 6 chiffres">
        {(id) => (
          <Input
            id={id}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="font-mono tracking-[0.4em]"
            required
          />
        )}
      </Field>
      <Field label="Nouveau mot de passe">
        {(id) => (
          <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        )}
      </Field>
      <PasswordHint password={password} />
      <Field label="Confirmation" error={mismatch ? "Les mots de passe ne correspondent pas." : undefined}>
        {(id) => (
          <Input id={id} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} required />
        )}
      </Field>
      <button type="submit" className={`${btn.primary} w-full`} disabled={busy || !valid}>
        {busy && <Spinner />} Réinitialiser
      </button>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
