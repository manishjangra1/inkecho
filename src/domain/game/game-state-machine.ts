/**
 * Pure Game State Machine
 * Reference: docs/phase-0/11-game-state-machine.md
 */

export const GAME_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  REVEAL: 'REVEAL',
  COMPLETED: 'COMPLETED',
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export const TURN_PHASE = {
  DESCRIBE: 'DESCRIBE',
  DRAW: 'DRAW',
} as const;

export type TurnPhase = (typeof TURN_PHASE)[keyof typeof TURN_PHASE];

export const TURN_STATE = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  SUBMITTED: 'SUBMITTED',
  SKIPPED: 'SKIPPED',
  AUTO_SUBMITTED: 'AUTO_SUBMITTED',
} as const;

export type TurnState = (typeof TURN_STATE)[keyof typeof TURN_STATE];

export const GAME_EVENT = {
  START_GAME: 'START_GAME',
  SUBMIT_DESCRIPTION: 'SUBMIT_DESCRIPTION',
  SUBMIT_DRAWING: 'SUBMIT_DRAWING',
  TIMER_EXPIRED: 'TIMER_EXPIRED',
  SKIP_TURN: 'SKIP_TURN',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  START_REVEAL: 'START_REVEAL',
  COMPLETE_GAME: 'COMPLETE_GAME',
} as const;

export type GameEvent = (typeof GAME_EVENT)[keyof typeof GAME_EVENT];

const GAME_TRANSITIONS: Record<GameStatus, Partial<Record<GameEvent, GameStatus>>> = {
  IN_PROGRESS: {
    SUBMIT_DESCRIPTION: 'IN_PROGRESS',
    SUBMIT_DRAWING: 'IN_PROGRESS',
    TIMER_EXPIRED: 'IN_PROGRESS',
    SKIP_TURN: 'IN_PROGRESS',
    PAUSE: 'PAUSED',
    START_REVEAL: 'REVEAL',
    COMPLETE_GAME: 'COMPLETED',
  },
  PAUSED: {
    RESUME: 'IN_PROGRESS',
    COMPLETE_GAME: 'COMPLETED',
  },
  REVEAL: {
    COMPLETE_GAME: 'COMPLETED',
  },
  COMPLETED: {},
};

export function canTransitionGame(from: GameStatus, event: GameEvent): boolean {
  return !!GAME_TRANSITIONS[from]?.[event];
}

export function transitionGameStatus(from: GameStatus, event: GameEvent): GameStatus | null {
  return GAME_TRANSITIONS[from]?.[event] ?? null;
}
