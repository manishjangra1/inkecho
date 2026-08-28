import { describe, it, expect } from 'vitest';
import { transitionGame, type GameEntity } from './game-transitions';

describe('Game Transitions', () => {
  const initialGame: GameEntity = {
    id: 'game123',
    roomId: 'room123',
    status: 'IN_PROGRESS',
    version: 1,
    currentRoundIndex: 0,
    currentChainIndex: 0,
    currentTurnIndex: 0,
    turnPhase: 'DESCRIBE',
    turnStartedAt: new Date('2026-08-28T10:00:00.000Z'),
    turnEndsAt: new Date('2026-08-28T10:01:00.000Z'),
    activePlayerId: 'p1',
    playerOrder: ['p1', 'p2', 'p3'],
    chains: [
      {
        chainIndex: 0,
        starterPrompt: 'A dancing duck',
        turns: [
          {
            id: '0_0',
            turnIndex: 0,
            playerId: 'p1',
            phase: 'DESCRIBE',
            textContent: null,
            drawingUrl: null,
            drawingPublicId: null,
            submittedAt: null,
            skipped: false,
            autoSubmitted: false,
          },
        ],
      },
    ],
    revealChainIndex: 0,
    revealStepIndex: 0,
    createdAt: new Date('2026-08-28T10:00:00.000Z'),
    updatedAt: new Date('2026-08-28T10:00:00.000Z'),
  };

  it('handles SUBMIT_DESCRIPTION and advances to next DRAW turn', () => {
    const res = transitionGame(initialGame, {
      type: 'SUBMIT_DESCRIPTION',
      playerId: 'p1',
      textContent: 'A duck doing disco dancing',
      describeTimerSec: 60,
      drawTimerSec: 90,
      submittedAt: new Date('2026-08-28T10:00:30.000Z'),
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const nextState = res.value;
    expect(nextState.currentTurnIndex).toBe(1);
    expect(nextState.turnPhase).toBe('DRAW');
    expect(nextState.activePlayerId).toBe('p2');
    expect(nextState.chains[0]!.turns[0]!.textContent).toBe('A duck doing disco dancing');
  });

  it('rejects description submission from non-active player', () => {
    const res = transitionGame(initialGame, {
      type: 'SUBMIT_DESCRIPTION',
      playerId: 'p2',
      textContent: 'Hacked submit',
      describeTimerSec: 60,
      drawTimerSec: 90,
    });

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_YOUR_TURN');
  });

  it('pauses and resumes game properly', () => {
    const pauseRes = transitionGame(initialGame, {
      type: 'PAUSE',
      pausedAt: new Date('2026-08-28T10:00:45.000Z'),
    });

    expect(pauseRes.ok).toBe(true);
    if (!pauseRes.ok) return;
    expect(pauseRes.value.status).toBe('PAUSED');
    expect(pauseRes.value.pauseRemainingMs).toBe(15000);

    const resumeRes = transitionGame(pauseRes.value, {
      type: 'RESUME',
      resumedAt: new Date('2026-08-28T10:05:00.000Z'),
    });

    expect(resumeRes.ok).toBe(true);
    if (!resumeRes.ok) return;
    expect(resumeRes.value.status).toBe('IN_PROGRESS');
    expect(resumeRes.value.turnEndsAt.getTime()).toBe(
      new Date('2026-08-28T10:05:15.000Z').getTime()
    );
  });
});
