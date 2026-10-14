import { Container } from "@/components/site/section";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a page's data resolves; keeps the shell (header, footer) instantly renderable. */
export function PageFallback() {
  return (
    <Container className="py-24">
      <div aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-16 w-full max-w-3xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      </div>
    </Container>
  );
}
