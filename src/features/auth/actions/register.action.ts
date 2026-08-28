'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/infrastructure/db/prisma.client';
import { registerSchema, type RegisterInput } from '../schemas/register.schema';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { ConflictError } from '@/shared/lib/errors/app-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';

export interface RegisterResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
}

export async function registerAction(
  input: RegisterInput
): Promise<ActionResult<RegisterResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = registerSchema.parse(input);
    const email = parsed.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('EMAIL_EXISTS', 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.name.trim(),
        email,
        password: hashedPassword,
        emailVerified: new Date(), // No email verification required
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email ?? email,
        name: user.name ?? parsed.name,
      },
      correlationId,
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
