import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser, Public, type AuthUser } from '../auth/auth.types';
import { clientIp } from '../common/client-ip';
import { MessageStatus } from '../generated/prisma/client';
import { ContactDto, ReplyDto, UpdateMessageDto } from './messages.dto';
import { MessagesService } from './messages.service';

@Controller('public/contact')
export class PublicContactController {
  constructor(private readonly messages: MessagesService) {}

  @Public()
  @Throttle({ default: { limit: 4, ttl: 10 * 60_000 } })
  @Post()
  @HttpCode(202)
  async send(@Body() dto: ContactDto, @Req() req: Request) {
    await this.messages.receive(dto, clientIp(req), req.headers['user-agent']);
    return { ok: true };
  }
}

@Controller('admin/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const parsed =
      status && status in MessageStatus ? (status as MessageStatus) : undefined;
    return this.messages.list({
      status: parsed,
      q: q?.slice(0, 100),
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(50, Math.max(1, Number(pageSize) || 20)),
    });
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.messages.get(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.messages.update(id, dto, user.id, clientIp(req));
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post(':id/reply')
  @HttpCode(200)
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.messages.reply(id, dto.body, user.id, clientIp(req));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.messages.remove(id, user.id, clientIp(req));
  }
}
