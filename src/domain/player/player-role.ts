export const PARTICIPANT_ROLE = {
  HOST: 'HOST',
  PLAYER: 'PLAYER',
  SPECTATOR: 'SPECTATOR',
} as const;

export type ParticipantRole = (typeof PARTICIPANT_ROLE)[keyof typeof PARTICIPANT_ROLE];

export const CONNECTION_STATUS = {
  ONLINE: 'ONLINE',
  RECONNECTING: 'RECONNECTING',
  OFFLINE: 'OFFLINE',
} as const;

export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export function isHost(role: ParticipantRole): boolean {
  return role === PARTICIPANT_ROLE.HOST;
}

export function isPlayer(role: ParticipantRole): boolean {
  return role === PARTICIPANT_ROLE.PLAYER || role === PARTICIPANT_ROLE.HOST;
}

export function isSpectator(role: ParticipantRole): boolean {
  return role === PARTICIPANT_ROLE.SPECTATOR;
}
