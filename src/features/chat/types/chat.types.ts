export type ChatSenderRole = 'HOST' | 'PLAYER' | 'SPECTATOR' | 'SYSTEM';

export interface ChatMessageDto {
  readonly id: string;
  readonly roomId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly text: string;
  readonly role: ChatSenderRole;
  readonly isSystem?: boolean;
  readonly timestamp: string; // ISO string
}

export interface SendChatMessageInput {
  readonly roomCode: string;
  readonly text: string;
}

export interface SendChatMessageResponse {
  readonly message: ChatMessageDto;
}
