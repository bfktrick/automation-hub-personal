"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidation = envValidation;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Database
    DATABASE_URL: zod_1.z.string(),
    // Redis
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    // CORS
    CORS_ORIGINS: zod_1.z.string().default('*'),
    CORS_CREDENTIALS: zod_1.z.enum(['true', 'false']).default('true'),
    // Rate limiting
    RATE_LIMIT: zod_1.z.coerce.number().default(100),
    RATE_TTL: zod_1.z.coerce.number().default(900),
    // JWT
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRATION: zod_1.z.coerce.number().default(3600),
    // OpenAI (optional)
    OPENAI_API_KEY: zod_1.z.string().optional(),
    // Telegram (optional)
    TELEGRAM_BOT_TOKEN: zod_1.z.string().optional(),
    TELEGRAM_CHAT_ID: zod_1.z.string().optional(),
});
function envValidation(config) {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        result.error.errors.forEach((error) => {
            console.error(`  - ${error.path.join('.')}: ${error.message}`);
        });
        throw new Error('Invalid environment variables');
    }
    return result.data;
}
//# sourceMappingURL=env.validation.js.map