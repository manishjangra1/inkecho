import type { GameSnapshotDto, TurnSnapshotDto } from '@/infrastructure/db/mappers/game.mapper';
import type { GameStatus, TurnPhase } from '@/domain/game/game-state-machine';

export type { GameSnapshotDto, TurnSnapshotDto, GameStatus, TurnPhase };

export interface SubmitDescriptionInput {
  readonly roomCode: string;
  readonly roomId: string;
  readonly text: string;
  readonly expectedVersion: number;
}

export interface SubmitDescriptionResponse {
  readonly version: number;
  readonly gameStatus: GameStatus;
  readonly currentTurn: TurnSnapshotDto | null;
}

export interface SubmitDrawingInput {
  readonly roomCode: string;
  readonly roomId: string;
  readonly expectedVersion: number;
  readonly imageDataUrl?: string;
  readonly imageBase64?: string;
  readonly imageBuffer?: Buffer;
}

export interface SubmitDrawingResponse {
  readonly version: number;
  readonly drawingUrl: string;
  readonly gameStatus: GameStatus;
  readonly currentTurn: TurnSnapshotDto | null;
}

export interface PauseGameResponse {
  readonly version: number;
  readonly status: 'PAUSED';
  readonly pausedAt: string;
  readonly remainingSeconds: number;
}

export interface ResumeGameResponse {
  readonly version: number;
  readonly status: 'IN_PROGRESS';
  readonly turnEndsAt: string;
  readonly remainingSeconds: number;
}

export interface StartGameResponse {
  readonly gameId: string;
  readonly status: 'IN_PROGRESS';
  readonly version: number;
  readonly currentTurn: TurnSnapshotDto;
}
