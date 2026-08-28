import { describe, it, expect } from 'vitest';
import { evaluateCanStartGame, isRoomFull, type RoomParticipantSummary } from './room-rules';

describe('Room Rules Evaluation', () => {
  it('evaluates ready start condition correctly when 3 players ready', () => {
    const participants: RoomParticipantSummary[] = [
      { playerId: 'p1', isReady: true, role: 'HOST' },
      { playerId: 'p2', isReady: true, role: 'PLAYER' },
      { playerId: 'p3', isReady: true, role: 'PLAYER' },
    ];

    const evalResult = evaluateCanStartGame(participants);
    expect(evalResult.canStart).toBe(true);
    expect(evalResult.reasons).toHaveLength(0);
  });

  it('rejects start when fewer than min players', () => {
    const participants: RoomParticipantSummary[] = [
      { playerId: 'p1', isReady: true, role: 'HOST' },
      { playerId: 'p2', isReady: true, role: 'PLAYER' },
    ];

    const evalResult = evaluateCanStartGame(participants);
    expect(evalResult.canStart).toBe(false);
    expect(evalResult.reasons[0]).toContain('Need at least 3 players');
  });

  it('rejects start when a player is not ready', () => {
    const participants: RoomParticipantSummary[] = [
      { playerId: 'p1', isReady: true, role: 'HOST' },
      { playerId: 'p2', isReady: true, role: 'PLAYER' },
      { playerId: 'p3', isReady: false, role: 'PLAYER' },
    ];

    const evalResult = evaluateCanStartGame(participants);
    expect(evalResult.canStart).toBe(false);
    expect(evalResult.reasons[0]).toContain('1 player is not ready yet');
  });

  it('checks room capacity', () => {
    expect(isRoomFull(8, 8)).toBe(true);
    expect(isRoomFull(4, 8)).toBe(false);
  });
});
