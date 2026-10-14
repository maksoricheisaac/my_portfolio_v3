import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { OriginGuard } from './common/origin.guard';
import { RevalidateModule } from './common/revalidate.service';
import { IpThrottlerGuard } from './common/throttle';
import { AppConfigModule } from './config/config.module';
import { DashboardModule } from './dashboard/dashboard';
import { HealthController } from './health.controller';
import { MailModule } from './mail/mail.module';
import { MediaModule } from './media/media.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SettingsModule } from './settings/settings';
import { SetupModule } from './setup/setup.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuditModule,
    MailModule,
    RevalidateModule,
    AuthModule,
    ProjectsModule,
    MessagesModule,
    MediaModule,
    SettingsModule,
    DashboardModule,
    SetupModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: rate-limit first, then origin check, then authentication.
    { provide: APP_GUARD, useClass: IpThrottlerGuard },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
