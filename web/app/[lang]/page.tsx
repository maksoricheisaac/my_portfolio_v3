import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Approach } from "@/components/sections/approach";
import { ContactCta } from "@/components/sections/contact-cta";
import { Expertise } from "@/components/sections/expertise";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { Stack } from "@/components/sections/stack";
import { getDictionary } from "@/content/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    ...pageMetadata({
      lang,
      route: "home",
      title: dict.meta.siteTitle,
      description: dict.meta.description,
    }),
    title: { absolute: dict.meta.siteTitle },
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: `${site.url}/${lang}`,
    jobTitle: lang === "fr" ? "Développeur Full-Stack & Junior DevOps" : "Full-Stack Developer & Junior DevOps",
    address: { "@type": "PostalAddress", addressLocality: "Brazzaville", addressCountry: "CG" },
    sameAs: [site.linkedin, site.github].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero lang={lang} dict={dict} />
      <Expertise lang={lang} dict={dict} />
      <FeaturedProjects lang={lang} dict={dict} />
      <Approach dict={dict} />
      <Stack lang={lang} dict={dict} />
      <ContactCta lang={lang} dict={dict} />
    </>
  );
}
