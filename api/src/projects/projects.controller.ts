import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser, Public, type AuthUser } from '../auth/auth.types';
import { clientIp } from '../common/client-ip';
import { CreateProjectDto, ReorderDto, UpdateProjectDto } from './project.dto';
import { ProjectsService } from './projects.service';

@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Get()
  list() {
    return this.projects.listPublished();
  }

  @Public()
  @Get(':slug')
  one(@Param('slug') slug: string) {
    return this.projects.getPublished(slug);
  }
}

@Controller('admin/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query('q') q?: string, @Query('published') published?: string) {
    return this.projects.list({
      q: q?.slice(0, 100),
      published: published === undefined ? undefined : published === 'true',
    });
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.projects.get(id);
  }

  @Post()
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.projects.create(dto, user.id, clientIp(req));
  }

  @Post('import-seed')
  @HttpCode(200)
  importSeed(@CurrentUser() user: AuthUser, @Req() req: Request) {
    return this.projects.importSeed(user.id, clientIp(req));
  }

  @Put('order')
  @HttpCode(204)
  reorder(
    @Body() dto: ReorderDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.projects.reorder(dto.ids, user.id, clientIp(req));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.projects.update(id, dto, user.id, clientIp(req));
  }

  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.projects.duplicate(id, user.id, clientIp(req));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.projects.remove(id, user.id, clientIp(req));
  }
}
