import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';
import type {
  UserStatsDto,
  UserAchievementDto,
} from '@/infrastructure/db/repositories/user-stats.repository';
import type { GameHistoryItemDto } from '@/infrastructure/db/repositories/game-history.repository';

export interface ProfileDetailsResponse {
  readonly user: UserProfileDto;
  readonly stats: UserStatsDto;
  readonly achievements: readonly UserAchievementDto[];
}

export interface UpdateProfileInput {
  readonly name?: string;
  readonly image?: string | null;
}

export interface GameHistoryResponse {
  readonly items: readonly GameHistoryItemDto[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}
