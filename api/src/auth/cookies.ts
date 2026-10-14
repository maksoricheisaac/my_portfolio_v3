import type { CookieOptions } from 'express';

/**
 * Options of the session cookies. Tokens only ever live in these HttpOnly cookies: they are not
 * readable from JavaScript, never stored in localStorage and never returned in a response body.
 */
export function sessionCookieOptions(input: {
  secure: boolean;
  domain?: string;
  maxAgeMs: number;
}): CookieOptions {
  return {
    httpOnly: true,
    secure: input.secure,
    sameSite: 'strict',
    path: '/',
    domain: input.domain || undefined,
    maxAge: input.maxAgeMs,
  };
}
