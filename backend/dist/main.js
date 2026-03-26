"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./core/errors/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Trust proxy
    app.set('trust proxy', 1);
    // Security
    app.use((0, helmet_1.default)());
    // CORS
    const corsOrigins = process.env.CORS_ORIGINS?.split(',') || '*';
    app.enableCors({
        origin: corsOrigins,
        credentials: process.env.CORS_CREDENTIALS === 'true',
    });
    // Global prefix (prefijo ya incluido en controladores)
    // app.setGlobalPrefix('api');
    // Validation
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    // Global exception filter
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Automation Hub API')
        .setDescription('Personal automation system API')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}
bootstrap().catch((err) => {
    console.error('❌ Failed to bootstrap application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map