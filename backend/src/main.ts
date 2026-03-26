import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/errors/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy
  (app as any).set('trust proxy', 1);

  // CORS DEBE IR ANTES DE HELMET
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim());
  app.enableCors({
    origin: corsOrigins || ['http://localhost', 'http://localhost:4444', 'http://localhost:5173', 'http://localhost:80', 'http://127.0.0.1', 'http://127.0.0.1:4444', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security - DESPUÉS de CORS
  const isDev = process.env.NODE_ENV === 'development';
  app.use(helmet({
    contentSecurityPolicy: isDev ? false : {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'http://localhost:*'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  }));

  // Global prefix (prefijo ya incluido en controladores)
  // app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Automation Hub API')
    .setDescription('Personal automation system API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to bootstrap application:', err);
  process.exit(1);
});
