import type { User as PrismaUser, Prisma } from '@prisma/client';

export type DbUser = PrismaUser | Prisma.UserGetPayload<object>;

export interface UserProfileDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly image?: string | null;
  readonly role: 'USER' | 'ADMIN';
  readonly createdAt: string;
}

export function toUserProfileDto(raw: DbUser): UserProfileDto {
  return {
    id: raw.id,
    name: raw.name ?? 'Player',
    email: raw.email ?? '',
    image: raw.image,
    role: raw.role === 'ADMIN' ? 'ADMIN' : 'USER',
    createdAt: raw.createdAt.toISOString(),
  };
}
