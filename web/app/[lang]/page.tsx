import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFallback } from "@/components/site/page-fallback";
import { notFound } from "next/navigation";
import { Marquee } from "@/components/motion/marquee";
import { AboutTeaser } from "@/components/sections/about-teaser";
import { ContactCta } from "@/components/sections/contact-cta";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { ArchitectureExplorer } from "@/components/experience/architecture-explorer";
import { Journey } from "@/components/experience/journey";
import { KineticType } from "@/components/experience/kinetic-type";
import { PipelineSimulation } from "@/components/experience/pipeline-simulation";
import { SkillsExplorer } from "@/components/experience/skills-explorer";
import { getDictionary } from "@/content/dictionaries";
import { skillGroups } from "@/content/skills";
import { getProjects, getSettings } from "@/lib/api";
import { JsonLd } from "@/components/site/json-ld";
import { hasLocale, href } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const seo = (await getSettings())?.seo;
  const title = seo?.siteTitle[lang] || dict.meta.siteTitle;
  const description = seo?.description[lang] || dict.meta.description;
  return {
    ...pageMetadata({ lang, route: "home", title, description }),
    title: { absolute: title },
  };
}

async function HomePageContent({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const profile = (await getSettings())?.profile;
  const projectList = await getProjects();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: profile?.name || site.name,
    url: `${site.url}/${lang}`,
    jobTitle:
      profile?.jobTitle[lang] ||
      (lang === "fr" ? "Développeur Full-Stack & Junior DevOps" : "Full-Stack Developer & Junior DevOps"),
    address: { "@type": "PostalAddress", addressLocality: "Brazzaville", addressCountry: "CG" },
    image: `${site.url}/me/portrait-crossed.webp`,
    sameAs: [profile?.linkedin || site.linkedin, profile?.github || site.github].filter(Boolean),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: lang,
    publisher: { "@id": `${site.url}/#person` },
  };

  return (
    <>
      <JsonLd data={[person, website]} />
      <Hero lang={lang} dict={dict} />
      <div className="border-y border-border bg-surface/30 py-5">
        <Marquee
          label={dict.stack.title}
          items={skillGroups.flatMap((g) =>
            g.skills.filter((sk) => sk.level === "practice").map((sk) => sk.name),
          )}
        />
      </div>
      <KineticType lang={lang} />
      <AboutTeaser lang={lang} dict={dict} />
      <FeaturedProjects lang={lang} dict={dict} />
      <ArchitectureExplorer lang={lang} />
      <PipelineSimulation lang={lang} />
      <SkillsExplorer
        lang={lang}
        projects={projectList.map((p) => ({
          slug: p.slug,
          title: p.title,
          stack: p.stack,
          href: href(lang, "projects", p.slug),
        }))}
      />
      <Journey
        lang={lang}
        projectsBase={href(lang, "projects")}
        projectSlugs={projectList.map((p) => p.slug)}
      />
      <ContactCta lang={lang} dict={dict} />
    </>
  );
}

export default function HomePage(props: PageProps<"/[lang]">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <HomePageContent {...props} />
    </Suspense>
  );
}
