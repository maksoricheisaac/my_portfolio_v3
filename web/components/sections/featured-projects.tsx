import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/site/section";
import { ProjectCard } from "@/components/sections/project-card";
import type { Dictionary } from "@/content/dictionaries";
import { featuredProjects } from "@/content/projects";
import { href, type Locale } from "@/lib/i18n";

export function FeaturedProjects({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="border-y border-border bg-surface/40 py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={dict.featured.eyebrow}
            title={dict.featured.title}
            intro={dict.featured.intro}
          />
          <Link
            href={href(lang, "projects")}
            className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            {dict.common.allProjects}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.slice(0, 3).map((p) => (
            <StaggerItem key={p.slug} className="h-full">
              <ProjectCard project={p} lang={lang} dict={dict} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
