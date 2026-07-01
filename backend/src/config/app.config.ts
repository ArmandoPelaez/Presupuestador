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
}));
