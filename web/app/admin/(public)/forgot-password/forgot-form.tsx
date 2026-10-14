"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/admin/client";
import { btn, ErrorNote, Field, Input, Spinner } from "@/components/admin/ui";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/password/forgot", { method: "POST", json: { email } });
      // Same destination whether or not the account exists (no enumeration).
      window.location.assign(`/admin/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? "Trop de demandes. Réessayez dans quelques minutes."
          : "Demande impossible pour le moment.",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h1 className="font-display text-2xl font-semibold">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indiquez votre adresse e-mail : si elle correspond au compte, un code de réinitialisation
          à 6 chiffres vous sera envoyé.
        </p>
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
      <button type="submit" className={`${btn.primary} w-full`} disabled={busy || !email}>
        {busy && <Spinner />} Envoyer le code
      </button>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
