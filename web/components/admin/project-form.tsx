"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Copy, ExternalLink, ImageIcon, Save, Trash2, X } from "lucide-react";
import { api, ApiError, type AdminProject } from "@/lib/admin/client";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichEditor } from "@/components/admin/rich-editor";
import {
  btn,
  Card,
  ErrorNote,
  Field,
  Input,
  PageTitle,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const DETAILS_TEMPLATE = JSON.stringify(
  {
    context: { fr: "", en: "" },
    goals: [{ fr: "", en: "" }],
    solution: { fr: "", en: "" },
    features: [{ fr: "", en: "" }],
    responsibilities: [{ fr: "", en: "" }],
    architecture: [{ label: { fr: "", en: "" }, items: [""] }],
    decisions: [{ name: "", why: { fr: "", en: "" } }],
    challenges: [{ problem: { fr: "", en: "" }, solution: { fr: "", en: "" } }],
    nextSteps: [{ fr: "", en: "" }],
  },
  null,
  2,
);

type Draft = Omit<AdminProject, "id" | "createdAt" | "updatedAt" | "cover" | "details"> & {
  cover: AdminProject["cover"];
  detailsText: string;
};

const CATEGORIES = [
  ["saas", "SaaS / Produit"],
  ["entrepreneurship", "Entrepreneuriat"],
  ["impact", "Impact"],
  ["infra", "Infrastructure / DevOps"],
] as const;
const STATUSES = [
  ["stabilizing", "En stabilisation"],
  ["development", "En développement"],
  ["concept", "Concept"],
  ["designdev", "Design & développement"],
  ["studio", "Studio"],
  ["professional", "Mission professionnelle"],
] as const;
const VISUALS = ["marketplace", "studio", "pos", "sports", "maintenance", "pipeline"] as const;

export function emptyDraft(): Draft {
  return {
    slug: "",
    published: false,
    featured: false,
    sortOrder: 1000,
    category: "saas",
    status: "development",
    visual: "marketplace",
    domain: "fullstack",
    confidential: false,
    stackPlanned: false,
    stack: [],
    title: "",
    taglineFr: "",
    taglineEn: "",
    summaryFr: "",
    summaryEn: "",
    problemFr: "",
    problemEn: "",
    contributionFr: "",
    contributionEn: "",
    contentFr: "",
    contentEn: "",
    liveUrl: null,
    repoUrl: null,
    siteUrl: null,
    coverId: null,
    cover: null,
    detailsText: "",
    related: [],
    seoTitleFr: null,
    seoTitleEn: null,
    seoDescriptionFr: null,
    seoDescriptionEn: null,
  };
}

function toDraft(p: AdminProject): Draft {
  const rest: Partial<AdminProject> = { ...p };
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  delete rest.details;
  return {
    ...(rest as Omit<Draft, "detailsText">),
    detailsText: p.details ? JSON.stringify(p.details, null, 2) : "",
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function Counter({ value, max, min = 0 }: { value: string; max: number; min?: number }) {
  const n = value.length;
  const tone = n > max ? "text-destructive" : n >= min && n > 0 ? "text-emerald-300" : "text-subtle";
  return (
    <span className={cn("font-mono text-[0.7rem]", tone)}>
      {n}/{max}
    </span>
  );
}

function SnippetPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="truncate font-mono text-xs text-subtle">{url}</p>
      <p className="mt-1 truncate text-lg text-[#8ab4f8]">{title || "Titre de la page"}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
        {description || "Description affichée dans les résultats de recherche."}
      </p>
    </div>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 space-y-6">
      {children}
    </div>
  );
}

export function ProjectForm({ initial }: { initial?: AdminProject }) {
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState<Draft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [stackText, setStackText] = useState(() => (initial ? initial.stack.join(", ") : ""));
  const [relatedText, setRelatedText] = useState(() => (initial ? initial.related.join(", ") : ""));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const isNew = !initial;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pageUrl = useMemo(
    () => `${typeof window === "undefined" ? "" : window.location.origin}/${lang}/${lang === "fr" ? "projets" : "projects"}/${d.slug || "…"}`,
    [lang, d.slug],
  );

  async function save() {
    setErrors([]);
    let details: Record<string, unknown> | null = null;
    if (d.detailsText.trim()) {
      try {
        const parsed: unknown = JSON.parse(d.detailsText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
        details = parsed as Record<string, unknown>;
      } catch {
        setErrors(["Le champ « Étude de cas structurée » n'est pas un objet JSON valide."]);
        return;
      }
    }
    const list = (v: string) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const rest: Partial<Draft> = { ...d };
    delete rest.cover;
    delete rest.detailsText;
    const payload = {
      ...rest,
      stack: list(stackText),
      related: list(relatedText),
      details,
    };

    setBusy(true);
    try {
      if (isNew) {
        const created = await api<AdminProject>("/admin/projects", { method: "POST", json: payload });
        toast.success("Projet créé");
        setDirty(false);
        router.replace(`/admin/projects/${created.id}`);
      } else {
        const updated = await api<AdminProject>(`/admin/projects/${initial.id}`, {
          method: "PATCH",
          json: payload,
        });
        setD(toDraft(updated));
        setStackText(updated.stack.join(", "));
        setRelatedText(updated.related.join(", "));
        setDirty(false);
        toast.success("Modifications enregistrées — le site est mis à jour");
      }
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.details?.length ? err.details : [err.message]);
      toast.error("Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    if (!initial) return;
    try {
      const copy = await api<AdminProject>(`/admin/projects/${initial.id}/duplicate`, { method: "POST" });
      toast.success("Projet dupliqué (brouillon)");
      router.push(`/admin/projects/${copy.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!window.confirm(`Supprimer définitivement « ${initial.title} » ?`)) return;
    try {
      await api(`/admin/projects/${initial.id}`, { method: "DELETE" });
      setDirty(false);
      toast.success("Projet supprimé");
      router.push("/admin/projects");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const L = lang === "fr" ? "Fr" : "En";
  const key = <T extends string>(base: T) => `${base}${L}` as `${T}Fr` | `${T}En`;
  const text = (base: "tagline" | "summary" | "problem" | "contribution") => d[key(base)] as string;
  const setText = (base: "tagline" | "summary" | "problem" | "contribution", v: string) =>
    set(key(base), v as never);
  const seoTitle = (d[key("seoTitle")] as string | null) ?? "";
  const seoDesc = (d[key("seoDescription")] as string | null) ?? "";

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Projets
        </Link>
      </div>
      <PageTitle
        title={isNew ? "Nouveau projet" : d.title || "Projet"}
        description={isNew ? undefined : `Slug : ${d.slug}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!isNew && d.published && (
              <a
                href={`/fr/projets/${d.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btn.outline}
              >
                <ExternalLink className="size-4" /> Voir
              </a>
            )}
            {!isNew && (
              <button type="button" className={btn.outline} onClick={duplicate}>
                <Copy className="size-4" /> Dupliquer
              </button>
            )}
            {!isNew && (
              <button type="button" className={btn.danger} onClick={remove}>
                <Trash2 className="size-4" /> Supprimer
              </button>
            )}
            <button type="button" className={btn.primary} disabled={busy} onClick={save}>
              {busy ? <Spinner /> : <Save className="size-4" />} Enregistrer
            </button>
          </div>
        }
      />

      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.slice(0, 6).map((m) => (
            <ErrorNote key={m} message={m} />
          ))}
        </div>
      )}

      <div className="mb-6 inline-flex rounded-lg border border-border p-0.5" role="tablist" aria-label="Langue d'édition">
        {(["fr", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={lang === l}
            onClick={() => setLang(l)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium",
              lang === l ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {l === "fr" ? "Français" : "English"}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <Section id="general">
          <Card title="Informations générales">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Titre" className="md:col-span-2">
                {(id) => (
                  <Input
                    id={id}
                    value={d.title}
                    maxLength={120}
                    onChange={(e) => {
                      set("title", e.target.value);
                      if (!slugTouched) setD((p) => ({ ...p, slug: slugify(e.target.value) }));
                    }}
                  />
                )}
              </Field>
              <Field label="Slug (URL)" hint="Minuscules, chiffres et tirets. Change l'URL publique : à modifier avec prudence.">
                {(id) => (
                  <Input
                    id={id}
                    value={d.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                  />
                )}
              </Field>
              <Field label="Ordre d'affichage" hint="Plus petit = plus haut.">
                {(id) => (
                  <Input id={id} type="number" min={0} max={10000} value={d.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
                )}
              </Field>
              <Field label="Catégorie">
                {(id) => (
                  <Select id={id} value={d.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Statut">
                {(id) => (
                  <Select id={id} value={d.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUSES.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Domaine">
                {(id) => (
                  <Select id={id} value={d.domain} onChange={(e) => set("domain", e.target.value)}>
                    <option value="fullstack">Full-Stack</option>
                    <option value="devops">DevOps</option>
                  </Select>
                )}
              </Field>
              <Field label="Visuel (maquette)">
                {(id) => (
                  <Select id={id} value={d.visual} onChange={(e) => set("visual", e.target.value)}>
                    {VISUALS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Stack (séparée par des virgules)" className="md:col-span-2">
                {(id) => (
                  <Input id={id} value={stackText} placeholder="Next.js, NestJS, PostgreSQL" onChange={(e) => { setStackText(e.target.value); setDirty(true); }} />
                )}
              </Field>
              <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <Switch label="Publié" hint="Visible sur le site public." checked={d.published} onChange={(v) => set("published", v)} />
                <Switch label="Mis en avant" hint="Affiché sur la page d'accueil." checked={d.featured} onChange={(v) => set("featured", v)} />
                <Switch label="Stack envisagée" hint="Indique « planned » au lieu de « implemented »." checked={d.stackPlanned} onChange={(v) => set("stackPlanned", v)} />
                <Switch label="Confidentiel" hint="Affiche la mention de confidentialité." checked={d.confidential} onChange={(v) => set("confidential", v)} />
              </div>
            </div>
          </Card>

          <Card title={`Textes (${lang === "fr" ? "français" : "English"})`}>
            <div className="space-y-5">
              <Field label="Accroche" hint="Type de produit affiché au-dessus du nom.">
                {(id) => <Input id={id} value={text("tagline")} maxLength={160} onChange={(e) => setText("tagline", e.target.value)} />}
              </Field>
              <Field label="Résumé">
                {(id) => <Textarea id={id} rows={3} value={text("summary")} maxLength={1000} onChange={(e) => setText("summary", e.target.value)} />}
              </Field>
              <Field label="Problème">
                {(id) => <Textarea id={id} rows={3} value={text("problem")} maxLength={2000} onChange={(e) => setText("problem", e.target.value)} />}
              </Field>
              <Field label="Ma contribution">
                {(id) => <Textarea id={id} rows={3} value={text("contribution")} maxLength={2000} onChange={(e) => setText("contribution", e.target.value)} />}
              </Field>
            </div>
          </Card>
        </Section>

        <Card
          title={`Étude de cas détaillée (${lang === "fr" ? "français" : "English"})`}
          description="Éditeur riche : titres, listes, images, liens, code. Le contenu est nettoyé côté serveur avant publication."
        >
          <RichEditor
            label={`Contenu ${lang === "fr" ? "français" : "anglais"}`}
            value={lang === "fr" ? d.contentFr : d.contentEn}
            onChange={(html) => set(lang === "fr" ? "contentFr" : "contentEn", html)}
          />
        </Card>

        <Card title="Visuel & liens">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="mb-1.5 text-sm font-medium">Image de couverture (visuel du projet et partage social)</p>
              <div className="flex items-center gap-4">
                {d.cover ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.cover.url} alt={d.cover.alt} className="h-20 w-36 rounded-lg border border-border object-cover" />
                    <button type="button" className={btn.ghost} onClick={() => { set("coverId", null); set("cover", null); }}>
                      <X className="size-4" /> Retirer
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-subtle">Aucune image : un aperçu conceptuel est affiché à la place. Recommandé : 1200×630.</p>
                )}
                <button type="button" className={btn.outline} onClick={() => setPicker(true)}>
                  <ImageIcon className="size-4" /> Choisir
                </button>
              </div>
            </div>
            <Field label="Lien de démonstration">
              {(id) => <Input id={id} type="url" placeholder="https://…" value={d.liveUrl ?? ""} onChange={(e) => set("liveUrl", e.target.value || null)} />}
            </Field>
            <Field label="Site du projet">
              {(id) => <Input id={id} type="url" placeholder="https://…" value={d.siteUrl ?? ""} onChange={(e) => set("siteUrl", e.target.value || null)} />}
            </Field>
            <Field label="Dépôt de code">
              {(id) => <Input id={id} type="url" placeholder="https://github.com/…" value={d.repoUrl ?? ""} onChange={(e) => set("repoUrl", e.target.value || null)} />}
            </Field>
            <Field label="Projets liés (slugs, séparés par des virgules)">
              {(id) => <Input id={id} value={relatedText} onChange={(e) => { setRelatedText(e.target.value); setDirty(true); }} />}
            </Field>
          </div>
        </Card>

        <Card title={`Référencement — ${lang === "fr" ? "français" : "English"}`} description="Laissez vide pour utiliser le titre et le résumé du projet.">
          <div className="space-y-5">
            <SnippetPreview title={seoTitle || d.title} description={seoDesc || text("summary")} url={pageUrl} />
            <Field label="Titre SEO">
              {(id) => (
                <div className="space-y-1">
                  <Input id={id} value={seoTitle} maxLength={70} onChange={(e) => set(key("seoTitle"), (e.target.value || null) as never)} />
                  <div className="text-right"><Counter value={seoTitle} min={30} max={60} /></div>
                </div>
              )}
            </Field>
            <Field label="Méta-description">
              {(id) => (
                <div className="space-y-1">
                  <Textarea id={id} rows={2} value={seoDesc} maxLength={170} onChange={(e) => set(key("seoDescription"), (e.target.value || null) as never)} />
                  <div className="text-right"><Counter value={seoDesc} min={110} max={160} /></div>
                </div>
              )}
            </Field>
          </div>
        </Card>

        <Card
          title="Étude de cas structurée (avancé)"
          description="Objet JSON optionnel : context, goals, users, solution, features, responsibilities, architecture, decisions, challenges, nextSteps. Les textes sont de la forme { fr, en }."
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={btn.outline}
              disabled={d.detailsText.trim() !== ""}
              onClick={() => set("detailsText", DETAILS_TEMPLATE)}
            >
              Insérer un modèle
            </button>
            <p className="text-xs text-subtle">
              Disponible quand le champ est vide. Les sections omises sont masquées sur le site.
            </p>
          </div>
          <Textarea
            aria-label="Étude de cas structurée (JSON)"
            rows={14}
            spellCheck={false}
            className="font-mono text-xs"
            value={d.detailsText}
            onChange={(e) => set("detailsText", e.target.value)}
          />
        </Card>
      </div>

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(m) => {
          set("coverId", m.id);
          set("cover", { id: m.id, url: m.url, alt: m.alt });
        }}
      />
    </>
  );
}
