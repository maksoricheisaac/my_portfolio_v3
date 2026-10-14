import type { Metadata, Viewport } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MotionProvider } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { getDictionary } from "@/content/dictionaries";
import { getSettings } from "@/lib/api";
import { hasLocale, locales } from "@/lib/i18n";
import { isProduction, site } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  // The metadata depends on admin-editable settings (external data) and on the language only:
  // cache it, and refresh it through the "settings" tag after an admin change.
  "use cache";
  cacheTag("settings");
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const seo = (await getSettings())?.seo;
  const title = seo?.siteTitle[lang] || dict.meta.siteTitle;
  const description = seo?.description[lang] || dict.meta.description;
  const keywords = seo?.keywords[lang]
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return {
    // Cached metadata must be serializable: a URL instance is not, a string is accepted.
    metadataBase: site.url as unknown as URL,
    title: { default: title, template: `%s — ${site.name}` },
    description,
    keywords: keywords?.length ? keywords : undefined,
    authors: [{ name: site.name }],
    creator: site.name,
    robots:
      !isProduction || (seo && !seo.indexable)
        ? { index: false, follow: false }
        : undefined,
    verification: seo?.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    twitter: seo?.twitterHandle ? { creator: seo.twitterHandle } : undefined,
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {dict.common.skip}
        </a>
        <MotionProvider>
        <ScrollProgress />
        <Header
          lang={lang}
          labels={{
            ...dict.nav,
            menu: dict.common.menu,
            closeMenu: dict.common.closeMenu,
            language: dict.common.language,
            switchTo: dict.common.switchTo,
          }}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} />
        </MotionProvider>
      </body>
    </html>
  );
}
