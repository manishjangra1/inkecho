import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from './profile.service';
import { userRepository } from '@/infrastructure/db/repositories/user.repository';
import { userStatsRepository } from '@/infrastructure/db/repositories/user-stats.repository';
import { gameHistoryRepository } from '@/infrastructure/db/repositories/game-history.repository';
import { ok } from '@/domain/shared/result';
import type { AuthContext } from '@/shared/lib/auth/authorize';

vi.mock('@/infrastructure/db/repositories/user.repository');
vi.mock('@/infrastructure/db/repositories/user-stats.repository');
vi.mock('@/infrastructure/db/repositories/game-history.repository');

describe('ProfileService', () => {
  const registeredContext: AuthContext = {
    type: 'registered',
    userId: 'user-123',
    displayName: 'PainterPro',
    userRole: 'USER',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(userRepository.findById).mockResolvedValue(
      ok({
        id: 'user-123',
        name: 'PainterPro',
        email: 'painter@test.com',
        image: 'https://avatar.png',
        role: 'USER',
        createdAt: new Date().toISOString(),
      })
    );

    vi.mocked(userStatsRepository.findByUserId).mockResolvedValue(
      ok({
        id: 'stats-123',
        userId: 'user-123',
        gamesPlayed: 10,
        gamesWon: 5,
        chainsCompleted: 25,
        turnsSubmitted: 40,
        updatedAt: new Date().toISOString(),
      })
    );

    vi.mocked(userStatsRepository.getAchievements).mockResolvedValue(
      ok([
        {
          id: 'ach-1',
          code: 'FIRST_WIN',
          name: 'First Victory',
          description: 'Won your first community game',
          iconUrl: null,
          unlockedAt: new Date().toISOString(),
        },
      ])
    );
  });

  it('retrieves user profile and stats for registered user', async () => {
    const res = await profileService.getProfile(registeredContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.user.name).toBe('PainterPro');
      expect(res.value.stats.gamesPlayed).toBe(10);
      expect(res.value.achievements).toHaveLength(1);
    }
  });

  it('updates profile name and image', async () => {
    vi.mocked(userRepository.updateProfile).mockResolvedValue(
      ok({
        id: 'user-123',
        name: 'MasterArtist',
        email: 'painter@test.com',
        image: 'https://new-avatar.png',
        role: 'USER',
        createdAt: new Date().toISOString(),
      })
    );

    const res = await profileService.updateProfile(
      { name: 'MasterArtist', image: 'https://new-avatar.png' },
      registeredContext
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.name).toBe('MasterArtist');
    }
    expect(userRepository.updateProfile).toHaveBeenCalledWith('user-123', {
      name: 'MasterArtist',
      image: 'https://new-avatar.png',
    });
  });

  it('fetches paginated game history', async () => {
    vi.mocked(gameHistoryRepository.findByUserId).mockResolvedValue(
      ok({
        items: [
          {
            id: 'hist-1',
            gameId: 'game-1',
            roomId: 'room-1',
            roomCode: 'ABC123',
            userId: 'user-123',
            playerId: 'player-1',
            placement: 1,
            chainsPlayed: 3,
            wonVote: true,
            playedAt: new Date().toISOString(),
            snapshotUrl: null,
          },
        ],
        total: 1,
        totalPages: 1,
      })
    );

    const res = await profileService.getGameHistory(1, 10, registeredContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.items).toHaveLength(1);
      expect(res.value.items[0]?.roomCode).toBe('ABC123');
    }
  });
});
