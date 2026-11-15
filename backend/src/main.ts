import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WixfoxBootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Finding 8: Environment-Separated Strict CORS Policy
  const isProd = process.env.NODE_ENV === 'production';
  const rawOrigins = process.env.CORS_ORIGIN;
  
  let allowedOrigins: (string | RegExp)[] = [];
  if (isProd) {
    if (!rawOrigins || rawOrigins.includes('*')) {
      logger.error('SECURITY ERROR: Wildcard or empty CORS_ORIGIN is forbidden in production!');
      allowedOrigins = ['https://admin.wixfox.net', 'http://127.0.0.1:8080'];
    } else {
      allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
    }
  } else {
    allowedOrigins = (rawOrigins || 'http://localhost:8080,http://127.0.0.1:8080').split(',').map((o) => o.trim());
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server or mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      logger.warn(`Blocked unauthorized CORS request from origin: ${origin}`);
      return callback(new Error('Not allowed by Wixfox CORS policy'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 3600,
  });

  const port = parseInt(process.env.BACKEND_PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`Wixfox Administration API is listening securely on port ${port} [Env: ${process.env.NODE_ENV || 'development'}]`);
}

bootstrap();
