export function createMockRoom(overrides = {}) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return {
    id: `room_${Math.random().toString(36).substring(2, 9)}`,
    code,
    hostPlayerId: 'host_player_1',
    visibility: 'PUBLIC' as const,
    status: 'LOBBY' as const,
    settings: {
      maxPlayers: 8,
      minPlayers: 3,
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
      profanityFilter: false,
      allowSpectators: true,
    },
    participantIds: ['host_player_1'],
    spectatorIds: [],
    kickedPlayerIds: [],
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
