"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { History, KeyRound, LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { api, ApiError, type AdminUser, type AuditItem } from "@/lib/admin/client";
import { useAdminUser } from "@/components/admin/shell";
import { PasswordHint, passwordIssues } from "@/components/admin/password-strength";
import {
  Badge,
  btn,
  Card,
  ErrorNote,
  Field,
  Input,
  Loading,
  Spinner,
  Switch,
  Tabs,
  useToast,
  type TabItem,
} from "@/components/admin/ui";
import { actionLabel, formatDate } from "@/lib/admin/format";

interface SessionItem {
  id: string;
  current: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

function deviceName(ua: string | null): string {
  if (!ua) return "Appareil inconnu";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navigateur";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return `${browser}${os ? ` · ${os}` : ""}`;
}

function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mismatch = confirm !== "" && confirm !== next;
  const valid = current && passwordIssues(next).length === 0 && next === confirm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/password/change", {
        method: "POST",
        json: { currentPassword: current, newPassword: next },
      });
      toast.success("Mot de passe modifié. Les autres sessions ont été fermées.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Mot de passe" description="Changer le mot de passe ferme toutes les autres sessions.">
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <ErrorNote message={error} />
        <Field label="Mot de passe actuel">
          {(id) => <Input id={id} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />}
        </Field>
        <Field label="Nouveau mot de passe">
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />}
        </Field>
        <PasswordHint password={next} />
        <Field label="Confirmation" error={mismatch ? "Les mots de passe ne correspondent pas." : undefined}>
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />}
        </Field>
        <button type="submit" className={btn.primary} disabled={busy || !valid}>
          {busy ? <Spinner /> : <KeyRound className="size-4" />} Modifier le mot de passe
        </button>
      </form>
    </Card>
  );
}

function TwoFactor() {
  const user = useAdminUser();
  const toast = useToast();
  const [enabled, setEnabled] = useState(user.twoFactorEnabled);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);

  async function confirm(e: FormEvent) {
    e.preventDefault();
    if (pending === null) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api<AdminUser>("/auth/2fa", { method: "PATCH", json: { enabled: pending, password } });
      setEnabled(updated.twoFactorEnabled);
      toast.success(updated.twoFactorEnabled ? "Double authentification activée" : "Double authentification désactivée");
      setPending(null);
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Double authentification"
      description="Un code à 6 chiffres est envoyé par e-mail à chaque connexion, en plus du mot de passe."
      actions={<Badge tone={enabled ? "success" : "warn"}>{enabled ? "Activée" : "Désactivée"}</Badge>}
    >
      <Switch
        label="Exiger un code par e-mail à la connexion"
        hint={enabled ? undefined : "Fortement recommandé."}
        checked={pending ?? enabled}
        onChange={(v) => {
          setPending(v === enabled ? null : v);
          setError(null);
        }}
      />
      {pending !== null && (
        <form onSubmit={confirm} className="mt-5 max-w-md space-y-4">
          <ErrorNote message={error} />
          <Field label="Confirmez avec votre mot de passe">
            {(id) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />}
          </Field>
          <div className="flex gap-2">
            <button type="submit" className={btn.primary} disabled={busy || !password}>
              {busy ? <Spinner /> : <ShieldCheck className="size-4" />} Confirmer
            </button>
            <button type="button" className={btn.outline} onClick={() => setPending(null)}>Annuler</button>
          </div>
        </form>
      )}
    </Card>
  );
}

function Sessions() {
  const toast = useToast();
  const [items, setItems] = useState<SessionItem[] | null>(null);

  const load = useCallback(async () => {
    setItems(await api<SessionItem[]>("/auth/sessions"));
  }, []);
  useEffect(() => {
    api<SessionItem[]>("/auth/sessions")
      .then(setItems)
      .catch(() => undefined);
  }, []);

  async function revoke(id: string) {
    try {
      await api(`/auth/sessions/${id}`, { method: "DELETE" });
      toast.success("Session fermée");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Card title="Sessions actives" description="Appareils actuellement connectés à l'administration.">
      {!items ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="size-5 text-subtle" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">
                    {deviceName(s.userAgent)} {s.current && <Badge tone="info">Cette session</Badge>}
                  </p>
                  <p className="font-mono text-xs text-subtle">
                    {s.ip ?? "IP inconnue"} · {formatDate(s.createdAt, true)}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button type="button" className={btn.outline} onClick={() => void revoke(s.id)}>
                  <LogOut className="size-4" /> Fermer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function AuditLog() {
  const [data, setData] = useState<{ items: AuditItem[]; total: number } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api<{ items: AuditItem[]; total: number }>(`/admin/audit?page=${page}`).then(setData).catch(() => undefined);
  }, [page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / 30)) : 1;
  return (
    <Card title="Journal d'activité" description="Connexions, modifications et événements de sécurité.">
      {!data ? (
        <Loading />
      ) : (
        <>
          <ul className="divide-y divide-border">
            {data.items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span>
                  {actionLabel(a.action)}
                  {a.target && <span className="font-mono text-xs text-subtle"> · {a.target}</span>}
                </span>
                <span className="font-mono text-xs text-subtle">
                  {a.ip ?? "—"} · {formatDate(a.createdAt, true)}
                </span>
              </li>
            ))}
          </ul>
          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <button type="button" className={btn.ghost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
              <span className="font-mono text-xs text-subtle">{page}/{pages}</span>
              <button type="button" className={btn.ghost} disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant</button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

const sections: TabItem[] = [
  { id: "access", label: "Accès", icon: KeyRound },
  { id: "sessions", label: "Sessions", icon: MonitorSmartphone },
  { id: "activity", label: "Journal d'activité", icon: History },
];

export function SecurityPanel() {
  const [section, setSection] = useState("access");
  return (
    <div>
      <Tabs tabs={sections} value={section} onChange={setSection} label="Sécurité" idPrefix="sec" />
      <div id="sec-panel" role="tabpanel" aria-labelledby={`sec-${section}`} className="space-y-6">
        {section === "access" && (
          <>
            <TwoFactor />
            <ChangePassword />
          </>
        )}
        {section === "sessions" && <Sessions />}
        {section === "activity" && <AuditLog />}
      </div>
    </div>
  );
}
