export interface RevealStepItem {
  readonly id: string;
  readonly stepIndex: number;
  readonly type: 'STARTER_PROMPT' | 'DESCRIPTION' | 'DRAWING';
  readonly authorPlayerId: string;
  readonly authorDisplayName: string;
  readonly textContent?: string | null;
  readonly drawingUrl?: string | null;
  readonly skipped?: boolean;
}

export interface RevealChainItem {
  readonly chainIndex: number;
  readonly starterPrompt: string;
  readonly steps: readonly RevealStepItem[];
  readonly totalSteps: number;
}

export interface RevealDataResponse {
  readonly gameId: string;
  readonly roomId: string;
  readonly roomCode: string;
  readonly status: 'REVEAL' | 'COMPLETED';
  readonly chains: readonly RevealChainItem[];
  readonly votes: Record<string, number>;
  readonly winningChainIndex: number | null;
  readonly isHost: boolean;
  readonly isSpectator: boolean;
  readonly currentChainIndex: number;
  readonly currentStepIndex: number;
}

export interface VoteChainInput {
  readonly roomCode: string;
  readonly chainIndex: number;
}

export interface VoteChainResponse {
  readonly votes: Record<string, number>;
  readonly winningChainIndex: number | null;
}

export interface RematchInput {
  readonly roomCode: string;
}

export interface RematchResponse {
  readonly roomStatus: 'LOBBY';
}
