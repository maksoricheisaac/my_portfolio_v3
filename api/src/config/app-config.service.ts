import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env';

/** Typed access to the validated environment. */
@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isProd(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get webOrigins(): string[] {
    return this.get('WEB_ORIGINS')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean);
  }

  get siteUrl(): string {
    return (
      this.get('SITE_URL') ??
      this.webOrigins[0] ??
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  get secureCookies(): boolean {
    return this.isProd || this.get('COOKIE_SECURE');
  }
}
