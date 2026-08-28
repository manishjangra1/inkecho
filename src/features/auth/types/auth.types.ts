export interface GuestSessionResponse {
  readonly guestSessionId: string;
  readonly playerId: string;
  readonly roomId: string;
  readonly roomCode: string;
  readonly displayName: string;
  readonly token: string;
  readonly expiresAt: string;
}
