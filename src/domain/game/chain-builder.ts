import { getAssignedPlayerForTurn, getTurnPhase } from './turn-order';
import type { TurnPhase } from './game-state-machine';

export interface GameTurnEntity {
  readonly id: string;
  readonly turnIndex: number;
  readonly playerId: string;
  readonly phase: TurnPhase;
  readonly textContent?: string | null;
  readonly drawingUrl?: string | null;
  readonly drawingPublicId?: string | null;
  readonly submittedAt?: Date | null;
  readonly skipped: boolean;
  readonly autoSubmitted: boolean;
}

export interface GameChainEntity {
  readonly chainIndex: number;
  readonly starterPrompt: string;
  readonly turns: readonly GameTurnEntity[];
}

export interface BuildInitialChainsParams {
  readonly playerOrder: readonly string[];
  readonly roundCount: number;
  readonly starterPrompts: readonly string[];
}

/**
 * Creates an empty turn shell assigned to a specific player.
 */
export function createTurnEntity(
  id: string,
  turnIndex: number,
  playerId: string
): GameTurnEntity {
  return {
    id,
    turnIndex,
    playerId,
    phase: getTurnPhase(turnIndex),
    textContent: null,
    drawingUrl: null,
    drawingPublicId: null,
    submittedAt: null,
    skipped: false,
    autoSubmitted: false,
  };
}

/**
 * Builds the initial game chains and turns for a new game session.
 */
export function buildInitialChains(params: BuildInitialChainsParams): GameChainEntity[] {
  const { playerOrder, roundCount, starterPrompts } = params;
  const chains: GameChainEntity[] = [];

  const effectiveRoundCount = Math.max(1, roundCount);

  for (let c = 0; c < effectiveRoundCount; c++) {
    const starterPrompt =
      starterPrompts[c] || `Round ${c + 1} Starter Prompt`;

    // Generate initial turn slot for turn 0
    const turns: GameTurnEntity[] = [];
    const firstTurnPlayerId = getAssignedPlayerForTurn(playerOrder, 0);
    turns.push(createTurnEntity(`${c}_0`, 0, firstTurnPlayerId));

    chains.push({
      chainIndex: c,
      starterPrompt,
      turns,
    });
  }

  return chains;
}
