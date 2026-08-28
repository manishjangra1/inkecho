import { describe, it, expect } from 'vitest';
import {
  shufflePlayerOrder,
  getAssignedPlayerForTurn,
  getTurnPhase,
  getTotalTurnsPerChain,
} from './turn-order';

describe('Turn Order & Assignment', () => {
  it('shuffles players preserving length and members', () => {
    const players = ['p1', 'p2', 'p3', 'p4'];
    const shuffled = shufflePlayerOrder(players);
    expect(shuffled).toHaveLength(4);
    expect(new Set(shuffled)).toEqual(new Set(players));
  });

  it('assigns turns in cyclic order', () => {
    const players = ['alice', 'bob', 'charlie'];
    expect(getAssignedPlayerForTurn(players, 0)).toBe('alice');
    expect(getAssignedPlayerForTurn(players, 1)).toBe('bob');
    expect(getAssignedPlayerForTurn(players, 2)).toBe('charlie');
    expect(getAssignedPlayerForTurn(players, 3)).toBe('alice');
    expect(getAssignedPlayerForTurn(players, 4)).toBe('bob');
  });

  it('calculates turn phase by index parity', () => {
    expect(getTurnPhase(0)).toBe('DESCRIBE');
    expect(getTurnPhase(1)).toBe('DRAW');
    expect(getTurnPhase(2)).toBe('DESCRIBE');
    expect(getTurnPhase(3)).toBe('DRAW');
  });

  it('computes total turns per chain as 2N - 1', () => {
    expect(getTotalTurnsPerChain(3)).toBe(5);
    expect(getTotalTurnsPerChain(4)).toBe(7);
    expect(getTotalTurnsPerChain(5)).toBe(9);
  });
});
