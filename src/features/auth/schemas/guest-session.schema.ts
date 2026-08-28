import { z } from 'zod';
import { displayNameSchema, roomCodeSchema, objectIdSchema } from '@/shared/lib/validation/schemas';

export const guestSessionSchema = z
  .object({
    displayName: displayNameSchema,
    roomCode: roomCodeSchema.optional(),
    roomId: objectIdSchema.optional(),
  })
  .refine((d) => d.roomCode || d.roomId, {
    message: 'Either roomCode or roomId is required.',
  });

export type GuestSessionInput = z.infer<typeof guestSessionSchema>;
