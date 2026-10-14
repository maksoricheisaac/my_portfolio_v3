"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, LogOut, Moon, ShieldCheck, Sun } from "lucide-react";
import { api, redirectToLogin, type AdminUser } from "@/lib/admin/client";
import { Loading } from "@/components/admin/ui";
import { AppSidebar, navItems } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const UserContext = createContext<AdminUser | null>(null);
export const useAdminUser = () => useContext(UserContext) as AdminUser;

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the preference simply isn't remembered
  }
}

function ThemeToggle() {
  // Only rendered once the user is loaded (client-side), so reading the DOM here is hydration-safe.
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
      ? "light"
      : "dark",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    writeStored("admin-theme", next);
    setTheme(next);
  }

  const label = theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function UserNav({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials =
    user.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted"
      >
        <span className="font-mono flex size-8 items-center justify-center rounded-full border border-signal/40 bg-signal/10 text-xs text-signal">
          {initials}
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm sm:block">{user.name}</span>
        <ChevronDown className="hidden size-4 text-subtle sm:block" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate font-mono text-[0.7rem] text-subtle">{user.email}</p>
          </div>
          <Link
            href="/admin/settings?tab=security"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ShieldCheck className="size-4" aria-hidden="true" /> Sécurité du compte
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<AdminUser>("/auth/me")
      .then((u) => !cancelled && setUser(u))
      .catch(() => redirectToLogin());
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    api<{ counts: Record<string, number> }>("/admin/messages?pageSize=1")
      .then((r) => setUnread(r.counts.NEW ?? 0))
      .catch(() => undefined);
  }, [user, pathname]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/admin/login");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  const current = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <UserContext.Provider value={user}>
      <TooltipProvider>
        {/* Only mounts after `user` loaded (client-side), so reading the cookie here is hydration-safe. */}
        <SidebarProvider defaultOpen={readCookie("sidebar_state") !== "false"}>
          <AppSidebar pathname={pathname} unread={unread} />
          <SidebarInset className="min-w-0">
            <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur sm:px-5">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-auto" />
              <p className="truncate text-sm font-medium">{current?.label ?? "Administration"}</p>

              <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
                <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
                <UserNav user={user} onLogout={logout} />
              </div>
            </header>
            <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </UserContext.Provider>
  );
}
