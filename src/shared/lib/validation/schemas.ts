import { z } from 'zod';
import { ROOM_CONFIG } from '@/shared/config/room.config';

export const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(ROOM_CONFIG.ROOM_CODE_LENGTH, {
    message: `Room code must be exactly ${ROOM_CONFIG.ROOM_CODE_LENGTH} characters.`,
  })
  .regex(/^[A-Z0-9]+$/, { message: 'Room code must contain uppercase letters and numbers only.' });

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId format.' });

export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format.' });

export const displayNameSchema = z
  .string()
  .trim()
  .min(ROOM_CONFIG.DISPLAY_NAME_MIN_LENGTH, {
    message: `Display name must be at least ${ROOM_CONFIG.DISPLAY_NAME_MIN_LENGTH} characters.`,
  })
  .max(ROOM_CONFIG.DISPLAY_NAME_MAX_LENGTH, {
    message: `Display name must not exceed ${ROOM_CONFIG.DISPLAY_NAME_MAX_LENGTH} characters.`,
  })
  .regex(/^[\w\s-]+$/, {
    message: 'Display name can only contain letters, numbers, spaces, underscores, and hyphens.',
  });

export const roomSettingsSchema = z.object({
  maxPlayers: z
    .number()
    .int()
    .min(ROOM_CONFIG.MIN_PLAYERS)
    .max(ROOM_CONFIG.MAX_PLAYERS)
    .default(ROOM_CONFIG.DEFAULT_MAX_PLAYERS),
  minPlayers: z.number().int().min(ROOM_CONFIG.MIN_PLAYERS).default(ROOM_CONFIG.MIN_PLAYERS),
  roundCount: z.number().int().min(1).max(ROOM_CONFIG.MAX_ROUNDS).default(ROOM_CONFIG.DEFAULT_ROUNDS),
  describeTimerSec: z.number().int().min(30).max(120).default(60),
  drawTimerSec: z.number().int().min(60).max(180).default(90),
  profanityFilter: z.boolean().default(false),
  allowSpectators: z.boolean().default(true),
});

export type RoomSettingsInput = z.infer<typeof roomSettingsSchema>;
