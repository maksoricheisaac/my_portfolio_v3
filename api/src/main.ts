import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BadRequestFilter } from './common/bad-request.filter';
import { AppConfig } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const config = app.get(AppConfig);

  app.set('trust proxy', config.get('TRUST_PROXY'));
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { extended: false, limit: '100kb' });

  app.use(
    helmet({
      // The API only serves JSON and images: lock everything else down.
      contentSecurityPolicy: {
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: config.isProd
        ? { maxAge: 63_072_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: config.webOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new BadRequestFilter());
  app.enableShutdownHooks();

  const port = config.get('PORT');
  await app.listen(port);
  new Logger('Bootstrap').log(
    `API listening on :${port} (${config.get('NODE_ENV')})`,
  );
}
void bootstrap();
