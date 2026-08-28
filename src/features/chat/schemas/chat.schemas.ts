import { z } from 'zod';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';

export const CHAT_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 300,
  RATE_LIMIT_WINDOW_MS: 3000,
  MAX_MESSAGES_PER_WINDOW: 5,
} as const;

export const sendChatMessageSchema = z.object({
  roomCode: roomCodeSchema,
  text: z
    .string()
    .trim()
    .min(CHAT_CONFIG.MIN_LENGTH, { message: 'Message cannot be empty.' })
    .max(CHAT_CONFIG.MAX_LENGTH, {
      message: `Message cannot exceed ${CHAT_CONFIG.MAX_LENGTH} characters.`,
    }),
});

export type SendChatMessageInputParsed = z.infer<typeof sendChatMessageSchema>;
