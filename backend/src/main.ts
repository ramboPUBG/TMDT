import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { setServers } from 'node:dns';
import { AppModule } from './app.module';

async function bootstrap() {
  setServers(['8.8.8.8', '1.1.1.1']);

  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 SachCu Backend running on http://localhost:${port}`);
}
bootstrap();
