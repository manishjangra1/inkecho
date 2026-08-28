import { z } from 'zod';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';

export const rematchSchema = z.object({
  roomCode: roomCodeSchema,
});

export type RematchInput = z.infer<typeof rematchSchema>;
