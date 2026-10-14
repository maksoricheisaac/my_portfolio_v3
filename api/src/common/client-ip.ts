import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * The visitor IP. When the request comes from our own Next.js server (proved by the shared
 * INTERNAL_API_KEY) the forwarded X-Client-IP is trusted; otherwise Express' req.ip is used.
 */
export function clientIp(req: Request): string {
  const key = process.env.INTERNAL_API_KEY;
  const provided = req.headers['x-internal-key'];
  const forwarded = req.headers['x-client-ip'];
  if (
    key &&
    typeof provided === 'string' &&
    typeof forwarded === 'string' &&
    safeEqual(provided, key)
  ) {
    return forwarded.slice(0, 64);
  }
  return req.ip ?? 'unknown';
}
