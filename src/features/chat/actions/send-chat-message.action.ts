'use server';

import { sendChatMessageSchema } from '../schemas/chat.schemas';
import { chatService } from '../services/chat.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { ChatMessageDto, SendChatMessageInput } from '../types/chat.types';

export async function sendChatMessageAction(
  input: SendChatMessageInput
): Promise<ActionResult<{ message: ChatMessageDto }>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = sendChatMessageSchema.parse(input);
    const ctx = await getAuthContext(validated.roomCode);
    const result = await chatService.sendChatMessage(
      validated.roomCode,
      validated.text,
      ctx,
      correlationId
    );

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return {
      success: true,
      data: { message: result.value },
      correlationId,
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
