import type { Localized } from "@/lib/i18n";

/**
 * Central, editable identity data. Everything here is shown publicly:
 * set a value to `null` to hide the corresponding link.
 */
export const site = {
  name: "Riche Makso",
  legalName: "Riche Isaac Makso",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://richemakso.vercel.app",
  location: "Brazzaville, Congo",
  /** TODO(owner): add a public contact email if you want one displayed. */
  email: null as string | null,
  linkedin: "https://www.linkedin.com/in/riche-isaac-makso",
  github: "https://github.com/maksoricheisaac",
  whatsapp: "https://wa.me/242056073456",
  /** Shown as a quiet status line. Set to `null` to hide it entirely. */
  availability: {
    fr: "Ouvert aux collaborations et missions techniques",
    en: "Open to collaborations and technical missions",
  } satisfies Localized as Localized | null,
};
