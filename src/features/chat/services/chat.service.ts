import { ok, err, type Result } from '@/domain/shared/result';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import {
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
} from '@/shared/lib/errors/app-error';
import { CHAT_CONFIG } from '../schemas/chat.schemas';
import type { AuthContext } from '@/shared/lib/auth/authorize';
import type { ChatMessageDto, ChatSenderRole } from '../types/chat.types';

// In-memory sliding rate limiter per player (no DB overhead)
const recentMessageTimestamps = new Map<string, number[]>();

// Basic profanity wordlist for filtering when enabled in room settings
const PROFANITY_REGEX =
  /\b(fuck|shit|bitch|asshole|bastard|cunt|dick|pussy|fag|slut|whore)\b/gi;

function filterProfanity(text: string): string {
  return text.replace(PROFANITY_REGEX, (match) => '*'.repeat(match.length));
}

export class ChatService {
  /**
   * Reset rate limits (useful for testing)
   */
  public clearRateLimits(): void {
    recentMessageTimestamps.clear();
  }

  /**
   * Ephemerally sends a chat message across an active room via Ably.
   * This is NOT stored in the database.
   */
  async sendChatMessage(
    roomCode: string,
    rawText: string,
    ctx: AuthContext,
    correlationId?: string
  ): Promise<Result<ChatMessageDto>> {
    // 1. Validate Auth Context
    if (ctx.type === 'anonymous') {
      return err(new UnauthorizedError('You must be in the room to send messages.'));
    }

    const senderId =
      ctx.type === 'guest'
        ? ctx.playerId
        : ctx.type === 'registered'
        ? ctx.userId
        : 'unknown_player';

    const senderName = ctx.displayName || 'Player';

    // 2. Rate Limiting Check
    const now = Date.now();
    const timestamps = recentMessageTimestamps.get(senderId) || [];
    const windowStart = now - CHAT_CONFIG.RATE_LIMIT_WINDOW_MS;
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= CHAT_CONFIG.MAX_MESSAGES_PER_WINDOW) {
      return err(
        new RateLimitError('You are sending messages too quickly. Please slow down.')
      );
    }

    activeTimestamps.push(now);
    recentMessageTimestamps.set(senderId, activeTimestamps);

    // 3. Find Room
    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;
    if (room.status === 'CLOSED') {
      return err(new NotFoundError('ROOM_CLOSED', 'Room is closed.'));
    }

    // 4. Determine Sender Role
    let role: ChatSenderRole = 'PLAYER';
    const participant = room.participants.find((p) => p.playerId === senderId);

    if (participant) {
      role = participant.role === 'HOST' ? 'HOST' : participant.role === 'SPECTATOR' ? 'SPECTATOR' : 'PLAYER';
    } else if (ctx.type === 'guest' && ctx.role) {
      role = ctx.role === 'HOST' ? 'HOST' : ctx.role === 'SPECTATOR' ? 'SPECTATOR' : 'PLAYER';
    }

    // 5. Profanity Filtering (if room settings enable it)
    let processedText = rawText.trim();
    if (room.settings.profanityFilter) {
      processedText = filterProfanity(processedText);
    }

    // 6. Build Ephemeral Chat Message DTO
    const messageDto: ChatMessageDto = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      roomId: room.id,
      senderId,
      senderName,
      text: processedText,
      role,
      isSystem: false,
      timestamp: new Date().toISOString(),
    };

    // 7. Publish to Ably Realtime (zero DB writes)
    await eventPublisher.chatMessage(room.id, messageDto, correlationId);

    return ok(messageDto);
  }
}

export const chatService = new ChatService();
