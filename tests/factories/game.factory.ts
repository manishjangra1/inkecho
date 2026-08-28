export function createMockGame(
  roomId: string,
  playerIds: string[] = ['p1', 'p2', 'p3'],
  overrides = {}
) {
  return {
    id: `game_${Math.random().toString(36).substring(2, 9)}`,
    roomId,
    status: 'IN_PROGRESS' as const,
    version: 1,
    currentRoundIndex: 0,
    currentChainIndex: 0,
    currentTurnIndex: 0,
    turnPhase: 'DESCRIBE' as const,
    turnStartedAt: new Date(),
    turnEndsAt: new Date(Date.now() + 60000),
    activePlayerId: playerIds[0] || 'p1',
    chains: [
      {
        chainIndex: 0,
        starterPrompt: 'A funny robot dancing',
        turns: [],
      },
    ],
    playerOrder: playerIds,
    revealChainIndex: 0,
    revealStepIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
