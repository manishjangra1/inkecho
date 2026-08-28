import { getAblyServerClient } from './ably.server';
import { env } from '@/shared/config/env';
import { getRoomChannelName } from '@/features/realtime/lib/channel-names';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  ExternalServiceError,
  type AppError,
} from '@/shared/lib/errors/app-error';
import * as Ably from 'ably';

export class AblyTokenService {
  async createTokenRequest(
    roomId: string,
    playerId: string
  ): Promise<Result<Ably.TokenRequest, AppError>> {
    const client = getAblyServerClient();
    const channelName = getRoomChannelName(roomId);

    if (!client) {
      // In dev/mock mode when no Ably API key is provided
      const mockTokenRequest = {
        keyName: 'mock-key',
        ttl: env.ABLY_TOKEN_TTL_SECONDS * 1000,
        timestamp: Date.now(),
        capability: JSON.stringify({
          [channelName]: ['subscribe', 'presence'],
        }),
        clientId: playerId,
        nonce: Math.random().toString(36).substring(2),
        mac: 'mock-mac',
      } as unknown as Ably.TokenRequest;

      return ok(mockTokenRequest);
    }

    try {
      const capability: Record<string, string[]> = {
        [channelName]: ['subscribe', 'presence'],
      };

      const tokenRequest = await client.auth.createTokenRequest({
        clientId: playerId,
        ttl: env.ABLY_TOKEN_TTL_SECONDS * 1000,
        capability: JSON.stringify(capability),
      });

      return ok(tokenRequest);
    } catch {
      return err(
        new ExternalServiceError('Failed to generate Ably realtime token request.')
      );
    }
  }
}

export const ablyTokenService = new AblyTokenService();
