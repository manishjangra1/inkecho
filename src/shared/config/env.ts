import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('mongodb://localhost:27017/inkecho'),
  BETTER_AUTH_SECRET: z.string().min(1).default('development_secret_32_characters_long_min'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GUEST_SESSION_SECRET: z.string().min(1).default('development_guest_secret_32_characters_long'),
  GUEST_SESSION_TTL_HOURS: z.coerce.number().default(24),
  ABLY_API_KEY: z.string().default('dummy:dummy'),
  ABLY_TOKEN_TTL_SECONDS: z.coerce.number().default(3600),
  CLOUDINARY_CLOUD_NAME: z.string().default('inkecho'),
  CLOUDINARY_API_KEY: z.string().default('dummy'),
  CLOUDINARY_API_SECRET: z.string().default('dummy'),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('inkecho/dev/drawings'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('debug'),
  SENTRY_DSN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().default('development_cron_secret_32_characters_long'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('InkEcho'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ENABLE_PUBLIC_ROOMS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_VOTING: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_OAUTH: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

export const serverEnv = serverSchema.parse(process.env);

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ENABLE_PUBLIC_ROOMS: process.env.NEXT_PUBLIC_ENABLE_PUBLIC_ROOMS,
  NEXT_PUBLIC_ENABLE_VOTING: process.env.NEXT_PUBLIC_ENABLE_VOTING,
  NEXT_PUBLIC_ENABLE_OAUTH: process.env.NEXT_PUBLIC_ENABLE_OAUTH,
});

export const env = {
  ...serverEnv,
  ...clientEnv,
};
