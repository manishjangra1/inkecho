import { z } from 'zod';
import { objectIdSchema } from '@/shared/lib/validation/schemas';

export const banUserSchema = z.object({
  userId: objectIdSchema,
  permanent: z.boolean().default(false),
  durationHours: z.number().int().positive().optional(),
  reason: z.string().min(1, { message: 'Ban reason is required.' }).max(500),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
