import Link from "next/link";
import { Container } from "@/components/site/section";
import { defaultLocale } from "@/lib/i18n";

// The locale is not available here, so the message is shown in both languages.
export default function NotFound() {
  return (
    <Container className="py-32">
      <p className="eyebrow">404</p>
      <h1 className="font-display mt-4 text-5xl font-semibold sm:text-7xl">
        Page introuvable
        <span className="block text-muted-foreground">Page not found</span>
      </h1>
      <p className="mt-6 max-w-lg text-muted-foreground">
        Cette page n&apos;existe pas ou a été déplacée. / This page does not exist or has
        been moved.
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href={`/${defaultLocale}`}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Accueil
        </Link>
        <Link href="/en" className="rounded-full border border-input px-6 py-3 text-sm font-medium">
          Home
        </Link>
      </div>
    </Container>
  );
}
