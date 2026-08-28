/**
 * Sentry Server Monitoring Stub / Interface
 */

export const sentryServer = {
  captureException(_error: unknown, _context?: Record<string, unknown>): string {
    return 'mock-server-event-id';
  },
  captureMessage(_message: string, _context?: Record<string, unknown>): string {
    return 'mock-server-event-id';
  },
  setContext(_name: string, _context: Record<string, unknown>): void {
    // Context hook
  },
  setTag(_key: string, _value: string): void {
    // Tag hook
  },
};
