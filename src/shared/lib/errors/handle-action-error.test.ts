import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { handleActionError } from './handle-action-error';
import { NotFoundError, ConflictError } from './app-error';

describe('handleActionError', () => {
  const correlationId = 'test-corr-123';

  it('formats Zod validation errors', () => {
    const schema = z.object({ code: z.string().length(6) });
    const parseResult = schema.safeParse({ code: '12' });
    if (!parseResult.success) {
      const handled = handleActionError(parseResult.error, correlationId);
      expect(handled.success).toBe(false);
      expect(handled.error.code).toBe('VALIDATION_ERROR');
      expect(handled.error.correlationId).toBe(correlationId);
      expect(handled.error.details).toBeDefined();
      expect(handled.error.details?.length).toBeGreaterThan(0);
    }
  });

  it('formats AppError operational instances', () => {
    const error = new NotFoundError('ROOM_NOT_FOUND', 'Room does not exist');
    const handled = handleActionError(error, correlationId);
    expect(handled.success).toBe(false);
    expect(handled.error.code).toBe('ROOM_NOT_FOUND');
    expect(handled.error.message).toBe('Room does not exist');
    expect(handled.error.correlationId).toBe(correlationId);
  });

  it('extracts snapshot context on ConflictError', () => {
    const error = new ConflictError('VERSION_CONFLICT', 'Version mismatch', {
      snapshot: { version: 5 },
    });
    const handled = handleActionError(error, correlationId);
    expect(handled.success).toBe(false);
    expect(handled.error.code).toBe('VERSION_CONFLICT');
    expect(handled.error.snapshot).toEqual({ version: 5 });
  });

  it('formats unhandled unknown errors as INTERNAL_ERROR', () => {
    const error = new Error('Unexpected crash');
    const handled = handleActionError(error, correlationId);
    expect(handled.success).toBe(false);
    expect(handled.error.code).toBe('INTERNAL_ERROR');
    expect(handled.error.message).toBe('Something went wrong. Try again.');
  });
});
