"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { api, type MediaItem } from "@/lib/admin/client";
import { btn, ErrorNote, Loading, useToast } from "@/components/admin/ui";

export async function uploadImage(file: File, alt = ""): Promise<MediaItem> {
  const form = new FormData();
  form.set("file", file);
  if (alt) form.set("alt", alt);
  return api<MediaItem>("/admin/media", { method: "POST", body: form });
}

/** Modal image library: pick an existing image or upload a new one. */
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    api<MediaItem[]>("/admin/media")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const item = await uploadImage(file);
      toast.success("Image importée");
      onPick(item);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bibliothèque d'images"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-popover">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-lg font-semibold">Bibliothèque d&apos;images</h2>
          <div className="flex items-center gap-2">
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <button type="button" className={btn.primary} disabled={busy} onClick={() => input.current?.click()}>
              <ImageUp className="size-4" /> {busy ? "Import…" : "Importer"}
            </button>
            <button type="button" className={btn.ghost} onClick={onClose} aria-label="Fermer">
              <X className="size-4" />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto p-5">
          <ErrorNote message={error} />
          {!items && !error && <Loading />}
          {items && items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune image. Importez-en une (JPEG, PNG, WebP ou AVIF, 8 Mo max).
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items?.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(m);
                    onClose();
                  }}
                  className="group block w-full overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-signal"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt} className="aspect-video w-full object-cover" loading="lazy" />
                  <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">
                    {m.original}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
