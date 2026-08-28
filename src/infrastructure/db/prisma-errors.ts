import { Prisma } from '@prisma/client';
import {
  AppError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
} from '@/shared/lib/errors/app-error';

export function mapPrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return new NotFoundError('NOT_FOUND', 'Record not found');
    }
    if (error.code === 'P2002') {
      return new ConflictError('DUPLICATE_ENTRY', 'A record with this value already exists');
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new ExternalServiceError('Database connection initialization failed');
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new ExternalServiceError('Database engine panic');
  }

  return new ExternalServiceError('Database operation failed');
}
