import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
