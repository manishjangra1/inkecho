import { describe, it, expect } from 'vitest';
import {
  ROOM_STATUS,
  ROOM_EVENT,
  canTransitionRoom,
  transitionRoomStatus,
} from './room-state-machine';
import { executeRoomTransition } from './room-transitions';

describe('Room State Machine', () => {
  it('allows LOBBY -> IN_PROGRESS transition on START_GAME', () => {
    expect(canTransitionRoom(ROOM_STATUS.LOBBY, ROOM_EVENT.START_GAME)).toBe(true);
    expect(transitionRoomStatus(ROOM_STATUS.LOBBY, ROOM_EVENT.START_GAME)).toBe(
      ROOM_STATUS.IN_PROGRESS
    );

    const result = executeRoomTransition({ status: ROOM_STATUS.LOBBY }, ROOM_EVENT.START_GAME);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(ROOM_STATUS.IN_PROGRESS);
    }
  });

  it('allows IN_PROGRESS -> REVEAL transition on FINISH_GAME', () => {
    expect(canTransitionRoom(ROOM_STATUS.IN_PROGRESS, ROOM_EVENT.FINISH_GAME)).toBe(true);
    expect(transitionRoomStatus(ROOM_STATUS.IN_PROGRESS, ROOM_EVENT.FINISH_GAME)).toBe(
      ROOM_STATUS.REVEAL
    );
  });

  it('allows REVEAL -> LOBBY transition on RETURN_TO_LOBBY', () => {
    expect(canTransitionRoom(ROOM_STATUS.REVEAL, ROOM_EVENT.RETURN_TO_LOBBY)).toBe(true);
    expect(transitionRoomStatus(ROOM_STATUS.REVEAL, ROOM_EVENT.RETURN_TO_LOBBY)).toBe(
      ROOM_STATUS.LOBBY
    );
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionRoom(ROOM_STATUS.LOBBY, ROOM_EVENT.FINISH_GAME)).toBe(false);
    expect(canTransitionRoom(ROOM_STATUS.CLOSED, ROOM_EVENT.START_GAME)).toBe(false);

    const result = executeRoomTransition({ status: ROOM_STATUS.LOBBY }, ROOM_EVENT.FINISH_GAME);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_ROOM_STATE');
    }
  });
});
