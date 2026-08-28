/**
 * Sentry Client Monitoring Stub / Interface
 */

export const sentryClient = {
  captureException(error: unknown, context?: Record<string, unknown>): string {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Client Captured]:', error, context);
    }
    return 'mock-client-event-id';
  },
  captureMessage(message: string, context?: Record<string, unknown>): string {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Client Message]:', message, context);
    }
    return 'mock-client-event-id';
  },
};
