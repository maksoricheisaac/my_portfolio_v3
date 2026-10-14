import { z } from 'zod';

const bool = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1),

  /** Comma-separated list of browser origins allowed to call the API (the Next.js site). */
  WEB_ORIGINS: z.string().default('http://localhost:3000'),
  /** Public URL of the website, used in emails. Defaults to the first web origin. */
  SITE_URL: z.string().url().optional(),
  /** Number of reverse proxies in front of the API (Express "trust proxy"). */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  /** Shared with the Next.js server: lets it forward the real visitor IP (X-Client-IP). */
  INTERNAL_API_KEY: z.string().min(24).optional(),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  OTP_SECRET: z.string().min(32, 'OTP_SECRET must be at least 32 characters'),
  ACCESS_TTL_MINUTES: z.coerce.number().int().min(1).default(15),
  REFRESH_TTL_DAYS: z.coerce.number().int().min(1).default(7),
  COOKIE_DOMAIN: z.string().optional(),
  /** Force the Secure flag on cookies (always on in production). */
  COOKIE_SECURE: bool,

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  CONTACT_TO: z.string().email().optional(),

  /** Next.js on-demand revalidation webhook (called after content changes). */
  WEB_REVALIDATE_URL: z.string().url().optional(),
  REVALIDATE_SECRET: z.string().min(24).optional(),

  /** Optional fixed setup token. Otherwise a random one is printed in the logs on first run. */
  SETUP_TOKEN: z.string().min(16).optional(),

  UPLOAD_DIR: z.string().default('./uploads'),
  /** URL prefix under which the website reaches the API media route. */
  MEDIA_PUBLIC_PATH: z.string().default('/backend/media'),
});

export type Env = z.infer<typeof schema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  // Docker Compose passes unset variables as empty strings: treat them as absent.
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== ''),
  );
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
