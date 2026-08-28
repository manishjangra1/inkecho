import { z } from 'zod';
import { objectIdSchema } from '@/shared/lib/validation/schemas';

export const createReportSchema = z.object({
  gameId: objectIdSchema,
  targetType: z.enum(['DRAWING', 'DESCRIPTION', 'USER']),
  targetId: z.string().min(1, { message: 'Target ID is required.' }),
  reason: z.enum(['NSFW', 'HARASSMENT', 'SPAM', 'OTHER']),
  notes: z.string().max(500, { message: 'Notes must not exceed 500 characters.' }).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
