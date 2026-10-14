import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppConfig } from '../config/app-config.service';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence in depth (on top of SameSite=Strict cookies): a state-changing request coming
 * from a browser must originate from one of the allowed website origins.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE.has(req.method)) return true;

    const origin = req.headers.origin;
    if (origin) {
      if (this.config.webOrigins.includes(origin)) return true;
      throw new ForbiddenException('Origin not allowed');
    }
    // Browsers always send Origin on cross-site writes; no Origin together with a cross-site
    // Sec-Fetch-Site means something is off.
    const site = req.headers['sec-fetch-site'];
    if (site && site !== 'same-origin' && site !== 'none') {
      throw new ForbiddenException('Cross-site request blocked');
    }
    return true;
  }
}
