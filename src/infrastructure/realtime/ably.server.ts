import * as Ably from 'ably';
import { env } from '@/shared/config/env';
import { logger } from '../monitoring/logger';

class AblyServerManager {
  private static instance: Ably.Rest | null = null;

  public static getClient(): Ably.Rest | null {
    if (this.instance) {
      return this.instance;
    }

    const apiKey = env.ABLY_API_KEY;
    if (!apiKey || apiKey === 'dummy:dummy' || !apiKey.includes(':')) {
      logger.warn(
        { apiKey: apiKey ? 'configured (dummy)' : 'missing' },
        'Ably API Key is not configured with live credentials. Realtime events will run in mock/silent mode.'
      );
      return null;
    }

    try {
      this.instance = new Ably.Rest({ key: apiKey });
      return this.instance;
    } catch (err) {
      logger.error({ err }, 'Failed to initialize Ably REST client.');
      return null;
    }
  }
}

export const getAblyServerClient = () => AblyServerManager.getClient();
