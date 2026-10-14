"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderKanban, ImageIcon, Mail, Rocket } from "lucide-react";
import { api, type AuditItem } from "@/lib/admin/client";
import { useAdminUser } from "@/components/admin/shell";
import { Badge, Card, ErrorNote, Loading, PageTitle } from "@/components/admin/ui";
import { actionLabel, formatDate } from "@/lib/admin/format";

interface Summary {
  projects: { total: number; published: number; drafts: number };
  messages: { new: number; last30Days: number };
  media: number;
  recentMessages: { id: string; name: string; email: string; subject: string | null; status: string; createdAt: string }[];
  recentActivity: AuditItem[];
  messagesPerDay: { date: string; count: number }[];
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: number;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-signal/50"
    >
      <Icon className="size-5 text-signal" aria-hidden="true" />
      <p className="font-display mt-4 text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
      <p className="text-xs text-subtle">{hint}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAdminUser();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Summary>("/admin/dashboard").then(setData).catch((e: Error) => setError(e.message));
  }, []);

  const max = Math.max(1, ...(data?.messagesPerDay.map((d) => d.count) ?? [1]));

  return (
    <>
      <PageTitle
        title={`Bonjour ${user.name.split(" ")[0]}`}
        description={
          user.lastLoginAt ? `Dernière connexion : ${formatDate(user.lastLoginAt)}` : undefined
        }
      />
      <ErrorNote message={error} />
      {!data && !error && <Loading />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={FolderKanban} label="Projets" value={data.projects.total} hint={`${data.projects.published} publiés · ${data.projects.drafts} brouillons`} href="/admin/projects" />
            <Stat icon={Mail} label="Messages non lus" value={data.messages.new} hint={`${data.messages.last30Days} sur 30 jours`} href="/admin/messages" />
            <Stat icon={ImageIcon} label="Images" value={data.media} hint="Bibliothèque de médias" href="/admin/media" />
            <Stat icon={Rocket} label="Publiés" value={data.projects.published} hint="Visibles sur le site" href="/admin/projects?published=true" />
          </div>

          <Card title="Messages reçus" description="30 derniers jours">
            <div className="flex h-28 items-end gap-1" role="img" aria-label="Messages reçus par jour sur 30 jours">
              {data.messagesPerDay.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date} : ${d.count}`}
                  className="flex-1 rounded-t bg-signal/70"
                  style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
                />
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Derniers messages">
              {data.recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentMessages.map((m) => (
                    <li key={m.id}>
                      <Link href={`/admin/messages?open=${m.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-signal">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{m.name}</span>
                          <span className="block truncate text-xs text-subtle">{m.subject || m.email}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {m.status === "NEW" && <Badge tone="info">Nouveau</Badge>}
                          <span className="font-mono text-xs text-subtle">{formatDate(m.createdAt, true)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Activité récente">
              <ul className="divide-y divide-border">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>{actionLabel(a.action)}</span>
                    <span className="font-mono text-xs text-subtle">{formatDate(a.createdAt, true)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
