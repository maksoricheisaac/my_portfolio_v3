import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { IsString, MaxLength } from 'class-validator';
import type { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser, Public, type AuthUser } from '../auth/auth.types';
import { clientIp } from '../common/client-ip';
import { FILENAME_RE, MediaService } from './media.service';

class UpdateAltDto {
  @IsString()
  @MaxLength(200)
  alt!: string;
}

@Controller('media')
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Public()
  @Get(':filename')
  file(@Param('filename') filename: string, @Res() res: Response) {
    if (!FILENAME_RE.test(filename)) throw new NotFoundException();
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.sendFile(
      filename,
      { root: this.media.dir, dotfiles: 'deny' },
      (err) => {
        if (err && !res.headersSent) res.status(404).end();
      },
    );
  }
}

@Controller('admin/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list() {
    return this.media.list();
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt: string | undefined,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.media.upload(file, alt, user.id, clientIp(req));
  }

  @Patch(':id')
  alt(@Param('id') id: string, @Body() dto: UpdateAltDto) {
    return this.media.updateAlt(id, dto.alt);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.media.remove(id, user.id, clientIp(req));
  }
}
