import { z } from 'zod';
import { displayNameSchema } from '@/shared/lib/validation/schemas';

export const updateProfileSchema = z.object({
  name: displayNameSchema.optional(),
  image: z.string().url({ message: 'Avatar must be a valid URL' }).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
