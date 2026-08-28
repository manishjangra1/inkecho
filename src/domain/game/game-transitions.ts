import { ok, err, type Result } from '../shared/result';
import { createDomainError, type DomainError, DOMAIN_ERROR_CODES } from '../shared/errors';
import {
  type GameStatus,
  type TurnPhase,
  canTransitionGame,
} from './game-state-machine';
import {
  type GameChainEntity,
  type GameTurnEntity,
  createTurnEntity,
} from './chain-builder';
import { getAssignedPlayerForTurn, getTurnPhase, getTotalTurnsPerChain } from './turn-order';
import { computeTurnEndsAt, getPhaseDurationSeconds } from '../timer/timer-calculator';
import { calculatePauseRemainingMs, calculateResumeTurnEndsAt } from '../timer/timer-rules';

export interface GameEntity {
  readonly id: string;
  readonly roomId: string;
  readonly status: GameStatus;
  readonly version: number;
  readonly currentRoundIndex: number;
  readonly currentChainIndex: number;
  readonly currentTurnIndex: number;
  readonly turnPhase: TurnPhase;
  readonly turnStartedAt: Date;
  readonly turnEndsAt: Date;
  readonly activePlayerId: string;
  readonly chains: readonly GameChainEntity[];
  readonly playerOrder: readonly string[];
  readonly votes?: { counts: Record<string, number> } | null;
  readonly revealChainIndex: number;
  readonly revealStepIndex: number;
  readonly pausedAt?: Date | null;
  readonly pauseRemainingMs?: number | null;
  readonly completedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TransitionGameEvent =
  | {
      readonly type: 'SUBMIT_DESCRIPTION';
      readonly playerId: string;
      readonly textContent: string;
      readonly describeTimerSec: number;
      readonly drawTimerSec: number;
      readonly submittedAt?: Date;
    }
  | {
      readonly type: 'SUBMIT_DRAWING';
      readonly playerId: string;
      readonly drawingUrl: string;
      readonly drawingPublicId?: string;
      readonly describeTimerSec: number;
      readonly drawTimerSec: number;
      readonly submittedAt?: Date;
    }
  | {
      readonly type: 'TIMER_EXPIRED';
      readonly describeTimerSec: number;
      readonly drawTimerSec: number;
      readonly expiredAt?: Date;
    }
  | {
      readonly type: 'SKIP_TURN';
      readonly playerId: string;
      readonly reason: string;
      readonly describeTimerSec: number;
      readonly drawTimerSec: number;
    }
  | {
      readonly type: 'PAUSE';
      readonly pausedAt?: Date;
    }
  | {
      readonly type: 'RESUME';
      readonly resumedAt?: Date;
    };

/**
 * Pure transition engine for active games.
 */
export function transitionGame(
  game: GameEntity,
  event: TransitionGameEvent
): Result<GameEntity, DomainError> {
  const now = new Date();

  // Guard: Pause / Resume
  if (event.type === 'PAUSE') {
    if (!canTransitionGame(game.status, 'PAUSE')) {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
          `Cannot pause game in ${game.status} state.`
        )
      );
    }
    const pauseTime = event.pausedAt || now;
    const pauseRemainingMs = calculatePauseRemainingMs(game.turnEndsAt, pauseTime);
    return ok({
      ...game,
      status: 'PAUSED',
      pausedAt: pauseTime,
      pauseRemainingMs,
      updatedAt: pauseTime,
    });
  }

  if (event.type === 'RESUME') {
    if (!canTransitionGame(game.status, 'RESUME')) {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
          `Cannot resume game in ${game.status} state.`
        )
      );
    }
    const resumeTime = event.resumedAt || now;
    const newTurnEndsAt = calculateResumeTurnEndsAt(
      game.pauseRemainingMs ?? 30000,
      resumeTime
    );
    return ok({
      ...game,
      status: 'IN_PROGRESS',
      pausedAt: null,
      pauseRemainingMs: null,
      turnEndsAt: newTurnEndsAt,
      updatedAt: resumeTime,
    });
  }

  // Active turn transitions require IN_PROGRESS
  if (game.status !== 'IN_PROGRESS') {
    return err(
      createDomainError(
        DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
        `Game is currently ${game.status}. Only active games can accept turn actions.`
      )
    );
  }

  // Handle Turn Submission / Expiry / Skip
  const totalTurnsPerChain = getTotalTurnsPerChain(game.playerOrder.length);
  const currentChain = game.chains.find((c) => c.chainIndex === game.currentChainIndex);

  if (!currentChain) {
    return err(
      createDomainError(
        DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
        `Chain index ${game.currentChainIndex} not found.`
      )
    );
  }

  let updatedTurn: GameTurnEntity;
  const submitTime =
    event.type === 'TIMER_EXPIRED'
      ? (event.expiredAt || now)
      : event.type === 'SUBMIT_DESCRIPTION' || event.type === 'SUBMIT_DRAWING'
        ? (event.submittedAt || now)
        : now;


  if (event.type === 'SUBMIT_DESCRIPTION') {
    if (game.activePlayerId !== event.playerId) {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.NOT_YOUR_TURN,
          'It is not your turn to submit.'
        )
      );
    }
    if (game.turnPhase !== 'DESCRIBE') {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
          'Current turn phase is not DESCRIBE.'
        )
      );
    }

    updatedTurn = {
      id: `${game.currentChainIndex}_${game.currentTurnIndex}`,
      turnIndex: game.currentTurnIndex,
      playerId: event.playerId,
      phase: 'DESCRIBE',
      textContent: event.textContent.trim(),
      drawingUrl: null,
      drawingPublicId: null,
      submittedAt: submitTime,
      skipped: false,
      autoSubmitted: false,
    };
  } else if (event.type === 'SUBMIT_DRAWING') {
    if (game.activePlayerId !== event.playerId) {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.NOT_YOUR_TURN,
          'It is not your turn to submit.'
        )
      );
    }
    if (game.turnPhase !== 'DRAW') {
      return err(
        createDomainError(
          DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
          'Current turn phase is not DRAW.'
        )
      );
    }

    updatedTurn = {
      id: `${game.currentChainIndex}_${game.currentTurnIndex}`,
      turnIndex: game.currentTurnIndex,
      playerId: event.playerId,
      phase: 'DRAW',
      textContent: null,
      drawingUrl: event.drawingUrl,
      drawingPublicId: event.drawingPublicId ?? null,
      submittedAt: submitTime,
      skipped: false,
      autoSubmitted: false,
    };
  } else if (event.type === 'TIMER_EXPIRED') {
    updatedTurn = {
      id: `${game.currentChainIndex}_${game.currentTurnIndex}`,
      turnIndex: game.currentTurnIndex,
      playerId: game.activePlayerId,
      phase: game.turnPhase,
      textContent: game.turnPhase === 'DESCRIBE' ? '⏱ Time expired' : null,
      drawingUrl: null,
      drawingPublicId: null,
      submittedAt: submitTime,
      skipped: false,
      autoSubmitted: true,
    };
  } else if (event.type === 'SKIP_TURN') {
    updatedTurn = {
      id: `${game.currentChainIndex}_${game.currentTurnIndex}`,
      turnIndex: game.currentTurnIndex,
      playerId: event.playerId,
      phase: game.turnPhase,
      textContent: null,
      drawingUrl: null,
      drawingPublicId: null,
      submittedAt: submitTime,
      skipped: true,
      autoSubmitted: false,
    };
  } else {
    return err(
      createDomainError(
        DOMAIN_ERROR_CODES.INVALID_GAME_TRANSITION,
        'Unknown game event type.'
      )
    );
  }

  // Update current chain turns
  const newTurns = [...currentChain.turns];
  const existingTurnIndex = newTurns.findIndex(
    (t) => t.turnIndex === game.currentTurnIndex
  );

  if (existingTurnIndex >= 0) {
    newTurns[existingTurnIndex] = updatedTurn;
  } else {
    newTurns.push(updatedTurn);
  }

  const updatedChains = game.chains.map((chain) => {
    if (chain.chainIndex === game.currentChainIndex) {
      return { ...chain, turns: newTurns };
    }
    return chain;
  });

  // Calculate Next Step: Next Turn vs Next Chain vs Reveal
  const nextTurnIndex = game.currentTurnIndex + 1;
  const describeSec = event.describeTimerSec;
  const drawSec = event.drawTimerSec;

  if (nextTurnIndex < totalTurnsPerChain) {
    // Advance to next turn in the current chain
    const nextPhase = getTurnPhase(nextTurnIndex);
    const nextPlayerId = getAssignedPlayerForTurn(game.playerOrder, nextTurnIndex);
    const duration = getPhaseDurationSeconds(nextPhase, describeSec, drawSec);
    const nextTurnEndsAt = computeTurnEndsAt(submitTime, duration);

    // Prepare placeholder for next turn
    const chainWithNextSlot = updatedChains.map((c) => {
      if (c.chainIndex === game.currentChainIndex) {
        return {
          ...c,
          turns: [...c.turns, createTurnEntity(`${c.chainIndex}_${nextTurnIndex}`, nextTurnIndex, nextPlayerId)],
        };
      }
      return c;
    });

    return ok({
      ...game,
      currentTurnIndex: nextTurnIndex,
      turnPhase: nextPhase,
      activePlayerId: nextPlayerId,
      turnStartedAt: submitTime,
      turnEndsAt: nextTurnEndsAt,
      chains: chainWithNextSlot,
      updatedAt: submitTime,
    });
  }

  // Current chain is complete — check for next chain
  const nextChainIndex = game.currentChainIndex + 1;

  if (nextChainIndex < game.chains.length) {
    // Advance to next chain (starts at turn 0, DESCRIBE)
    const nextPlayerId = getAssignedPlayerForTurn(game.playerOrder, 0);
    const nextPhase = 'DESCRIBE';
    const duration = getPhaseDurationSeconds(nextPhase, describeSec, drawSec);
    const nextTurnEndsAt = computeTurnEndsAt(submitTime, duration);

    return ok({
      ...game,
      currentChainIndex: nextChainIndex,
      currentTurnIndex: 0,
      turnPhase: nextPhase,
      activePlayerId: nextPlayerId,
      turnStartedAt: submitTime,
      turnEndsAt: nextTurnEndsAt,
      chains: updatedChains,
      updatedAt: submitTime,
    });
  }

  // All chains and turns are complete -> Advance to REVEAL
  return ok({
    ...game,
    status: 'REVEAL',
    chains: updatedChains,
    revealChainIndex: 0,
    revealStepIndex: 0,
    updatedAt: submitTime,
  });
}
