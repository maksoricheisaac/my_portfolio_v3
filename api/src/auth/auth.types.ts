import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  /** Id of the RefreshSession backing the access token. */
  sid: string;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export const IS_PUBLIC = 'isPublic';
/** Opt a route out of the global JWT guard. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest<AuthedRequest>().user as AuthUser;
  },
);

export const ACCESS_COOKIE = 'pf_at';
export const REFRESH_COOKIE = 'pf_rt';
