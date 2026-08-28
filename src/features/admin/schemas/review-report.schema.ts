import { z } from 'zod';
import { objectIdSchema } from '@/shared/lib/validation/schemas';

export const reviewReportSchema = z.object({
  reportId: objectIdSchema,
  status: z.enum(['REVIEWED', 'DISMISSED']),
  action: z.enum(['DISMISS', 'BAN_USER']).optional(),
  banDurationHours: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
