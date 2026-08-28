import { z } from 'zod';
import { roomCodeSchema, roomSettingsSchema } from '@/shared/lib/validation/schemas';

export const updateRoomSettingsSchema = z.object({
  roomCode: roomCodeSchema,
  settings: roomSettingsSchema.partial(),
});

export type UpdateRoomSettingsInput = z.infer<typeof updateRoomSettingsSchema>;
