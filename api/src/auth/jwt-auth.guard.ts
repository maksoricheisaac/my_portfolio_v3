import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { ACCESS_COOKIE, AuthedRequest, IS_PUBLIC } from './auth.types';

/** Global guard: every route requires a valid access token unless marked @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(
        token,
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          audience: 'access',
        },
      );
      if (!(await this.auth.isSessionActive(payload.sid, payload.sub))) {
        throw new UnauthorizedException();
      }
      req.user = { id: payload.sub, sid: payload.sid };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
