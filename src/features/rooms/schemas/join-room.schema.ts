import { z } from 'zod';
import { displayNameSchema, roomCodeSchema } from '@/shared/lib/validation/schemas';

export const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  displayName: displayNameSchema.optional(),
  asSpectator: z.boolean().default(false),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
