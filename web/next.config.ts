import type { NextConfig } from "next";

// Private NestJS API: the browser only ever talks to this origin (/backend/*), so the admin
// session cookies stay first-party and SameSite=Strict.
const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const isProduction = (process.env.NEXT_PUBLIC_SITE_ENV ?? "production") === "production";
// Development tooling (React refresh, HMR websocket) needs a looser script policy.
const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy. Scripts keep 'unsafe-inline' because Next.js injects inline bootstrap
 * scripts and a per-request nonce would make every page dynamic (see docs/security). Everything
 * else is locked down: no foreign scripts, no plugins, no framing, same-origin forms/connections.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Only the API areas the website really uses are reachable through /backend. */
const BACKEND_PREFIXES = ["auth", "admin", "public", "media", "setup"];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Self-contained server output for the Docker image (see Dockerfile).
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // French URLs are localised (/fr/projets) but served by the shared English-named route folders.
  async rewrites() {
    return [
      ...BACKEND_PREFIXES.map((prefix) => ({
        source: `/backend/${prefix}/:path*`,
        destination: `${API_URL}/${prefix}/:path*`,
      })),
      { source: "/fr/projets", destination: "/fr/projects" },
      { source: "/fr/projets/:slug", destination: "/fr/projects/:slug" },
      { source: "/fr/a-propos", destination: "/fr/about" },
      { source: "/fr/competences", destination: "/fr/skills" },
    ];
  },
  // Keep a single canonical URL per French page.
  async redirects() {
    return [
      { source: "/fr/projects", destination: "/fr/projets", permanent: true },
      { source: "/fr/projects/:slug", destination: "/fr/projets/:slug", permanent: true },
      { source: "/fr/about", destination: "/fr/a-propos", permanent: true },
      { source: "/fr/skills", destination: "/fr/competences", permanent: true },
    ];
  },
  async headers() {
    return [
      // The admin area and the API proxy must never be indexed or cached.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/backend/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/:path*",
        headers: [
          ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
