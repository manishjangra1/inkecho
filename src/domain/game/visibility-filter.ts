import type { GameStatus, TurnPhase } from './game-state-machine';
import type { GameChainEntity } from './chain-builder';

export interface FilteredTurnDto {
  readonly id: string;
  readonly turnIndex: number;
  readonly playerId: string;
  readonly phase: TurnPhase;
  readonly textContent?: string | null;
  readonly drawingUrl?: string | null;
  readonly submittedAt?: Date | null;
  readonly skipped: boolean;
  readonly autoSubmitted: boolean;
}

export interface FilteredChainDto {
  readonly chainIndex: number;
  readonly starterPrompt?: string | null;
  readonly turns: readonly FilteredTurnDto[];
}

export interface CurrentTurnContext {
  readonly chainIndex: number;
  readonly turnIndex: number;
  readonly activePlayerId: string;
  readonly phase: TurnPhase;
  readonly priorContent?: {
    readonly type: 'STARTER_PROMPT' | 'DESCRIPTION' | 'DRAWING';
    readonly text?: string | null;
    readonly drawingUrl?: string | null;
  } | null;
}

/**
 * Filters game chain content based on the viewer's role, active turn, and overall game status.
 * Prevents players from cheating by inspecting DOM/JSON payload before the reveal phase.
 */
export function filterChainsForViewer(
  chains: readonly GameChainEntity[],
  viewerPlayerId: string,
  gameStatus: GameStatus,
  _currentChainIndex: number,
  _currentTurnIndex: number
): FilteredChainDto[] {
  // During REVEAL and COMPLETED, all chains and turns are fully visible
  if (gameStatus === 'REVEAL' || gameStatus === 'COMPLETED') {
    return chains.map((chain) => ({
      chainIndex: chain.chainIndex,
      starterPrompt: chain.starterPrompt,
      turns: chain.turns.map((turn) => ({
        id: turn.id,
        turnIndex: turn.turnIndex,
        playerId: turn.playerId,
        phase: turn.phase,
        textContent: turn.textContent,
        drawingUrl: turn.drawingUrl,
        submittedAt: turn.submittedAt,
        skipped: turn.skipped,
        autoSubmitted: turn.autoSubmitted,
      })),
    }));
  }

  // During IN_PROGRESS / PAUSED, hide content
  return chains.map((chain) => {
    return {
      chainIndex: chain.chainIndex,
      // Hide starter prompt from all players until reveal (except as passed to active player context)
      starterPrompt: null,
      turns: chain.turns.map((turn) => {
        const isViewerTurn = turn.playerId === viewerPlayerId;

        return {
          id: turn.id,
          turnIndex: turn.turnIndex,
          playerId: turn.playerId,
          phase: turn.phase,
          // Only show submitted content to the person who submitted it or after submit
          textContent: isViewerTurn ? turn.textContent : null,
          drawingUrl: isViewerTurn ? turn.drawingUrl : null,
          submittedAt: turn.submittedAt,
          skipped: turn.skipped,
          autoSubmitted: turn.autoSubmitted,
        };
      }),
    };
  });
}

/**
 * Extracts prompt or prior drawing context specifically for the active player in their current turn.
 */
export function getActivePlayerPromptContext(
  chains: readonly GameChainEntity[],
  currentChainIndex: number,
  currentTurnIndex: number,
  activePlayerId: string,
  viewerPlayerId: string
): CurrentTurnContext['priorContent'] | null {
  if (activePlayerId !== viewerPlayerId) {
    return null;
  }

  const chain = chains.find((c) => c.chainIndex === currentChainIndex);
  if (!chain) return null;

  // Turn 0: Starter Prompt
  if (currentTurnIndex === 0) {
    return {
      type: 'STARTER_PROMPT',
      text: chain.starterPrompt,
      drawingUrl: null,
    };
  }

  // Turn > 0: inspect prior turn
  const priorTurn = chain.turns.find((t) => t.turnIndex === currentTurnIndex - 1);
  if (!priorTurn) {
    // If prior turn 0 was the starter prompt directly
    return {
      type: 'STARTER_PROMPT',
      text: chain.starterPrompt,
      drawingUrl: null,
    };
  }

  if (priorTurn.phase === 'DESCRIBE') {
    return {
      type: 'DESCRIPTION',
      text: priorTurn.textContent || chain.starterPrompt,
      drawingUrl: null,
    };
  } else {
    return {
      type: 'DRAWING',
      text: null,
      drawingUrl: priorTurn.drawingUrl,
    };
  }
}
