import { describe, it, expect, vi } from 'vitest';
import { guestSessionService } from './guest-session.service';
import { guestSessionRepository } from '@/infrastructure/db/repositories/guest-session.repository';
import { ok } from '@/domain/shared/result';

describe('GuestSessionService', () => {
  it('creates a signed guest JWT session', async () => {
    vi.spyOn(guestSessionRepository, 'create').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d8',
        token: 'test-token-uuid',
        displayName: 'TestPlayer',
        playerId: 'player-uuid-123',
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        lastSeenAt: new Date(),
      })
    );

    const result = await guestSessionService.create({
      roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
      displayName: 'TestPlayer',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.guestSessionId).toBe('65e3a7b9c1d2e3f4a5b6c7d8');
      expect(result.value.token).toBeDefined();
      expect(typeof result.value.token).toBe('string');
    }
  });

  it('verifies a signed guest JWT token', async () => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    vi.spyOn(guestSessionRepository, 'create').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d8',
        token: 'test-token-uuid',
        displayName: 'TestPlayer',
        playerId: 'player-uuid-123',
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        expiresAt,
        createdAt: new Date(),
        lastSeenAt: new Date(),
      })
    );

    const created = await guestSessionService.create({
      roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
      displayName: 'TestPlayer',
    });

    if (!created.ok) throw new Error('Create failed');

    vi.spyOn(guestSessionRepository, 'findById').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d8',
        token: 'test-token-uuid',
        displayName: 'TestPlayer',
        playerId: 'player-uuid-123',
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        expiresAt,
        createdAt: new Date(),
        lastSeenAt: new Date(),
      })
    );

    const verified = await guestSessionService.verify(created.value.token);
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.value.displayName).toBe('TestPlayer');
      expect(verified.value.roomId).toBe('65e3a7b9c1d2e3f4a5b6c7d9');
    }
  });
});
