/**
 * Pure Room State Machine
 * Reference: docs/phase-0/11-game-state-machine.md
 */

export const ROOM_STATUS = {
  LOBBY: 'LOBBY',
  IN_PROGRESS: 'IN_PROGRESS',
  REVEAL: 'REVEAL',
  CLOSED: 'CLOSED',
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export const ROOM_EVENT = {
  START_GAME: 'START_GAME',
  FINISH_GAME: 'FINISH_GAME',
  RETURN_TO_LOBBY: 'RETURN_TO_LOBBY',
  CLOSE_ROOM: 'CLOSE_ROOM',
} as const;

export type RoomEvent = (typeof ROOM_EVENT)[keyof typeof ROOM_EVENT];

const ROOM_TRANSITIONS: Record<RoomStatus, Partial<Record<RoomEvent, RoomStatus>>> = {
  LOBBY: {
    START_GAME: 'IN_PROGRESS',
    CLOSE_ROOM: 'CLOSED',
  },
  IN_PROGRESS: {
    FINISH_GAME: 'REVEAL',
    CLOSE_ROOM: 'CLOSED',
  },
  REVEAL: {
    RETURN_TO_LOBBY: 'LOBBY',
    CLOSE_ROOM: 'CLOSED',
  },
  CLOSED: {},
};

export function canTransitionRoom(from: RoomStatus, event: RoomEvent): boolean {
  return !!ROOM_TRANSITIONS[from]?.[event];
}

export function transitionRoomStatus(from: RoomStatus, event: RoomEvent): RoomStatus | null {
  return ROOM_TRANSITIONS[from]?.[event] ?? null;
}
