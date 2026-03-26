import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // CORS
  CORS_ORIGINS: z.string().default('*'),
  CORS_CREDENTIALS: z.enum(['true', 'false']).default('true'),

  // Rate limiting
  RATE_LIMIT: z.coerce.number().default(100),
  RATE_TTL: z.coerce.number().default(900),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.coerce.number().default(3600),

  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),

  // Telegram (optional)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function envValidation(config: Record<string, unknown>): Environment {
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
