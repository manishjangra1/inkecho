import { ZodError } from 'zod';
import { AppError } from './app-error';
import { logger } from '@/infrastructure/monitoring/logger';
import { sentryServer } from '@/infrastructure/monitoring/sentry.server';

export interface ActionErrorPayload {
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly details?: ReadonlyArray<{ field: string; message: string }>;
  readonly snapshot?: unknown;
}

export type ActionFailure = {
  readonly success: false;
  readonly error: ActionErrorPayload;
};

export function handleActionError(error: unknown, correlationId: string): ActionFailure {
  if (error instanceof ZodError) {
    logger.warn({ err: error, correlationId }, 'Action validation failed');
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check your input.',
        correlationId,
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    };
  }

  if (error instanceof AppError) {
    logger.warn({ err: error, correlationId }, error.code);
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        correlationId,
        ...(error.context?.snapshot ? { snapshot: error.context.snapshot } : {}),
      },
    };
  }

  logger.error({ err: error, correlationId }, 'Unhandled server action error');
  sentryServer.captureException(error, { tags: { correlationId } });

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Try again.',
      correlationId,
    },
  };
}
