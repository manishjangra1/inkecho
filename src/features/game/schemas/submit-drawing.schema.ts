import { z } from 'zod';
import { roomCodeSchema, objectIdSchema } from '@/shared/lib/validation/schemas';

export const submitDrawingSchema = z
  .object({
    roomCode: roomCodeSchema,
    roomId: objectIdSchema,
    expectedVersion: z.number().int().positive({
      message: 'expectedVersion must be a positive integer.',
    }),
    imageBase64: z.string().optional(),
    imageDataUrl: z.string().optional(),
  })
  .refine((data) => data.imageBase64 || data.imageDataUrl, {
    message: 'Either imageBase64 or imageDataUrl must be provided.',
    path: ['imageDataUrl'],
  });

export type SubmitDrawingSchema = z.infer<typeof submitDrawingSchema>;
