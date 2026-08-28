import type { Game, GameChain, GameTurn, GameVotes } from '@prisma/client';
import type { GameEntity } from '@/domain/game/game-transitions';
import type { GameChainEntity, GameTurnEntity } from '@/domain/game/chain-builder';
import type { GameStatus, TurnPhase } from '@/domain/game/game-state-machine';
import {
  filterChainsForViewer,
  getActivePlayerPromptContext,
  type FilteredChainDto,
  type CurrentTurnContext,
} from '@/domain/game/visibility-filter';

export interface TurnSnapshotDto {
  readonly id: string;
  readonly chainIndex: number;
  readonly turnIndex: number;
  readonly phase: TurnPhase;
  readonly activePlayerId: string;
  readonly turnStartedAt: string;
  readonly turnEndsAt: string;
  readonly isMyTurn: boolean;
  readonly promptContext: CurrentTurnContext['priorContent'] | null;
}

export interface GameSnapshotDto {
  readonly id: string;
  readonly roomId: string;
  readonly status: GameStatus;
  readonly version: number;
  readonly currentRoundIndex: number;
  readonly currentChainIndex: number;
  readonly currentTurnIndex: number;
  readonly turnPhase: TurnPhase;
  readonly activePlayerId: string;
  readonly playerOrder: readonly string[];
  readonly currentTurn: TurnSnapshotDto;
  readonly chains: readonly FilteredChainDto[];
  readonly pausedAt?: string | null;
  readonly pauseRemainingMs?: number | null;
  readonly votes?: Record<string, number> | null;
  readonly serverTime: string;
}

export function toTurnEntity(raw: GameTurn): GameTurnEntity {
  return {
    id: raw.id,
    turnIndex: raw.turnIndex,
    playerId: raw.playerId,
    phase: raw.phase as TurnPhase,
    textContent: raw.textContent,
    drawingUrl: raw.drawingUrl,
    drawingPublicId: raw.drawingPublicId,
    submittedAt: raw.submittedAt,
    skipped: raw.skipped,
    autoSubmitted: raw.autoSubmitted,
  };
}

export function toChainEntity(raw: GameChain): GameChainEntity {
  return {
    chainIndex: raw.chainIndex,
    starterPrompt: raw.starterPrompt,
    turns: (raw.turns || []).map(toTurnEntity),
  };
}

export function toGameEntity(raw: Game): GameEntity {
  let votesCounts: Record<string, number> | null = null;
  if (raw.votes && typeof raw.votes === 'object') {
    const rawCounts = (raw.votes as GameVotes).counts;
    if (rawCounts && typeof rawCounts === 'object') {
      votesCounts = rawCounts as Record<string, number>;
    }
  }

  return {
    id: raw.id,
    roomId: raw.roomId,
    status: raw.status as GameStatus,
    version: raw.version,
    currentRoundIndex: raw.currentRoundIndex,
    currentChainIndex: raw.currentChainIndex,
    currentTurnIndex: raw.currentTurnIndex,
    turnPhase: raw.turnPhase as TurnPhase,
    turnStartedAt: raw.turnStartedAt,
    turnEndsAt: raw.turnEndsAt,
    activePlayerId: raw.activePlayerId,
    chains: (raw.chains || []).map(toChainEntity),
    playerOrder: raw.playerOrder,
    votes: votesCounts ? { counts: votesCounts } : null,
    revealChainIndex: raw.revealChainIndex,
    revealStepIndex: raw.revealStepIndex,
    pausedAt: raw.pausedAt,
    pauseRemainingMs: raw.pauseRemainingMs,
    completedAt: raw.completedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toTurnSnapshotDto(
  game: GameEntity,
  viewerPlayerId: string
): TurnSnapshotDto {
  const isMyTurn = game.activePlayerId === viewerPlayerId;
  const promptContext = isMyTurn
    ? getActivePlayerPromptContext(
        game.chains,
        game.currentChainIndex,
        game.currentTurnIndex,
        game.activePlayerId,
        viewerPlayerId
      )
    : null;

  return {
    id: `${game.currentChainIndex}_${game.currentTurnIndex}`,
    chainIndex: game.currentChainIndex,
    turnIndex: game.currentTurnIndex,
    phase: game.turnPhase,
    activePlayerId: game.activePlayerId,
    turnStartedAt: game.turnStartedAt.toISOString(),
    turnEndsAt: game.turnEndsAt.toISOString(),
    isMyTurn,
    promptContext,
  };
}

export function toGameSnapshotDto(
  game: GameEntity,
  viewerPlayerId: string
): GameSnapshotDto {
  const filteredChains = filterChainsForViewer(
    game.chains,
    viewerPlayerId,
    game.status,
    game.currentChainIndex,
    game.currentTurnIndex
  );

  return {
    id: game.id,
    roomId: game.roomId,
    status: game.status,
    version: game.version,
    currentRoundIndex: game.currentRoundIndex,
    currentChainIndex: game.currentChainIndex,
    currentTurnIndex: game.currentTurnIndex,
    turnPhase: game.turnPhase,
    activePlayerId: game.activePlayerId,
    playerOrder: game.playerOrder,
    currentTurn: toTurnSnapshotDto(game, viewerPlayerId),
    chains: filteredChains,
    pausedAt: game.pausedAt?.toISOString() ?? null,
    pauseRemainingMs: game.pauseRemainingMs ?? null,
    votes: game.votes?.counts ?? null,
    serverTime: new Date().toISOString(),
  };
}

export function chainsToPrisma(chains: readonly GameChainEntity[]): GameChain[] {
  return chains.map((chain) => ({
    chainIndex: chain.chainIndex,
    starterPrompt: chain.starterPrompt,
    turns: chain.turns.map((turn) => ({
      id: turn.id,
      turnIndex: turn.turnIndex,
      playerId: turn.playerId,
      phase: turn.phase,
      textContent: turn.textContent ?? null,
      drawingUrl: turn.drawingUrl ?? null,
      drawingPublicId: turn.drawingPublicId ?? null,
      submittedAt: turn.submittedAt ?? null,
      skipped: turn.skipped,
      autoSubmitted: turn.autoSubmitted,
    })),
  }));
}
