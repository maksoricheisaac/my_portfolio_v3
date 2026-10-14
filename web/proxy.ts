import { NextResponse, type NextRequest } from "next/server";
import { clientIpFrom } from "@/lib/client-ip";
import { defaultLocale, hasLocale, locales, type Locale } from "@/lib/i18n";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (hasLocale(tag)) return tag;
  }
  return defaultLocale;
}

/** Admin pages that must stay reachable without a session. */
const ADMIN_PUBLIC = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/setup",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API proxy: never forward identity headers written by the browser. The real client IP is
  // derived here from trusted hops only and sent with the shared key, so the API's per-IP rate
  // limits and audit log cannot be spoofed with a forged X-Forwarded-For.
  if (/^\/backend(\/|$)/.test(pathname)) {
    const headers = new Headers(request.headers);
    headers.delete("x-internal-key");
    headers.delete("x-client-ip");
    const key = process.env.INTERNAL_API_KEY;
    if (key) {
      headers.set("x-internal-key", key);
      headers.set("x-client-ip", clientIpFrom(request.headers.get("x-forwarded-for")));
    }
    return NextResponse.next({ request: { headers } });
  }

  // Next internals and any file with an extension (icons, sitemap, robots…).
  if (/^\/(_next|api)(\/|$)/.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Fast optimistic gate only: the API is the real authority and re-checks every request.
    const signedIn = request.cookies.has("pf_rt");
    const isPublic = ADMIN_PUBLIC.includes(pathname);
    if (!signedIn && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return;
  }

  const hasPrefix = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasPrefix) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
