import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3001),
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32).default('development-only-change-me-please'),
  JWT_EXPIRES_IN: z.string().min(2).default('15m'),
  PASSWORD_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  QUOTE_SHARE_DEFAULT_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  QUOTE_SHARE_COMMENT_MAX_LENGTH: z.coerce
    .number()
    .int()
    .min(100)
    .max(5000)
    .default(1000),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-5.4-mini'),
  AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH: z.coerce
    .number()
    .int()
    .min(100)
    .max(10000)
    .default(2000),
  AI_QUOTE_DRAFT_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(60000)
    .default(15000),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment: ${result.error.message}`);
  }
  return result.data;
}
