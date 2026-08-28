import { z } from 'zod';
import { displayNameSchema } from '@/shared/lib/validation/schemas';

export const registerSchema = z
  .object({
    name: displayNameSchema,
    email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must include at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
