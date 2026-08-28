import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from './next-auth.config';
import { verifyGuestToken, GUEST_COOKIE_NAME, getGuestCookieName } from './guest-jwt';
import { prisma } from '../db/prisma.client';
import { UnauthorizedError, ForbiddenError } from '@/shared/lib/errors/app-error';
import type { AuthContext } from '@/shared/lib/auth/authorize';

/**
 * Resolves current request identity: Guest, Registered User, or Anonymous.
 * @param roomCode Optional room code to look up a room-specific cookie first.
 */
export async function getAuthContext(roomCode?: string): Promise<AuthContext> {
  const cookieStore = await cookies();

  // Resolve the guest cookie: prefer room-specific, then scan ink_ps_*, then legacy
  let guestCookie: string | undefined;

  if (roomCode) {
    guestCookie = cookieStore.get(getGuestCookieName(roomCode))?.value;
  }

  if (!guestCookie) {
    // Scan for any room-specific cookie
    const allCookies = cookieStore.getAll();
    const roomCookie = allCookies.find((c) => c.name.startsWith('ink_ps_'));
    guestCookie = roomCookie?.value;
  }

  if (!guestCookie) {
    // Fallback to legacy single cookie
    guestCookie = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  }

  // 1. Check in-room guest/player session cookie
  if (guestCookie) {
    const verified = await verifyGuestToken(guestCookie);
    if (verified) {
      // Validate that the session is still active in DB
      const guestDoc = await prisma.guestSession.findUnique({
        where: { id: verified.sub },
      });

      if (guestDoc && guestDoc.expiresAt > new Date()) {
        // Touch lastSeenAt asynchronously
        prisma.guestSession
          .update({
            where: { id: verified.sub },
            data: { lastSeenAt: new Date() },
          })
          .catch(() => {});

        // Fetch actual participant role from DB for accuracy
        const participant = await prisma.roomParticipant.findUnique({
          where: {
            roomId_playerId: {
              roomId: verified.roomId,
              playerId: verified.playerId,
            },
          },
        });

        return {
          type: 'guest',
          guestSessionId: verified.sub,
          playerId: verified.playerId,
          roomId: verified.roomId,
          displayName: participant?.displayName ?? verified.displayName,
          role: (participant?.role as 'HOST' | 'PLAYER' | 'SPECTATOR') ?? verified.role,
        };
      }
    }
  }

  // 2. Check registered NextAuth session
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      });

      if (user && !user.deletedAt) {
        return {
          type: 'registered',
          userId: user.id,
          displayName: user.name || user.email || 'Player',
          userRole: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
        };
      }
    }
  } catch {
    // Session retrieval error - fallback to anonymous
  }

  return { type: 'anonymous' };
}

/**
 * Enforces that caller has a valid active player session in a room.
 */
export async function requirePlayerSession(expectedRoomId?: string) {
  const ctx = await getAuthContext();

  if (ctx.type !== 'guest') {
    throw new UnauthorizedError('Valid player session required.');
  }

  if (expectedRoomId && ctx.roomId !== expectedRoomId) {
    throw new ForbiddenError('ROOM_MISMATCH', 'Session does not match this room.');
  }

  return ctx;
}

/**
 * Enforces that caller is a registered user.
 */
export async function requireRegisteredUser() {
  const ctx = await getAuthContext();

  if (ctx.type !== 'registered') {
    throw new UnauthorizedError('Registered account required.');
  }

  await assertNotBanned(ctx.userId);
  return ctx;
}

/**
 * Enforces that caller has admin role.
 */
export async function requireAdmin() {
  const ctx = await requireRegisteredUser();

  if (ctx.userRole !== 'ADMIN') {
    throw new ForbiddenError('ADMIN_ONLY', 'Administrator privileges required.');
  }

  return ctx;
}

/**
 * Verifies that user is not banned (temporarily or permanently).
 */
export async function assertNotBanned(userId?: string): Promise<void> {
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bannedPermanently: true, bannedUntil: true },
  });

  if (!user) return;

  if (user.bannedPermanently) {
    throw new ForbiddenError('BANNED', 'This account has been permanently suspended.');
  }

  if (user.bannedUntil && user.bannedUntil > new Date()) {
    throw new ForbiddenError(
      'BANNED',
      `This account is suspended until ${user.bannedUntil.toISOString()}.`
    );
  }
}
