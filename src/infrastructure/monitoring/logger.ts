import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      '*.password',
      '*.token',
      'DATABASE_URL',
      'ABLY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'BETTER_AUTH_SECRET',
      'GUEST_SESSION_SECRET',
      'CRON_SECRET',
    ],
    censor: '[REDACTED]',
  },
});

export function createRequestLogger(correlationId: string) {
  return logger.child({ correlationId });
}
