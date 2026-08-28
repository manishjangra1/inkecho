import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  GameStateError,
  RateLimitError,
  PayloadTooLargeError,
  ExternalServiceError,
} from './app-error';

describe('AppError Hierarchy', () => {
  it('instantiates ValidationError with 400 status', () => {
    const error = new ValidationError('Bad input', [{ field: 'name', message: 'Too short' }]);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual([{ field: 'name', message: 'Too short' }]);
  });

  it('instantiates UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('instantiates ForbiddenError with 403 status', () => {
    const error = new ForbiddenError('NOT_HOST', 'Only host can start');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('NOT_HOST');
    expect(error.message).toBe('Only host can start');
  });

  it('instantiates NotFoundError with 404 status', () => {
    const error = new NotFoundError('ROOM_NOT_FOUND', 'Room not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('ROOM_NOT_FOUND');
  });

  it('instantiates ConflictError with 409 status', () => {
    const error = new ConflictError('VERSION_CONFLICT', 'State conflict', { version: 42 });
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('VERSION_CONFLICT');
    expect(error.context).toEqual({ version: 42 });
  });

  it('instantiates GameStateError with 409 status', () => {
    const error = new GameStateError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('INVALID_GAME_TRANSITION');
  });

  it('instantiates RateLimitError with 429 status', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('instantiates PayloadTooLargeError with 413 status', () => {
    const error = new PayloadTooLargeError();
    expect(error.statusCode).toBe(413);
    expect(error.code).toBe('FILE_TOO_LARGE');
  });

  it('instantiates ExternalServiceError with 502 status and non-operational flag', () => {
    const error = new ExternalServiceError('Ably publish failed');
    expect(error.statusCode).toBe(502);
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    expect(error.isOperational).toBe(false);
  });
});
