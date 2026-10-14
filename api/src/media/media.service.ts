import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { AuditService } from '../audit/audit.service';
import { plain } from '../common/sanitize';
import { AppConfig } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);
export const FILENAME_RE = /^[a-f0-9]{32}\.webp$/;

@Injectable()
export class MediaService {
  readonly dir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
    private readonly audit: AuditService,
  ) {
    this.dir = resolve(this.config.get('UPLOAD_DIR'));
  }

  private shape(m: {
    id: string;
    filename: string;
    original: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string;
    createdAt: Date;
  }) {
    return {
      id: m.id,
      url: `${this.config.get('MEDIA_PUBLIC_PATH')}/${m.filename}`,
      original: m.original,
      size: m.size,
      width: m.width,
      height: m.height,
      alt: m.alt,
      createdAt: m.createdAt,
    };
  }

  /**
   * The upload is never trusted: the real format is detected from the bytes (not the
   * extension or Content-Type), the image is re-encoded to WebP (which drops EXIF/GPS metadata
   * and any payload smuggled in the file) and stored under a random name.
   */
  async upload(
    file: Express.Multer.File,
    alt: string | undefined,
    userId: string,
    ip: string,
  ) {
    if (!file?.buffer?.length)
      throw new BadRequestException('No file received.');

    let image = sharp(file.buffer, { limitInputPixels: 50_000_000 });
    let format: string | undefined;
    try {
      format = (await image.metadata()).format;
    } catch {
      throw new BadRequestException('The file is not a valid image.');
    }
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP and AVIF images are accepted.',
      );
    }

    image = image.rotate().resize({
      width: 2400,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const { data, info } = await image
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const filename = `${randomBytes(16).toString('hex')}.webp`;
    await mkdir(this.dir, { recursive: true });
    await writeFile(resolve(this.dir, filename), data, { flag: 'wx' });

    const row = await this.prisma.media.create({
      data: {
        filename,
        original: plain(file.originalname).slice(0, 150),
        mimeType: 'image/webp',
        size: info.size,
        width: info.width,
        height: info.height,
        alt: plain(alt ?? '').slice(0, 200),
      },
    });
    await this.audit.log('media.upload', { userId, ip, target: row.id });
    return this.shape(row);
  }

  async list() {
    const rows = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
    return rows.map((m) => this.shape(m));
  }

  async updateAlt(id: string, alt: string) {
    try {
      const row = await this.prisma.media.update({
        where: { id },
        data: { alt: plain(alt).slice(0, 200) },
      });
      return this.shape(row);
    } catch {
      throw new NotFoundException();
    }
  }

  async remove(id: string, userId: string, ip: string) {
    const row = await this.prisma.media.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.prisma.media.delete({ where: { id } });
    await unlink(resolve(this.dir, row.filename)).catch(() => undefined);
    await this.audit.log('media.delete', { userId, ip, target: id });
  }
}
