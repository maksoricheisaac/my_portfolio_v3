/**
 * Real visitor IP, derived from `X-Forwarded-For` without trusting what the client wrote.
 *
 * Each reverse proxy in front of Next.js appends the address it saw to the *right* of the header,
 * so the leftmost entries are attacker-controlled. `TRUSTED_PROXY_HOPS` is the number of such
 * proxies (Traefik on Dokploy = 1): the client is the entry that many positions from the right.
 * With 0 hops (local development, no proxy) nothing can be trusted: all traffic shares one bucket.
 */
const IP_RE = /^[0-9a-fA-F:.]{3,45}$/;

function hops(): number {
  const raw = process.env.TRUSTED_PROXY_HOPS;
  const fallback = process.env.NODE_ENV === "production" ? 1 : 0;
  const n = raw === undefined || raw === "" ? fallback : Number.parseInt(raw, 10);
  return Number.isInteger(n) && n >= 0 && n <= 5 ? n : fallback;
}

export function clientIpFrom(forwardedFor: string | null): string {
  const h = hops();
  if (h === 0) return "local";
  const entries = (forwardedFor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ip = entries[entries.length - h];
  return ip && IP_RE.test(ip) ? ip : "unknown";
}
