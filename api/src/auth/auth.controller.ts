import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { AppConfig } from '../config/app-config.service';
import { clientIp } from '../common/client-ip';
import { AuthService, type RequestContext, type Tokens } from './auth.service';
import { sessionCookieOptions } from './cookies';
import {
  ACCESS_COOKIE,
  CurrentUser,
  Public,
  REFRESH_COOKIE,
  type AuthUser,
} from './auth.types';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  TwoFactorDto,
  VerifyOtpDto,
} from './dto';

const ctxOf = (req: Request): RequestContext => ({
  ip: clientIp(req),
  userAgent: req.headers['user-agent'],
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfig,
  ) {}

  private cookieOptions(maxAgeMs: number): CookieOptions {
    return sessionCookieOptions({
      secure: this.config.secureCookies,
      domain: this.config.get('COOKIE_DOMAIN'),
      maxAgeMs,
    });
  }

  private setSession(res: Response, tokens: Tokens) {
    res.cookie(
      ACCESS_COOKIE,
      tokens.access,
      this.cookieOptions(this.config.get('ACCESS_TTL_MINUTES') * 60_000),
    );
    res.cookie(
      REFRESH_COOKIE,
      tokens.refresh,
      this.cookieOptions(tokens.refreshExpiresAt.getTime() - Date.now()),
    );
  }

  private clearSession(res: Response) {
    const opts = this.cookieOptions(0);
    delete opts.maxAge;
    res.clearCookie(ACCESS_COOKIE, opts);
    res.clearCookie(REFRESH_COOKIE, opts);
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password, ctxOf(req));
    if (result.step === 'otp') return result;
    this.setSession(res, result.tokens);
    return { step: 'done', user: result.user };
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login/verify')
  @HttpCode(200)
  async verify(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.verifyLoginOtp(
      dto.challenge,
      dto.code,
      ctxOf(req),
    );
    if (result.step !== 'done') throw new UnauthorizedException();
    this.setSession(res, result.tokens);
    return { step: 'done', user: result.user };
  }

  @Public()
  @Throttle({ default: { limit: 4, ttl: 60_000 } })
  @Post('login/resend')
  @HttpCode(200)
  resend(@Body() dto: ResendOtpDto) {
    return this.auth.resendLoginOtp(dto.challenge);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!raw) throw new UnauthorizedException();
    try {
      const { user, tokens } = await this.auth.refresh(raw, ctxOf(req));
      this.setSession(res, tokens);
      return { user };
    } catch (error) {
      this.clearSession(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(
      req.cookies?.[REFRESH_COOKIE],
      undefined,
      clientIp(req),
    );
    this.clearSession(res);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @Post('password/forgot')
  @HttpCode(202)
  async forgot(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.auth.forgotPassword(dto.email, ctxOf(req));
    return { ok: true };
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 10 * 60_000 } })
  @Post('password/reset')
  @HttpCode(200)
  async reset(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    await this.auth.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
      ctxOf(req),
    );
    return { ok: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('password/change')
  @HttpCode(200)
  async change(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    await this.auth.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
      user.sid,
      ctxOf(req),
    );
    return { ok: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Patch('2fa')
  twoFactor(
    @Body() dto: TwoFactorDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.auth.setTwoFactor(
      user.id,
      dto.enabled,
      dto.password,
      clientIp(req),
    );
  }

  @Get('sessions')
  sessions(@CurrentUser() user: AuthUser) {
    return this.auth.listSessions(user.id, user.sid);
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    await this.auth.revokeSession(user.id, id, clientIp(req));
  }
}
