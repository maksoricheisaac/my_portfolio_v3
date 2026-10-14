"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImageUp, Trash2 } from "lucide-react";
import { api, type MediaItem } from "@/lib/admin/client";
import { uploadImage } from "@/components/admin/media-picker";
import { btn, ErrorNote, Input, Loading, PageTitle, Spinner, useToast } from "@/components/admin/ui";
import { formatBytes } from "@/lib/admin/format";

export default function MediaPage() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api<MediaItem[]>("/admin/media"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    api<MediaItem[]>("/admin/media")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      try {
        await uploadImage(file);
      } catch (e) {
        toast.error(`${file.name} : ${(e as Error).message}`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    await load();
  }

  async function saveAlt(m: MediaItem, alt: string) {
    if (alt === m.alt) return;
    try {
      await api(`/admin/media/${m.id}`, { method: "PATCH", json: { alt } });
      setItems((prev) => prev?.map((x) => (x.id === m.id ? { ...x, alt } : x)) ?? null);
      toast.success("Texte alternatif enregistré");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(m: MediaItem) {
    if (!window.confirm("Supprimer cette image ? Elle disparaîtra des contenus qui l'utilisent.")) return;
    try {
      await api(`/admin/media/${m.id}`, { method: "DELETE" });
      setItems((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
      toast.success("Image supprimée");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function copy(m: MediaItem) {
    await navigator.clipboard.writeText(`${window.location.origin}${m.url}`).catch(() => undefined);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <PageTitle
        title="Médias"
        description="Les images sont vérifiées, nettoyées de leurs métadonnées et converties en WebP."
        actions={
          <>
            <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => void onFiles(e.target.files)} />
            <button type="button" className={btn.primary} disabled={busy} onClick={() => input.current?.click()}>
              {busy ? <Spinner /> : <ImageUp className="size-4" />} Importer des images
            </button>
          </>
        }
      />
      <ErrorNote message={error} />
      {!items && !error && <Loading />}
      {items && items.length === 0 && <p className="text-sm text-muted-foreground">Aucune image importée.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-2xl border border-border bg-surface/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="space-y-3 p-4">
              <p className="truncate text-sm font-medium">{m.original}</p>
              <p className="font-mono text-xs text-subtle">
                {m.width}×{m.height} · {formatBytes(m.size)}
              </p>
              <Input
                aria-label="Texte alternatif"
                placeholder="Texte alternatif (accessibilité & SEO)"
                defaultValue={m.alt}
                onBlur={(e) => void saveAlt(m, e.target.value)}
              />
              <div className="flex gap-2">
                <button type="button" className={btn.outline} onClick={() => void copy(m)}>
                  {copied === m.id ? <Check className="size-4" /> : <Copy className="size-4" />} Copier l&apos;URL
                </button>
                <button type="button" className={btn.danger} onClick={() => void remove(m)}>
                  <Trash2 className="size-4" /> Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
