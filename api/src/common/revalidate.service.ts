import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service';

/** Tells the Next.js site to refresh cached content after an admin change. Best effort. */
@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);

  constructor(private readonly config: AppConfig) {}

  async tags(...tags: string[]): Promise<void> {
    const url = this.config.get('WEB_REVALIDATE_URL');
    const secret = this.config.get('REVALIDATE_SECRET');
    if (!url || !secret) return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) this.logger.warn(`revalidate responded ${res.status}`);
    } catch (error) {
      this.logger.warn(`revalidate failed: ${(error as Error).name}`);
    }
  }
}

@Global()
@Module({ providers: [RevalidateService], exports: [RevalidateService] })
export class RevalidateModule {}
