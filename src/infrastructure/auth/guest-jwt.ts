import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/shared/config/env';

export interface GuestJwtPayload {
  readonly sub: string; // guestSessionId
  readonly jti: string; // token id
  readonly playerId: string;
  readonly roomId: string;
  readonly displayName: string;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly userId?: string;
}

export const GUEST_COOKIE_NAME = 'ink_player_session';

function getSecretKey(): Uint8Array {
  return new Uint8Array(Buffer.from(env.GUEST_SESSION_SECRET, 'utf-8'));
}

/**
 * Signs a guest JWT token with configured expiry (e.g. 24h).
 */
export async function signGuestToken(payload: GuestJwtPayload): Promise<string> {
  const secret = getSecretKey();
  const ttlHours = env.GUEST_SESSION_TTL_HOURS || 24;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlHours}h`)
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .sign(secret);
}

/**
 * Verifies a guest JWT token signature and expiry.
 */
export async function verifyGuestToken(token: string): Promise<GuestJwtPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.jti !== 'string' ||
      typeof payload['playerId'] !== 'string' ||
      typeof payload['roomId'] !== 'string' ||
      typeof payload['displayName'] !== 'string'
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      jti: payload.jti,
      playerId: payload['playerId'] as string,
      roomId: payload['roomId'] as string,
      displayName: payload['displayName'] as string,
      role: (payload['role'] as 'HOST' | 'PLAYER' | 'SPECTATOR') || 'PLAYER',
      userId: payload['userId'] as string | undefined,
    };
  } catch {
    return null;
  }
}
