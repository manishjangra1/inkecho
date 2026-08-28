import type { ReportItemDto } from '@/infrastructure/db/repositories/report.repository';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export interface AdminReportsResponse {
  readonly items: readonly ReportItemDto[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}

export interface ReviewReportInput {
  readonly reportId: string;
  readonly status: 'REVIEWED' | 'DISMISSED';
  readonly action?: 'DISMISS' | 'BAN_USER';
  readonly banDurationHours?: number;
  readonly notes?: string;
}

export interface BanUserInput {
  readonly userId: string;
  readonly permanent: boolean;
  readonly durationHours?: number;
  readonly reason: string;
}

export interface AdminAnalyticsResponse {
  readonly totalUsers: number;
  readonly totalRooms: number;
  readonly totalGames: number;
  readonly pendingReports: number;
}

export interface AdminUsersResponse {
  readonly items: readonly UserProfileDto[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}
