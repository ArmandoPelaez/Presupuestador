import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3001),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-change-me-please',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  passwordRounds: Number(process.env.PASSWORD_ROUNDS ?? 12),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  publicAppUrl: process.env.PUBLIC_APP_URL ?? 'http://localhost:3000',
  quoteShareDefaultDays: Number(process.env.QUOTE_SHARE_DEFAULT_DAYS ?? 30),
  quoteShareCommentMaxLength: Number(
    process.env.QUOTE_SHARE_COMMENT_MAX_LENGTH ?? 1000,
  ),
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
  aiQuoteDraftDescriptionMaxLength: Number(
    process.env.AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH ?? 2000,
  ),
  aiQuoteDraftTimeoutMs: Number(process.env.AI_QUOTE_DRAFT_TIMEOUT_MS ?? 15000),
}));
