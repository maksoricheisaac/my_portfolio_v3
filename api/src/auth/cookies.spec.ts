import { sessionCookieOptions } from './cookies';

describe('session cookies', () => {
  it('are HttpOnly, SameSite=Strict and scoped to /', () => {
    const o = sessionCookieOptions({ secure: true, maxAgeMs: 60_000 });
    expect(o.httpOnly).toBe(true);
    expect(o.secure).toBe(true);
    expect(o.sameSite).toBe('strict');
    expect(o.path).toBe('/');
  });

  it('stay HttpOnly whatever the environment', () => {
    const o = sessionCookieOptions({
      secure: false,
      domain: '.example.com',
      maxAgeMs: 1,
    });
    expect(o.httpOnly).toBe(true);
    expect(o.domain).toBe('.example.com');
  });
});
