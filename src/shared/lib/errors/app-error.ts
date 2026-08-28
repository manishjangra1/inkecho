/**
 * Structured Application Error Hierarchy
 * Reference: docs/phase-0/17-error-handling-strategy.md
 */

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly isOperational: boolean = true;

  constructor(
    message: string,
    readonly context?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  constructor(
    message: string = 'Please check your input.',
    readonly details?: Array<{ field: string; message: string }>
  ) {
    super(message, { details });
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
  constructor(message: string = 'Please sign in to continue.') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code: string;
  readonly statusCode = 403;
  constructor(code: string = 'FORBIDDEN', message: string = "You don't have permission.") {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  readonly code: string;
  readonly statusCode = 404;
  constructor(code: string = 'NOT_FOUND', message: string = 'Not found.') {
    super(message);
    this.code = code;
  }
}

export class ConflictError extends AppError {
  readonly code: string;
  readonly statusCode = 409;
  constructor(
    code: string = 'CONFLICT',
    message: string = 'Resource state conflict.',
    context?: Record<string, unknown>
  ) {
    super(message, context);
    this.code = code;
  }
}

export class GameStateError extends AppError {
  readonly code = 'INVALID_GAME_TRANSITION';
  readonly statusCode = 409;
  constructor(message: string = 'Action not allowed in current game state.') {
    super(message);
  }
}

export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMITED';
  readonly statusCode = 429;
  constructor(message: string = 'Too many requests. Try again soon.') {
    super(message);
  }
}

export class PayloadTooLargeError extends AppError {
  readonly code = 'FILE_TOO_LARGE';
  readonly statusCode = 413;
  constructor(message: string = 'Drawing file too large.') {
    super(message);
  }
}

export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;
  override readonly isOperational = false;
  constructor(message: string = 'Service temporarily unavailable.') {
    super(message);
  }
}
