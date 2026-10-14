import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [
      projects,
      published,
      messagesNew,
      messages30d,
      media,
      recentMessages,
      recentAudit,
      perDay,
    ] = await this.prisma.$transaction([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { published: true } }),
      this.prisma.message.count({ where: { status: 'NEW' } }),
      this.prisma.message.count({
        where: { createdAt: { gte: since }, status: { not: 'SPAM' } },
      }),
      this.prisma.media.count(),
      this.prisma.message.findMany({
        where: { status: { not: 'SPAM' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.message.findMany({
        where: { createdAt: { gte: since }, status: { not: 'SPAM' } },
        select: { createdAt: true },
      }),
    ]);

    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      buckets.set(
        new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
        0,
      );
    }
    for (const m of perDay) {
      const k = m.createdAt.toISOString().slice(0, 10);
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }

    return {
      projects: { total: projects, published, drafts: projects - published },
      messages: { new: messagesNew, last30Days: messages30d },
      media,
      recentMessages,
      recentActivity: recentAudit,
      messagesPerDay: [...buckets].map(([date, count]) => ({ date, count })),
    };
  }

  async audit(page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total, page, pageSize };
  }
}

@Controller('admin')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard')
  summary() {
    return this.dashboard.summary();
  }

  @Get('audit')
  audit(@Query('page') page?: string) {
    return this.dashboard.audit(Math.max(1, Number(page) || 1), 30);
  }
}

@Module({ controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
