"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, MailCheck, MailWarning } from "lucide-react";
import { api, ApiError } from "@/lib/admin/client";
import { PasswordHint, passwordIssues } from "@/components/admin/password-strength";
import {
  btn,
  ErrorNote,
  Field,
  Input,
  Loading,
  Spinner,
  Switch,
  Textarea,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const STEPS = ["Bienvenue", "Compte", "E-mail", "Site", "Terminer"] as const;

interface State {
  token: string;
  name: string;
  email: string;
  password: string;
  confirm: string;
  challenge: string;
  code: string;
  twoFactor: boolean;
  siteTitleFr: string;
  siteTitleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  indexable: boolean;
  importProjects: boolean;
}

const INITIAL: State = {
  token: "",
  name: "",
  email: "",
  password: "",
  confirm: "",
  challenge: "",
  code: "",
  twoFactor: true,
  siteTitleFr: "Riche Makso — Développeur Full-Stack & Junior DevOps",
  siteTitleEn: "Riche Makso — Full-Stack Developer & Junior DevOps",
  descriptionFr: "",
  descriptionEn: "",
  indexable: true,
  importProjects: true,
};

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Progression">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
              i < step && "border-signal bg-signal text-primary-foreground",
              i === step && "border-signal text-signal",
              i > step && "border-border text-subtle",
            )}
          >
            {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
          </span>
          <span className={cn("hidden text-xs sm:block", i === step ? "text-foreground" : "text-subtle")}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export function SetupWizard() {
  const [loading, setLoading] = useState(true);
  const [mailEnabled, setMailEnabled] = useState(false);
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [done, setDone] = useState<{ twoFactorEnabled: boolean; projects: number } | null>(null);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    api<{ required: boolean; mailEnabled: boolean }>("/setup/status")
      .then((r) => {
        if (!r.required) {
          window.location.replace("/admin/login");
          return;
        }
        setMailEnabled(r.mailEnabled);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de joindre l'API.");
        setLoading(false);
      });
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      const err = e as ApiError;
      setError(
        err.status === 401
          ? "Code d'installation invalide."
          : err.status === 429
            ? "Trop de tentatives. Patientez quelques minutes."
            : err.status === 404
              ? "L'installation est déjà terminée."
              : err.message,
      );
    } finally {
      setBusy(false);
    }
  }

  const next = () => {
    setError(null);
    setStep((x) => x + 1);
  };
  const back = () => {
    setError(null);
    setStep((x) => Math.max(0, x - 1));
  };

  const checkToken = () =>
    run(async () => {
      await api("/setup/token", { method: "POST", json: { token: s.token } });
      next();
    });

  const sendCode = () =>
    run(async () => {
      const r = await api<{ challenge: string }>("/setup/email/send", {
        method: "POST",
        json: { token: s.token, email: s.email },
      });
      set("challenge", r.challenge);
      set("code", "");
      setCodeSent(true);
    });

  const complete = () =>
    run(async () => {
      const r = await api<{ twoFactorEnabled: boolean; projects: number }>("/setup/complete", {
        method: "POST",
        json: {
          token: s.token,
          name: s.name,
          email: s.email,
          password: s.password,
          challenge: mailEnabled ? s.challenge : undefined,
          code: mailEnabled ? s.code : undefined,
          twoFactor: s.twoFactor,
          importProjects: s.importProjects,
          indexable: s.indexable,
          siteTitleFr: s.siteTitleFr,
          siteTitleEn: s.siteTitleEn,
          descriptionFr: s.descriptionFr,
          descriptionEn: s.descriptionEn,
        },
      });
      setDone(r);
    });

  if (loading) return <Loading />;

  if (done) {
    return (
      <div className="space-y-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-signal/15 text-signal">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-semibold">Installation terminée</h1>
        <p className="text-sm text-muted-foreground">
          Votre compte administrateur est créé
          {done.projects > 0 ? ` et ${done.projects} projets ont été importés` : ""}.{" "}
          {done.twoFactorEnabled
            ? "Un code de vérification vous sera envoyé par e-mail à chaque connexion."
            : "La double authentification est désactivée : activez-la dès que l'envoi d'e-mails est configuré (Sécurité)."}
        </p>
        <Link href="/admin/login" className={`${btn.primary} w-full`}>
          Se connecter
        </Link>
      </div>
    );
  }

  const passwordOk = passwordIssues(s.password).length === 0 && s.password === s.confirm;
  const mismatch = s.confirm !== "" && s.confirm !== s.password;
  const emailOk = EMAIL_RE.test(s.email);

  return (
    <div>
      <Stepper step={step} />
      <ErrorNote message={error} />

      {step === 0 && (
        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void checkToken();
          }}
        >
          <div>
            <h1 className="font-display text-2xl font-semibold">Bienvenue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cette installation n&apos;a pas encore de propriétaire. Pour prouver que vous
              administrez le serveur, saisissez le <strong>code d&apos;installation</strong> affiché
              dans les journaux de l&apos;API (Dokploy → service <code>api</code> → Logs), ou la valeur
              de <code>SETUP_TOKEN</code>.
            </p>
          </div>
          <Field label="Code d'installation">
            {(id) => (
              <Input
                id={id}
                value={s.token}
                onChange={(e) => set("token", e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                autoFocus
              />
            )}
          </Field>
          <button type="submit" className={`${btn.primary} w-full`} disabled={busy || s.token.trim().length < 8}>
            {busy && <Spinner />} Continuer
          </button>
        </form>
      )}

      {step === 1 && (
        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <h1 className="font-display text-2xl font-semibold">Compte administrateur</h1>
          <Field label="Nom">
            {(id) => <Input id={id} value={s.name} maxLength={100} onChange={(e) => set("name", e.target.value)} autoComplete="name" autoFocus />}
          </Field>
          <Field label="Adresse e-mail" hint="Elle sert à vous connecter et à recevoir les codes de vérification.">
            {(id) => (
              <Input
                id={id}
                type="email"
                value={s.email}
                onChange={(e) => {
                  set("email", e.target.value);
                  setCodeSent(false);
                  set("challenge", "");
                }}
                autoComplete="username"
              />
            )}
          </Field>
          <Field label="Mot de passe">
            {(id) => <Input id={id} type="password" value={s.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />}
          </Field>
          <PasswordHint password={s.password} />
          <Field label="Confirmation" error={mismatch ? "Les mots de passe ne correspondent pas." : undefined}>
            {(id) => <Input id={id} type="password" value={s.confirm} onChange={(e) => set("confirm", e.target.value)} autoComplete="new-password" aria-invalid={mismatch} />}
          </Field>
          <div className="flex gap-2">
            <button type="button" className={btn.outline} onClick={back}><ChevronLeft className="size-4" /> Retour</button>
            <button type="submit" className={`${btn.primary} flex-1`} disabled={s.name.trim().length < 2 || !emailOk || !passwordOk}>
              Continuer
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-5">
          <h1 className="font-display text-2xl font-semibold">Vérification e-mail</h1>
          {mailEnabled ? (
            <>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                L&apos;envoi d&apos;e-mails est configuré. Confirmez que vous recevez bien les messages à{" "}
                <span className="text-foreground">{s.email}</span> : c&apos;est ce qui permettra la
                double authentification.
              </p>
              {!codeSent ? (
                <button type="button" className={`${btn.primary} w-full`} disabled={busy} onClick={sendCode}>
                  {busy && <Spinner />} Envoyer le code de vérification
                </button>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    next();
                  }}
                >
                  <Field label="Code reçu par e-mail (6 chiffres)">
                    {(id) => (
                      <Input
                        id={id}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={s.code}
                        onChange={(e) => set("code", e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="font-mono text-center text-2xl tracking-[0.5em]"
                        autoFocus
                      />
                    )}
                  </Field>
                  <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={sendCode} disabled={busy}>
                    Renvoyer un code
                  </button>
                  <Switch
                    label="Exiger un code par e-mail à chaque connexion"
                    hint="Double authentification, fortement recommandée."
                    checked={s.twoFactor}
                    onChange={(v) => set("twoFactor", v)}
                  />
                  <button type="submit" className={`${btn.primary} w-full`} disabled={s.code.length !== 6}>
                    Continuer
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span>
                  Aucun serveur SMTP n&apos;est configuré : la double authentification et la
                  récupération du mot de passe par e-mail ne fonctionneront pas. Le compte sera créé
                  <strong> sans double authentification</strong>. Renseignez <code>SMTP_HOST</code>,
                  <code> SMTP_USER</code>… côté API, puis activez-la dans Sécurité.
                </span>
              </p>
              <button type="button" className={`${btn.primary} w-full`} onClick={next}>
                Continuer sans e-mail
              </button>
            </>
          )}
          <button type="button" className={btn.outline} onClick={back}><ChevronLeft className="size-4" /> Retour</button>
        </div>
      )}

      {step === 3 && (
        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <h1 className="font-display text-2xl font-semibold">Votre site</h1>
          <Field label="Titre du site (FR)" hint="50–60 caractères recommandés.">
            {(id) => <Input id={id} maxLength={70} value={s.siteTitleFr} onChange={(e) => set("siteTitleFr", e.target.value)} />}
          </Field>
          <Field label="Titre du site (EN)">
            {(id) => <Input id={id} maxLength={70} value={s.siteTitleEn} onChange={(e) => set("siteTitleEn", e.target.value)} />}
          </Field>
          <Field label="Description (FR)" hint="120–160 caractères recommandés.">
            {(id) => <Textarea id={id} rows={2} maxLength={170} value={s.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} />}
          </Field>
          <Field label="Description (EN)">
            {(id) => <Textarea id={id} rows={2} maxLength={170} value={s.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />}
          </Field>
          <Switch label="Autoriser l'indexation par les moteurs de recherche" checked={s.indexable} onChange={(v) => set("indexable", v)} />
          <Switch
            label="Importer les projets existants"
            hint="Reprend les projets du portfolio pour les gérer depuis l'admin."
            checked={s.importProjects}
            onChange={(v) => set("importProjects", v)}
          />
          <div className="flex gap-2">
            <button type="button" className={btn.outline} onClick={back}><ChevronLeft className="size-4" /> Retour</button>
            <button type="submit" className={`${btn.primary} flex-1`} disabled={!s.siteTitleFr.trim() || !s.siteTitleEn.trim()}>
              Continuer
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="mt-4 space-y-5">
          <h1 className="font-display text-2xl font-semibold">Récapitulatif</h1>
          <dl className="divide-y divide-border rounded-xl border border-border text-sm">
            {[
              ["Administrateur", `${s.name} · ${s.email}`],
              ["Double authentification", mailEnabled && s.twoFactor ? "Activée" : "Désactivée"],
              ["Titre (FR)", s.siteTitleFr],
              ["Indexation", s.indexable ? "Autorisée" : "Interdite"],
              ["Projets", s.importProjects ? "Import des projets existants" : "Aucun import"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2">
            <button type="button" className={btn.outline} onClick={back}><ChevronLeft className="size-4" /> Retour</button>
            <button type="button" className={`${btn.primary} flex-1`} disabled={busy} onClick={complete}>
              {busy && <Spinner />} Terminer l&apos;installation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
