"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Save, ShieldCheck, User } from "lucide-react";
import { SecurityPanel } from "@/components/admin/security-panel";
import { api, ApiError } from "@/lib/admin/client";
import {
  btn,
  Card,
  ErrorNote,
  Field,
  Input,
  Loading,
  PageTitle,
  Spinner,
  Switch,
  Tabs,
  Textarea,
  useToast,
  type TabItem,
} from "@/components/admin/ui";

interface Loc {
  fr: string;
  en: string;
}
interface Settings {
  seo: {
    siteTitle: Loc;
    description: Loc;
    keywords: Loc;
    twitterHandle: string;
    indexable: boolean;
    googleSiteVerification: string;
  };
  profile: {
    name: string;
    jobTitle: Loc;
    location: string;
    email: string;
    linkedin: string;
    github: string;
    whatsapp: string;
    availability: Loc;
  };
}

const DEFAULTS: Settings = {
  seo: {
    siteTitle: {
      fr: "Riche Makso — Développeur Full-Stack & Junior DevOps",
      en: "Riche Makso — Full-Stack Developer & Junior DevOps",
    },
    description: { fr: "", en: "" },
    keywords: { fr: "", en: "" },
    twitterHandle: "",
    indexable: true,
    googleSiteVerification: "",
  },
  profile: {
    name: "Riche Makso",
    jobTitle: {
      fr: "Développeur Full-Stack & Junior DevOps",
      en: "Full-Stack Developer & Junior DevOps",
    },
    location: "Brazzaville, Congo",
    email: "",
    linkedin: "",
    github: "",
    whatsapp: "",
    availability: { fr: "", en: "" },
  },
};

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`font-mono text-[0.7rem] ${value.length > max ? "text-destructive" : "text-subtle"}`}>
      {value.length}/{max}
    </span>
  );
}

const TABS: TabItem[] = [
  { id: "seo", label: "Référencement", icon: Globe },
  { id: "profile", label: "Profil", icon: User },
  { id: "security", label: "Sécurité", icon: ShieldCheck },
];

const TAB_TITLES: Record<string, { title: string; description: string }> = {
  seo: { title: "Paramètres", description: "Métadonnées globales du site pour les moteurs de recherche." },
  profile: { title: "Paramètres", description: "Profil et données structurées (schema.org)." },
  security: { title: "Paramètres", description: "Protégez l'accès à votre espace d'administration." },
};

export default function SettingsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.id === requested) ? (requested as string) : "seo";
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    api<{ settings: Settings | null }>("/admin/settings")
      .then((r) => setS(r.settings ?? DEFAULTS))
      .catch((e: Error) => setErrors([e.message]));
  }, []);

  function selectTab(id: string) {
    router.replace(`/admin/settings?tab=${id}`, { scroll: false });
  }

  const seo = <K extends keyof Settings["seo"]>(k: K, v: Settings["seo"][K]) =>
    setS((cur) => cur && { ...cur, seo: { ...cur.seo, [k]: v } });
  const profile = <K extends keyof Settings["profile"]>(k: K, v: Settings["profile"][K]) =>
    setS((cur) => cur && { ...cur, profile: { ...cur.profile, [k]: v } });
  const loc = (obj: Loc, lang: keyof Loc, v: string): Loc => ({ ...obj, [lang]: v });

  async function save() {
    if (!s) return;
    setBusy(true);
    setErrors([]);
    try {
      await api("/admin/settings", { method: "PUT", json: s });
      toast.success("Paramètres enregistrés — le site est mis à jour");
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.message.split("; "));
      toast.error("Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  const head = TAB_TITLES[tab];
  let content: React.ReactNode;
  if (tab === "security") {
    content = <SecurityPanel />;
  } else if (!s) {
    content = errors.length ? <ErrorNote message={errors[0]} /> : <Loading />;
  } else {
    content = (
      <>
        {errors.map((m) => (
          <div key={m} className="mb-2"><ErrorNote message={m} /></div>
        ))}
        <div className="space-y-6">
          {tab === "seo" && (
        <Card title="Référencement du site" description="Utilisé pour la page d'accueil et par défaut sur les autres pages.">
          <div className="grid gap-5 md:grid-cols-2">
            {(["fr", "en"] as const).map((l) => (
              <div key={l} className="space-y-5">
                <Field label={`Titre du site (${l.toUpperCase()})`} hint="50–60 caractères recommandés.">
                  {(id) => (
                    <div className="space-y-1">
                      <Input id={id} maxLength={70} value={s.seo.siteTitle[l]} onChange={(e) => seo("siteTitle", loc(s.seo.siteTitle, l, e.target.value))} />
                      <div className="text-right"><Counter value={s.seo.siteTitle[l]} max={60} /></div>
                    </div>
                  )}
                </Field>
                <Field label={`Méta-description (${l.toUpperCase()})`} hint="120–160 caractères recommandés.">
                  {(id) => (
                    <div className="space-y-1">
                      <Textarea id={id} rows={3} maxLength={170} value={s.seo.description[l]} onChange={(e) => seo("description", loc(s.seo.description, l, e.target.value))} />
                      <div className="text-right"><Counter value={s.seo.description[l]} max={160} /></div>
                    </div>
                  )}
                </Field>
                <Field label={`Mots-clés (${l.toUpperCase()})`}>
                  {(id) => <Input id={id} maxLength={300} value={s.seo.keywords[l]} onChange={(e) => seo("keywords", loc(s.seo.keywords, l, e.target.value))} />}
                </Field>
              </div>
            ))}
            <Field label="Compte X / Twitter" hint="Ex. @richemakso">
              {(id) => <Input id={id} maxLength={40} value={s.seo.twitterHandle} onChange={(e) => seo("twitterHandle", e.target.value)} />}
            </Field>
            <Field label="Google Search Console (code de vérification)">
              {(id) => <Input id={id} maxLength={100} value={s.seo.googleSiteVerification} onChange={(e) => seo("googleSiteVerification", e.target.value)} />}
            </Field>
            <div className="md:col-span-2">
              <Switch
                label="Autoriser l'indexation par les moteurs de recherche"
                hint="Désactivé : robots.txt interdit toute exploration (utile pendant une refonte)."
                checked={s.seo.indexable}
                onChange={(v) => seo("indexable", v)}
              />
            </div>
          </div>
        </Card>

          )}
          {tab === "profile" && (
        <Card title="Profil (données structurées)" description="Alimente le JSON-LD « Person » de la page d'accueil, utile pour les résultats enrichis.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nom">
              {(id) => <Input id={id} maxLength={100} value={s.profile.name} onChange={(e) => profile("name", e.target.value)} />}
            </Field>
            <Field label="Localisation">
              {(id) => <Input id={id} maxLength={100} value={s.profile.location} onChange={(e) => profile("location", e.target.value)} />}
            </Field>
            <Field label="Titre professionnel (FR)">
              {(id) => <Input id={id} maxLength={100} value={s.profile.jobTitle.fr} onChange={(e) => profile("jobTitle", loc(s.profile.jobTitle, "fr", e.target.value))} />}
            </Field>
            <Field label="Titre professionnel (EN)">
              {(id) => <Input id={id} maxLength={100} value={s.profile.jobTitle.en} onChange={(e) => profile("jobTitle", loc(s.profile.jobTitle, "en", e.target.value))} />}
            </Field>
            <Field label="LinkedIn">
              {(id) => <Input id={id} type="url" value={s.profile.linkedin} onChange={(e) => profile("linkedin", e.target.value)} />}
            </Field>
            <Field label="GitHub">
              {(id) => <Input id={id} type="url" value={s.profile.github} onChange={(e) => profile("github", e.target.value)} />}
            </Field>
          </div>
        </Card>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={head.title}
        description={head.description}
        actions={
          tab !== "security" && s ? (
            <button type="button" className={btn.primary} disabled={busy} onClick={save}>
              {busy ? <Spinner /> : <Save className="size-4" />} Enregistrer
            </button>
          ) : undefined
        }
      />
      <Tabs tabs={TABS} value={tab} onChange={selectTab} label="Paramètres" idPrefix="settings" />
      <div id="settings-panel" role="tabpanel" aria-labelledby={`settings-${tab}`}>
        {content}
      </div>
    </>
  );
}
