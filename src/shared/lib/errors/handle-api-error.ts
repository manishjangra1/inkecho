import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import { logger } from '@/infrastructure/monitoring/logger';
import { sentryServer } from '@/infrastructure/monitoring/sentry.server';

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly correlationId: string;
    readonly details?: ReadonlyArray<{ field: string; message: string }>;
    readonly snapshot?: unknown;
  };
}

export function handleApiError(error: unknown, correlationId: string): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    logger.warn({ err: error, correlationId }, 'API request validation failed');
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input.',
          correlationId,
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      {
        status: 400,
        headers: { 'x-correlation-id': correlationId },
      }
    );
  }

  if (error instanceof AppError) {
    logger.warn({ err: error, correlationId }, error.code);
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          correlationId,
          ...(error.context?.snapshot ? { snapshot: error.context.snapshot } : {}),
        },
      },
      {
        status: error.statusCode,
        headers: { 'x-correlation-id': correlationId },
      }
    );
  }

  logger.error({ err: error, correlationId }, 'Unhandled API route error');
  sentryServer.captureException(error, { tags: { correlationId } });

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong. Try again.',
        correlationId,
      },
    },
    {
      status: 500,
      headers: { 'x-correlation-id': correlationId },
    }
  );
}
