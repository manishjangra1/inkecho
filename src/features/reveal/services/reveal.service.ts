import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { gameRepository } from '@/infrastructure/db/repositories/game.repository';
import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { gameHistoryRepository } from '@/infrastructure/db/repositories/game-history.repository';
import { userStatsRepository } from '@/infrastructure/db/repositories/user-stats.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  type AppError,
} from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import type {
  RevealDataResponse,
  RevealChainItem,
  RevealStepItem,
  VoteChainInput,
  VoteChainResponse,
  RematchInput,
  RematchResponse,
} from '../types/reveal.types';

export class RevealService {
  /**
   * Retrieves full reveal dataset for room and game playback.
   */
  async getRevealData(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<RevealDataResponse, AppError>> {
    const roomRes = await roomRepository.findByCode(roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);
    if (!gameRes.ok || !gameRes.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game session not found.'));
    }

    const game = gameRes.value;
    const participantsRes = await participantRepository.findByRoomId(room.id);
    const participants = participantsRes.ok ? participantsRes.value : [];

    const playerMap = new Map<string, string>();
    for (const p of participants) {
      playerMap.set(p.playerId, p.displayName);
    }

    // Build reveal chains with complete step-by-step history
    const chains: RevealChainItem[] = game.chains.map((chain) => {
      const steps: RevealStepItem[] = [];

      // Step 0: Starter prompt
      const firstTurnAuthorId = game.playerOrder[0] || 'host';
      steps.push({
        id: `prompt_${chain.chainIndex}`,
        stepIndex: 0,
        type: 'STARTER_PROMPT',
        authorPlayerId: firstTurnAuthorId,
        authorDisplayName: 'Original Prompt',
        textContent: chain.starterPrompt,
      });

      // Step 1..N: Submitted turns
      chain.turns.forEach((turn, idx) => {
        steps.push({
          id: turn.id || `turn_${chain.chainIndex}_${turn.turnIndex}`,
          stepIndex: idx + 1,
          type: turn.phase === 'DRAW' ? 'DRAWING' : 'DESCRIPTION',
          authorPlayerId: turn.playerId,
          authorDisplayName: playerMap.get(turn.playerId) || `Player ${turn.turnIndex + 1}`,
          textContent: turn.textContent,
          drawingUrl: turn.drawingUrl,
          skipped: turn.skipped,
        });
      });

      return {
        chainIndex: chain.chainIndex,
        starterPrompt: chain.starterPrompt,
        steps,
        totalSteps: steps.length,
      };
    });

    const votes = game.votes?.counts || {};
    const winningChainIndex = this.calculateWinningChain(votes, chains.length);

    const isHost =
      ctx.type !== 'anonymous' && (ctx.playerId === room.hostPlayerId || ctx.role === 'HOST');
    const isSpectator = ctx.type === 'guest' && ctx.role === 'SPECTATOR';

    return ok({
      gameId: game.id,
      roomId: room.id,
      roomCode: room.code,
      status: game.status === 'COMPLETED' ? 'COMPLETED' : 'REVEAL',
      chains,
      votes,
      winningChainIndex,
      isHost,
      isSpectator,
      currentChainIndex: game.revealChainIndex ?? 0,
      currentStepIndex: game.revealStepIndex ?? 0,
    });
  }

  /**
   * Casts a vote for a favorite chain during reveal.
   */
  async voteChain(
    dto: VoteChainInput,
    ctx: AuthContext
  ): Promise<Result<VoteChainResponse, AppError>> {
    if (ctx.type === 'anonymous') {
      return err(new ForbiddenError('NOT_IN_ROOM', 'Must be a player in the room to vote.'));
    }

    const roomRes = await roomRepository.findByCode(dto.roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);
    if (!gameRes.ok || !gameRes.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game session not found.'));
    }

    const game = gameRes.value;
    if (game.status !== 'REVEAL' && game.status !== 'COMPLETED') {
      return err(
        new ConflictError('INVALID_STATE', 'Voting is only allowed during the reveal phase.')
      );
    }

    if (dto.chainIndex < 0 || dto.chainIndex >= game.chains.length) {
      return err(new ConflictError('INVALID_CHAIN_INDEX', 'Invalid chain index.'));
    }

    const currentVotes: Record<string, number> = { ...(game.votes?.counts || {}) };
    const chainKey = String(dto.chainIndex);
    currentVotes[chainKey] = (currentVotes[chainKey] || 0) + 1;

    // Save updated votes to Game document
    const updateRes = await gameRepository.update(game.id, {
      votes: {
        set: {
          counts: currentVotes,
        },
      },
    });

    if (!updateRes.ok) {
      return err(updateRes.error);
    }

    const winningChainIndex = this.calculateWinningChain(currentVotes, game.chains.length);

    // Broadcast updated votes to all players in realtime
    await eventPublisher.revealVotesUpdated(
      room.id,
      currentVotes,
      winningChainIndex,
      dto.correlationId
    );

    return ok({
      votes: currentVotes,
      winningChainIndex,
    });
  }

  /**
   * Resets room to LOBBY for a rematch (Host only).
   */
  async rematch(dto: RematchInput, ctx: AuthContext): Promise<Result<RematchResponse, AppError>> {
    authorize(ctx, 'room:settings');

    const roomRes = await roomRepository.findByCode(dto.roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);

    if (gameRes.ok && gameRes.value) {
      const game = gameRes.value;

      // 1. Mark active game completed
      await gameRepository.update(game.id, {
        status: 'COMPLETED',
        completedAt: new Date(),
      });

      // 2. Compute winning chain
      const votes = game.votes?.counts || {};
      const winningChainIndex = this.calculateWinningChain(votes, game.chains.length);

      // 3. Save GameHistory and update stats for registered players
      const participantsRes = await participantRepository.findByRoomId(room.id);
      if (participantsRes.ok) {
        for (const p of participantsRes.value) {
          if (p.userId) {
            const isWinner = winningChainIndex !== null && winningChainIndex === 0; // or participating chain

            await gameHistoryRepository.create({
              gameId: game.id,
              roomId: room.id,
              roomCode: room.code,
              userId: p.userId,
              playerId: p.playerId,
              chainsPlayed: game.chains.length,
              wonVote: isWinner,
            });

            await userStatsRepository.incrementStats(p.userId, {
              gamesPlayed: 1,
              gamesWon: isWinner ? 1 : 0,
              chainsCompleted: game.chains.length,
              turnsSubmitted: game.chains.length,
            });
          }
        }
      }
    }

    // 4. Reset room status to LOBBY and reset participant readiness
    await roomRepository.updateStatus(room.code, 'LOBBY');
    await participantRepository.resetAllReady(room.id);

    // 5. Broadcast returned_to_lobby
    await eventPublisher.returnedToLobby(room.id);

    return ok({ roomStatus: 'LOBBY' });
  }

  private calculateWinningChain(votes: Record<string, number>, totalChains: number): number | null {
    let maxVotes = 0;
    let winner: number | null = null;

    for (let i = 0; i < totalChains; i++) {
      const count = votes[String(i)] || 0;
      if (count > maxVotes) {
        maxVotes = count;
        winner = i;
      }
    }

    return winner;
  }
}

export const revealService = new RevealService();
