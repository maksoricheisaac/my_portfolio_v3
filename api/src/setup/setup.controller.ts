import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../auth/auth.types';
import { clientIp } from '../common/client-ip';
import { SetupCompleteDto, SetupEmailDto, SetupTokenDto } from './setup.dto';
import { SetupService } from './setup.service';

@Public()
@Controller('setup')
export class SetupController {
  constructor(private readonly setup: SetupService) {}

  @Get('status')
  status() {
    return this.setup.status();
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('token')
  @HttpCode(200)
  token(@Body() dto: SetupTokenDto) {
    return this.setup.verifyToken(dto.token);
  }

  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @Post('email/send')
  @HttpCode(200)
  sendEmail(@Body() dto: SetupEmailDto) {
    return this.setup.sendEmailCode(dto.token, dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @Post('complete')
  @HttpCode(201)
  complete(@Body() dto: SetupCompleteDto, @Req() req: Request) {
    return this.setup.complete(dto, clientIp(req));
  }
}
