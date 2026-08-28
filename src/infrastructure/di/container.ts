import { prisma } from '../db/prisma.client';
import { logger } from '../monitoring/logger';
import { roomRepository } from '../db/repositories/room.repository';
import { participantRepository } from '../db/repositories/participant.repository';
import { guestSessionRepository } from '../db/repositories/guest-session.repository';
import { userRepository } from '../db/repositories/user.repository';
import { gameRepository } from '../db/repositories/game.repository';
import { promptPoolRepository } from '../db/repositories/prompt-pool.repository';
import { eventPublisher } from '../realtime/event-publisher';
import { ablyTokenService } from '../realtime/ably-token.service';

export interface ServiceContainer {
  readonly prisma: typeof prisma;
  readonly logger: typeof logger;
  readonly roomRepository: typeof roomRepository;
  readonly participantRepository: typeof participantRepository;
  readonly guestSessionRepository: typeof guestSessionRepository;
  readonly userRepository: typeof userRepository;
  readonly gameRepository: typeof gameRepository;
  readonly promptPoolRepository: typeof promptPoolRepository;
  readonly eventPublisher: typeof eventPublisher;
  readonly ablyTokenService: typeof ablyTokenService;
}

export function createContainer(): ServiceContainer {
  return {
    prisma,
    logger,
    roomRepository,
    participantRepository,
    guestSessionRepository,
    userRepository,
    gameRepository,
    promptPoolRepository,
    eventPublisher,
    ablyTokenService,
  };
}

export const container = createContainer();
