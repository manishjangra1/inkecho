import { describe, it, expect } from 'vitest';
import {
  canTransitionGame,
  transitionGameStatus,
  GAME_STATUS,
  GAME_EVENT,
} from './game-state-machine';

describe('Game State Machine', () => {
  it('allows valid transitions from IN_PROGRESS', () => {
    expect(canTransitionGame(GAME_STATUS.IN_PROGRESS, GAME_EVENT.SUBMIT_DESCRIPTION)).toBe(true);
    expect(canTransitionGame(GAME_STATUS.IN_PROGRESS, GAME_EVENT.PAUSE)).toBe(true);
    expect(canTransitionGame(GAME_STATUS.IN_PROGRESS, GAME_EVENT.START_REVEAL)).toBe(true);
    expect(transitionGameStatus(GAME_STATUS.IN_PROGRESS, GAME_EVENT.PAUSE)).toBe(GAME_STATUS.PAUSED);
  });

  it('allows resuming from PAUSED', () => {
    expect(canTransitionGame(GAME_STATUS.PAUSED, GAME_EVENT.RESUME)).toBe(true);
    expect(transitionGameStatus(GAME_STATUS.PAUSED, GAME_EVENT.RESUME)).toBe(GAME_STATUS.IN_PROGRESS);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionGame(GAME_STATUS.PAUSED, GAME_EVENT.SUBMIT_DESCRIPTION)).toBe(false);
    expect(canTransitionGame(GAME_STATUS.COMPLETED, GAME_EVENT.PAUSE)).toBe(false);
    expect(transitionGameStatus(GAME_STATUS.COMPLETED, GAME_EVENT.START_GAME)).toBeNull();
  });
});
