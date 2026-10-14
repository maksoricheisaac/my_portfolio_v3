"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, FileText, FolderKanban, Plus, Search, Star } from "lucide-react";
import { api, type AdminProject } from "@/lib/admin/client";
import {
  Badge,
  btn,
  Card,
  ErrorNote,
  Input,
  Loading,
  PageTitle,
  StatCard,
  useToast,
} from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";

function computeStats(list: AdminProject[]) {
  const published = list.filter((p) => p.published).length;
  return {
    total: list.length,
    published,
    drafts: list.length - published,
    featured: list.filter((p) => p.featured).length,
  };
}

export default function ProjectsPage() {
  const toast = useToast();
  const [items, setItems] = useState<AdminProject[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ total: number; published: number; drafts: number; featured: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api<AdminProject[]>(`/admin/projects${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setItems(list);
      // Stats describe the whole catalogue, so only refresh them from an unfiltered load.
      if (!q) setStats(computeStats(list));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 200);
    return () => clearTimeout(t);
  }, [load]);

  async function move(index: number, delta: -1 | 1) {
    if (!items) return;
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await api("/admin/projects/order", { method: "PUT", json: { ids: next.map((p) => p.id) } });
    } catch (e) {
      toast.error((e as Error).message);
      void load();
    }
  }

  async function importSeed() {
    setImporting(true);
    try {
      const r = await api<{ created: number }>("/admin/projects/import-seed", { method: "POST" });
      toast.success(`${r.created} projet(s) importé(s)`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function togglePublished(p: AdminProject) {
    try {
      const updated = await api<AdminProject>(`/admin/projects/${p.id}`, {
        method: "PATCH",
        json: { published: !p.published },
      });
      setItems((prev) => prev?.map((x) => (x.id === p.id ? updated : x)) ?? null);
      setStats((st) =>
        st && {
          ...st,
          published: st.published + (updated.published ? 1 : -1),
          drafts: st.drafts + (updated.published ? -1 : 1),
        },
      );
      toast.success(updated.published ? "Projet publié" : "Projet repassé en brouillon");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle
        title="Projets"
        description="Gérez les projets affichés sur le portfolio. Les changements sont publiés immédiatement."
        actions={
          <Link href="/admin/projects/new" className={btn.primary}>
            <Plus className="size-4" /> Nouveau projet
          </Link>
        }
      />
      <ErrorNote message={error} />
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={FolderKanban} label="Projets" value={stats.total} hint="Total dans le catalogue" />
          <StatCard icon={Eye} label="Publiés" value={stats.published} hint="Visibles sur le site" />
          <StatCard icon={FileText} label="Brouillons" value={stats.drafts} hint="Non visibles publiquement" />
          <StatCard icon={Star} label="Mis en avant" value={stats.featured} hint="Affichés en page d'accueil" />
        </div>
      )}
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
        <Input
          aria-label="Rechercher un projet"
          placeholder="Rechercher…"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {!items && !error && <Loading />}
      {items && (
        <Card className="p-0 sm:p-0">
          {items.length === 0 ? (
            <div className="flex flex-wrap items-center gap-4 p-6">
              <p className="text-sm text-muted-foreground">Aucun projet.</p>
              {!q && (
                <button type="button" className={btn.outline} disabled={importing} onClick={importSeed}>
                  <Download className="size-4" />
                  {importing ? "Import…" : "Importer les projets d'origine"}
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((p, i) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                  <div className="flex flex-col">
                    <button type="button" aria-label="Monter" disabled={i === 0 || Boolean(q)} onClick={() => move(i, -1)} className="rounded p-0.5 text-subtle hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="size-4" />
                    </button>
                    <button type="button" aria-label="Descendre" disabled={i === items.length - 1 || Boolean(q)} onClick={() => move(i, 1)} className="rounded p-0.5 text-subtle hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                  <Link href={`/admin/projects/${p.id}`} className="min-w-0 flex-1 hover:text-signal">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.title}</span>
                      {p.featured && <Star className="size-3.5 shrink-0 fill-amber-300 text-amber-300" aria-label="Mis en avant" />}
                    </span>
                    <span className="block truncate font-mono text-xs text-subtle">
                      /{p.slug} · modifié {formatDate(p.updatedAt, true)}
                    </span>
                  </Link>
                  <Badge tone={p.published ? "success" : "warn"}>{p.published ? "Publié" : "Brouillon"}</Badge>
                  <button type="button" className={btn.ghost} onClick={() => togglePublished(p)}>
                    {p.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    {p.published ? "Dépublier" : "Publier"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
