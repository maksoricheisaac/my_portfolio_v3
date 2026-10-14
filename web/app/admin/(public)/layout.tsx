import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-signal/40 bg-signal/10 text-signal">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold leading-none">Administration</p>
            <p className="font-mono mt-1 text-xs text-subtle">Espace privé</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
