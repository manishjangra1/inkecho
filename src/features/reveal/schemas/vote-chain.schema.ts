import { z } from 'zod';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';

export const voteChainSchema = z.object({
  roomCode: roomCodeSchema,
  chainIndex: z.number().int().min(0, { message: 'Chain index must be non-negative.' }),
});

export type VoteChainInput = z.infer<typeof voteChainSchema>;
