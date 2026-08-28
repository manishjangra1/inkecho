import { z } from 'zod';
import { displayNameSchema, roomSettingsSchema } from '@/shared/lib/validation/schemas';

export const createRoomSchema = z.object({
  displayName: displayNameSchema.optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
  settings: roomSettingsSchema.partial().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
