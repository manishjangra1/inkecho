import type { TurnPhase } from './game-state-machine';

/**
 * Pure Turn Order & Assignment Functions
 * Reference: docs/phase-0/11-game-state-machine.md
 */

/**
 * Fisher-Yates shuffle to randomize player order for a new game.
 */
export function shufflePlayerOrder<T>(items: readonly T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
  }
  return array;
}

/**
 * Calculates which player is assigned to a specific turn index in a chain.
 * In a chain with N players, each player is assigned sequentially: playerOrder[turnIndex % N].
 */
export function getAssignedPlayerForTurn(
  playerOrder: readonly string[],
  turnIndex: number
): string {
  if (playerOrder.length === 0) {
    throw new Error('playerOrder cannot be empty');
  }
  const index = Math.abs(turnIndex) % playerOrder.length;
  return playerOrder[index]!;
}

/**
 * Determines whether a turn is a DESCRIBE or DRAW phase.
 * Even turnIndex (0, 2, 4...) is DESCRIBE (starter prompt is turn 0).
 * Odd turnIndex (1, 3, 5...) is DRAW.
 */
export function getTurnPhase(turnIndex: number): TurnPhase {
  return Math.abs(turnIndex) % 2 === 0 ? 'DESCRIBE' : 'DRAW';
}

/**
 * Computes total number of turns in a single chain for N players.
 * For MVP: 2N - 1 turns per chain.
 */
export function getTotalTurnsPerChain(playerCount: number): number {
  if (playerCount < 1) return 1;
  return 2 * playerCount - 1;
}
