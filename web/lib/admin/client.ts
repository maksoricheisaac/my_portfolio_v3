"use client";

/**
 * Browser client for the admin API. Requests go through the Next.js `/backend` proxy so the
 * HttpOnly session cookies are first-party. A 401 triggers one silent refresh-and-retry.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  // Concurrent 401s share one refresh: rotating the token twice would look like token reuse.
  refreshing ??= fetch("/backend/auth/refresh", { method: "POST", credentials: "same-origin" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => (refreshing = null), 0);
    });
  return refreshing;
}

export function redirectToLogin() {
  const next = window.location.pathname + window.location.search;
  window.location.assign(`/admin/login?next=${encodeURIComponent(next)}`);
}

async function parseError(res: Response): Promise<ApiError> {
  let message = `Erreur ${res.status}`;
  let details: string[] = [];
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      details = body.message;
      message = body.message[0] ?? message;
    } else if (body.message) {
      message = body.message;
    }
  } catch {
    /* non-JSON error */
  }
  return new ApiError(res.status, message, details);
}

export async function api<T = unknown>(
  path: string,
  init: Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit } = {},
  retry = true,
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`/backend${path}`, {
    credentials: "same-origin",
    ...rest,
    headers: {
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/login") && path !== "/auth/refresh") {
    if (await refreshSession()) return api<T>(path, init, false);
    redirectToLogin();
    throw new ApiError(401, "Session expirée");
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ───────────── shared types ─────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
}

export interface Localized {
  fr: string;
  en: string;
}

export interface AdminProject {
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  category: string;
  status: string;
  visual: string;
  domain: string;
  confidential: boolean;
  stackPlanned: boolean;
  stack: string[];
  title: string;
  taglineFr: string;
  taglineEn: string;
  summaryFr: string;
  summaryEn: string;
  problemFr: string;
  problemEn: string;
  contributionFr: string;
  contributionEn: string;
  contentFr: string;
  contentEn: string;
  liveUrl: string | null;
  repoUrl: string | null;
  siteUrl: string | null;
  coverId: string | null;
  cover: { id: string; url: string; alt: string } | null;
  details: Record<string, unknown> | null;
  related: string[];
  seoTitleFr: string | null;
  seoTitleEn: string | null;
  seoDescriptionFr: string | null;
  seoDescriptionEn: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageStatus = "NEW" | "READ" | "ARCHIVED" | "SPAM";

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  lang: string;
  status: MessageStatus;
  note: string | null;
  mailSent: boolean;
  ip: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface MediaItem {
  id: string;
  url: string;
  original: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
}

export interface AuditItem {
  id: string;
  action: string;
  target: string | null;
  ip: string | null;
  createdAt: string;
}
