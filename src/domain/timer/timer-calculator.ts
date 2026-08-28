import type { TurnPhase } from '../game/game-state-machine';

/**
 * Pure Timer Calculator
 * Reference: docs/phase-0/11-game-state-machine.md
 */

/**
 * Calculates remaining seconds from an epoch timestamp.
 * Returns 0 if already expired.
 */
export function calculateRemainingSeconds(
  turnEndsAt: Date | string | number,
  now: Date | string | number = new Date()
): number {
  const endsMs = new Date(turnEndsAt).getTime();
  const nowMs = new Date(now).getTime();
  const diffMs = endsMs - nowMs;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 1000);
}

/**
 * Checks if a timer deadline has passed.
 */
export function isTimerExpired(
  turnEndsAt: Date | string | number,
  now: Date | string | number = new Date()
): boolean {
  const endsMs = new Date(turnEndsAt).getTime();
  const nowMs = new Date(now).getTime();
  return nowMs >= endsMs;
}

/**
 * Determines the allocated duration in seconds for a given phase.
 */
export function getPhaseDurationSeconds(
  phase: TurnPhase,
  describeTimerSec: number,
  drawTimerSec: number
): number {
  return phase === 'DESCRIBE' ? describeTimerSec : drawTimerSec;
}

/**
 * Computes the new turnEndsAt Date from a start time and duration.
 */
export function computeTurnEndsAt(
  startedAt: Date = new Date(),
  durationSeconds: number
): Date {
  return new Date(startedAt.getTime() + durationSeconds * 1000);
}
