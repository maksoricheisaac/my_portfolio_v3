"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Archive, Inbox, Mail, MailOpen, Search, Send, ShieldAlert, Trash2 } from "lucide-react";
import { api, type AdminMessage, type MessageStatus } from "@/lib/admin/client";
import {
  Badge,
  btn,
  ErrorNote,
  Input,
  Loading,
  PageTitle,
  Spinner,
  Textarea,
  useToast,
} from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

interface Page {
  items: AdminMessage[];
  total: number;
  page: number;
  pageSize: number;
  counts: Partial<Record<MessageStatus, number>>;
}

const FILTERS: { key: MessageStatus | "ALL"; label: string; icon: typeof Inbox }[] = [
  { key: "ALL", label: "Boîte de réception", icon: Inbox },
  { key: "NEW", label: "Non lus", icon: Mail },
  { key: "READ", label: "Lus", icon: MailOpen },
  { key: "ARCHIVED", label: "Archivés", icon: Archive },
  { key: "SPAM", label: "Indésirables", icon: ShieldAlert },
];

function Messages() {
  const params = useSearchParams();
  const toast = useToast();
  const [filter, setFilter] = useState<MessageStatus | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ page: String(page) });
    if (filter !== "ALL") qs.set("status", filter);
    if (q) qs.set("q", q);
    try {
      setData(await api<Page>(`/admin/messages?${qs}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [filter, q, page]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 200);
    return () => clearTimeout(t);
  }, [load]);

  const openId = params.get("open");
  useEffect(() => {
    if (openId) void open(openId);
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function open(id: string) {
    try {
      const m = await api<AdminMessage>(`/admin/messages/${id}`);
      setSelected(m);
      setReply("");
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function setStatus(m: AdminMessage, status: MessageStatus) {
    try {
      const updated = await api<AdminMessage>(`/admin/messages/${m.id}`, {
        method: "PATCH",
        json: { status },
      });
      setSelected(updated);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(m: AdminMessage) {
    if (!window.confirm("Supprimer définitivement ce message ?")) return;
    try {
      await api(`/admin/messages/${m.id}`, { method: "DELETE" });
      setSelected(null);
      toast.success("Message supprimé");
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function sendReply() {
    if (!selected || reply.trim().length < 2) return;
    setSending(true);
    try {
      await api(`/admin/messages/${selected.id}/reply`, { method: "POST", json: { body: reply } });
      toast.success("Réponse envoyée");
      setReply("");
      void open(selected.id);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageTitle title="Messages" description="Messages reçus via le formulaire de contact." />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count = f.key === "ALL" ? undefined : data?.counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              aria-pressed={filter === f.key}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                filter === f.key ? "border-signal/60 bg-signal/10" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {f.label}
              {count ? <span className="font-mono text-xs text-subtle">{count}</span> : null}
            </button>
          );
        })}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <Input aria-label="Rechercher" placeholder="Rechercher…" className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>

      {!data && !error && <Loading />}
      {data && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border">
            {data.items.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Aucun message.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.items.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => void open(m.id)}
                      aria-current={selected?.id === m.id}
                      className={cn(
                        "block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        selected?.id === m.id && "bg-muted/70",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", m.status === "NEW" ? "font-semibold" : "font-medium")}>
                          {m.name}
                        </span>
                        <span className="font-mono shrink-0 text-[0.68rem] text-subtle">{formatDate(m.createdAt, true)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{m.subject || m.body}</span>
                      {m.status === "NEW" && <span className="mt-1.5 inline-block"><Badge tone="info">Nouveau</Badge></span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-sm">
                <button type="button" className={btn.ghost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
                <span className="font-mono text-xs text-subtle">{page}/{pages}</span>
                <button type="button" className={btn.ghost} disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant</button>
              </div>
            )}
          </div>

          <div className="min-h-64 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Sélectionnez un message pour le lire.</p>
            ) : (
              <article className="space-y-5">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold">{selected.subject || `Message de ${selected.name}`}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.name} · <a className="text-signal hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                    </p>
                    <p className="font-mono mt-1 text-xs text-subtle">
                      {formatDate(selected.createdAt)} · langue {selected.lang.toUpperCase()}
                      {!selected.mailSent && " · notification e-mail non envoyée"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className={btn.ghost} onClick={() => setStatus(selected, "ARCHIVED")}><Archive className="size-4" /> Archiver</button>
                    <button type="button" className={btn.ghost} onClick={() => setStatus(selected, selected.status === "SPAM" ? "READ" : "SPAM")}>
                      <ShieldAlert className="size-4" /> {selected.status === "SPAM" ? "Pas du spam" : "Spam"}
                    </button>
                    <button type="button" className={cn(btn.ghost, "text-destructive")} onClick={() => remove(selected)}><Trash2 className="size-4" /> Supprimer</button>
                  </div>
                </header>
                {/* Plain text only: never rendered as HTML. */}
                <p className="whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                  {selected.body}
                </p>
                <div className="space-y-2">
                  <label htmlFor="reply" className="text-sm font-medium">Répondre par e-mail</label>
                  <Textarea id="reply" rows={5} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Bonjour ${selected.name},`} />
                  <button type="button" className={btn.primary} disabled={sending || reply.trim().length < 2} onClick={sendReply}>
                    {sending ? <Spinner /> : <Send className="size-4" />} Envoyer la réponse
                  </button>
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Messages />
    </Suspense>
  );
}
