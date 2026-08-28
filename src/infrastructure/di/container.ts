/**
 * Dependency Injection Container Skeleton
 * Provides single access point for services and repositories across Server Actions and Route Handlers.
 */
import { prisma } from '../db/prisma.client';
import { logger } from '../monitoring/logger';

export interface ServiceContainer {
  readonly prisma: typeof prisma;
  readonly logger: typeof logger;
}

export function createContainer(): ServiceContainer {
  return {
    prisma,
    logger,
  };
}

export const container = createContainer();
