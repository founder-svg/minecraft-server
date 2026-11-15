import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WixfoxBootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = parseInt(process.env.BACKEND_PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`Wixfox Administration API is listening on port ${port}`);
}

bootstrap();
