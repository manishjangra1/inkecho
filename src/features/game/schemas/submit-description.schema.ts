import { z } from 'zod';
import { roomCodeSchema, objectIdSchema } from '@/shared/lib/validation/schemas';
import { GAME_CONFIG } from '@/shared/config/game.config';

export const submitDescriptionSchema = z.object({
  roomCode: roomCodeSchema,
  roomId: objectIdSchema,
  text: z
    .string()
    .trim()
    .min(1, { message: 'Description cannot be empty.' })
    .max(GAME_CONFIG.MAX_DESCRIPTION_LENGTH, {
      message: `Description must not exceed ${GAME_CONFIG.MAX_DESCRIPTION_LENGTH} characters.`,
    }),
  expectedVersion: z.number().int().positive({
    message: 'expectedVersion must be a positive integer.',
  }),
});

export type SubmitDescriptionSchema = z.infer<typeof submitDescriptionSchema>;
