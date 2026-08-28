/**
 * Channel Naming Utilities
 * Reference: docs/phase-5/01-realtime-architecture-overview.md
 */

export function getRoomChannelName(roomId: string): string {
  return `room:${roomId}`;
}
