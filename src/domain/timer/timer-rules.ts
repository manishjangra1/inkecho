/**
 * Pure Timer Rules for Game Pausing and Disconnection Grace Periods
 */

/**
 * Calculates remaining milliseconds at the moment of pausing.
 */
export function calculatePauseRemainingMs(
  turnEndsAt: Date,
  pausedAt: Date = new Date()
): number {
  const remaining = turnEndsAt.getTime() - pausedAt.getTime();
  return Math.max(0, remaining);
}

/**
 * Calculates a new turnEndsAt timestamp when resuming from pause.
 */
export function calculateResumeTurnEndsAt(
  pauseRemainingMs: number,
  resumedAt: Date = new Date()
): Date {
  return new Date(resumedAt.getTime() + Math.max(1000, pauseRemainingMs));
}

/**
 * Checks if a disconnected player has exceeded the reconnect grace period.
 */
export function isGracePeriodExpired(
  disconnectedAt: Date,
  gracePeriodMs: number,
  now: Date = new Date()
): boolean {
  const elapsed = now.getTime() - disconnectedAt.getTime();
  return elapsed >= gracePeriodMs;
}
