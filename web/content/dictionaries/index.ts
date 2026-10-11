import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("./fr").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
};

export const getDictionary = (lang: Locale) => dictionaries[lang]();
export type { Dictionary };
