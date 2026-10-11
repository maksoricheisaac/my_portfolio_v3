import type { NextConfig } from "next";

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
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
