import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { GlobalExceptionFilter } from './common/logger/filters/global-exception.filter';
import { LoggingInterceptor } from './common/logger/interceptors/logging.interceptor';
import { requestIdMiddleware } from './common/logger/middleware/request-id.middleware';
import { createGlobalValidationPipe } from './common/pipes/global-validation.pipe';
import { PrismaService } from './prisma/prisma.service';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma = app.get(PrismaService);

  app.use(requestIdMiddleware);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter(prisma));

  app.use(cookieParser());
  app.useGlobalPipes(createGlobalValidationPipe());
  app.useGlobalInterceptors(new BigIntInterceptor());

  const config = new DocumentBuilder()
    .setTitle('PGU IT')
    .setDescription('PGU IT API Document')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3002',
      'https://it.pgu.ac.ir',
      'https://panel-it.pgu.ac.ir',
      'https://test-it.pgu.ac.ir',
      'https://test-panel-it.pgu.ac.ir',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
