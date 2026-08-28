import { gameRepository } from '@/infrastructure/db/repositories/game.repository';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { promptPoolRepository } from '@/infrastructure/db/repositories/prompt-pool.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  type AppError,
} from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import { shufflePlayerOrder } from '@/domain/game/turn-order';
import { buildInitialChains } from '@/domain/game/chain-builder';
import { transitionGame, type GameEntity } from '@/domain/game/game-transitions';
import {
  toGameSnapshotDto,
  toTurnSnapshotDto,
  chainsToPrisma,
  type GameSnapshotDto,
} from '@/infrastructure/db/mappers/game.mapper';
import { computeTurnEndsAt, getPhaseDurationSeconds } from '@/domain/timer/timer-calculator';
import { cloudinaryService } from '@/infrastructure/storage/cloudinary.service';
import type {
  SubmitDescriptionInput,
  SubmitDescriptionResponse,
  SubmitDrawingInput,
  SubmitDrawingResponse,
  PauseGameResponse,
  ResumeGameResponse,
} from '../types/game.types';

export class GameService {
  /**
   * Creates and initializes a new game session from an active lobby.
   */
  async createAndStart(
    roomId: string,
    playerIds: readonly string[],
    settings: {
      roundCount: number;
      describeTimerSec: number;
      drawTimerSec: number;
    }
  ): Promise<Result<GameEntity, AppError>> {
    if (playerIds.length < 3) {
      return err(new ValidationError('At least 3 players are required to start a game.'));
    }

    const shuffledPlayerOrder = shufflePlayerOrder(playerIds);
    const roundCount = Math.max(1, settings.roundCount);

    // Fetch starter prompts for each round
    const starterPrompts: string[] = [];
    for (let i = 0; i < roundCount; i++) {
      const promptResult = await promptPoolRepository.randomActive();
      starterPrompts.push(promptResult.ok ? promptResult.value : `Fun Prompt ${i + 1}`);
    }

    const chains = buildInitialChains({
      playerOrder: shuffledPlayerOrder,
      roundCount,
      starterPrompts,
    });

    const now = new Date();
    const firstTurnDuration = getPhaseDurationSeconds(
      'DESCRIBE',
      settings.describeTimerSec,
      settings.drawTimerSec
    );
    const turnEndsAt = computeTurnEndsAt(now, firstTurnDuration);
    const firstPlayerId = shuffledPlayerOrder[0]!;

    const createResult = await gameRepository.create({
      roomId,
      status: 'IN_PROGRESS',
      version: 1,
      currentRoundIndex: 0,
      currentChainIndex: 0,
      currentTurnIndex: 0,
      turnPhase: 'DESCRIBE',
      turnStartedAt: now,
      turnEndsAt,
      activePlayerId: firstPlayerId,
      chains,
      playerOrder: shuffledPlayerOrder,
    });

    return createResult;
  }

  /**
   * Submits description text for the active turn.
   */
  async submitDescription(
    dto: SubmitDescriptionInput,
    ctx: AuthContext
  ): Promise<Result<SubmitDescriptionResponse, AppError>> {
    authorize(ctx, 'game:submit');

    if (ctx.type === 'anonymous' || !ctx.playerId) {
      return err(new ForbiddenError('NOT_IN_ROOM', 'Must have an active player session.'));
    }

    const activeGameResult = await gameRepository.findActiveByRoomId(dto.roomId);
    if (!activeGameResult.ok || !activeGameResult.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game session not found.'));
    }

    const game = activeGameResult.value;

    if (game.activePlayerId !== ctx.playerId) {
      return err(new ForbiddenError('NOT_YOUR_TURN', 'It is not your turn to submit.'));
    }

    const roomResult = await roomRepository.findById(dto.roomId);
    const settings = roomResult.ok
      ? roomResult.value.settings
      : { describeTimerSec: 60, drawTimerSec: 90 };

    const transitionRes = transitionGame(game, {
      type: 'SUBMIT_DESCRIPTION',
      playerId: ctx.playerId,
      textContent: dto.text,
      describeTimerSec: settings.describeTimerSec,
      drawTimerSec: settings.drawTimerSec,
    });

    if (!transitionRes.ok) {
      return err(
        new ConflictError(
          transitionRes.error.code,
          transitionRes.error.message,
          transitionRes.error.context
        )
      );
    }

    const nextGameState = transitionRes.value;

    // Optimistically update DB with expectedVersion check
    const updateResult = await gameRepository.updateWithVersion(
      game.id,
      dto.expectedVersion,
      () => ({
        currentRoundIndex: nextGameState.currentRoundIndex,
        currentChainIndex: nextGameState.currentChainIndex,
        currentTurnIndex: nextGameState.currentTurnIndex,
        turnPhase: nextGameState.turnPhase,
        activePlayerId: nextGameState.activePlayerId,
        turnStartedAt: nextGameState.turnStartedAt,
        turnEndsAt: nextGameState.turnEndsAt,
        status: nextGameState.status,
        chains: chainsToPrisma(nextGameState.chains),
      })
    );

    if (!updateResult.ok) {
      return err(updateResult.error);
    }

    const updatedGame = updateResult.value;

    // Broadcast Realtime events
    await eventPublisher.descriptionSubmitted(
      dto.roomId,
      game.currentChainIndex,
      game.currentTurnIndex,
      ctx.playerId,
      updatedGame.version
    );

    await eventPublisher.turnChanged(dto.roomId, updatedGame, {
      chainIndex: game.currentChainIndex,
      turnIndex: game.currentTurnIndex,
    });

    return ok({
      version: updatedGame.version,
      gameStatus: updatedGame.status,
      currentTurn: toTurnSnapshotDto(updatedGame, ctx.playerId),
    });
  }

  /**
   * Submits a drawing image for the active turn.
   */
  async submitDrawing(
    dto: SubmitDrawingInput,
    ctx: AuthContext
  ): Promise<Result<SubmitDrawingResponse, AppError>> {
    authorize(ctx, 'game:submit');

    if (ctx.type === 'anonymous' || !ctx.playerId) {
      return err(new ForbiddenError('NOT_IN_ROOM', 'Must have an active player session.'));
    }

    const activeGameResult = await gameRepository.findActiveByRoomId(dto.roomId);
    if (!activeGameResult.ok || !activeGameResult.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game session not found.'));
    }

    const game = activeGameResult.value;

    if (game.activePlayerId !== ctx.playerId) {
      return err(new ForbiddenError('NOT_YOUR_TURN', 'It is not your turn to submit.'));
    }

    if (game.turnPhase !== 'DRAW') {
      return err(new ConflictError('INVALID_GAME_TRANSITION', 'Current turn phase is not DRAW.'));
    }

    // Determine drawing image payload (Buffer, data URL, or base64)
    const imagePayload = dto.imageBuffer || dto.imageDataUrl || dto.imageBase64;
    if (!imagePayload) {
      return err(new ValidationError('Drawing image payload is required.'));
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadDrawing(imagePayload, {
      publicId: `game_${game.id}_c${game.currentChainIndex}_t${game.currentTurnIndex}_${ctx.playerId}`,
    });

    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    const roomResult = await roomRepository.findById(dto.roomId);
    const settings = roomResult.ok
      ? roomResult.value.settings
      : { describeTimerSec: 60, drawTimerSec: 90 };

    const transitionRes = transitionGame(game, {
      type: 'SUBMIT_DRAWING',
      playerId: ctx.playerId,
      drawingUrl: uploadResult.value.url,
      drawingPublicId: uploadResult.value.publicId,
      describeTimerSec: settings.describeTimerSec,
      drawTimerSec: settings.drawTimerSec,
    });

    if (!transitionRes.ok) {
      return err(
        new ConflictError(
          transitionRes.error.code,
          transitionRes.error.message,
          transitionRes.error.context
        )
      );
    }

    const nextGameState = transitionRes.value;

    // Optimistically update DB with expectedVersion check
    const updateResult = await gameRepository.updateWithVersion(
      game.id,
      dto.expectedVersion,
      () => ({
        currentRoundIndex: nextGameState.currentRoundIndex,
        currentChainIndex: nextGameState.currentChainIndex,
        currentTurnIndex: nextGameState.currentTurnIndex,
        turnPhase: nextGameState.turnPhase,
        activePlayerId: nextGameState.activePlayerId,
        turnStartedAt: nextGameState.turnStartedAt,
        turnEndsAt: nextGameState.turnEndsAt,
        status: nextGameState.status,
        chains: chainsToPrisma(nextGameState.chains),
      })
    );

    if (!updateResult.ok) {
      return err(updateResult.error);
    }

    const updatedGame = updateResult.value;

    // Broadcast Realtime events
    await eventPublisher.drawingSubmitted(
      dto.roomId,
      game.currentChainIndex,
      game.currentTurnIndex,
      ctx.playerId,
      updatedGame.version
    );

    await eventPublisher.turnChanged(dto.roomId, updatedGame, {
      chainIndex: game.currentChainIndex,
      turnIndex: game.currentTurnIndex,
    });

    return ok({
      version: updatedGame.version,
      drawingUrl: uploadResult.value.url,
      gameStatus: updatedGame.status,
      currentTurn: toTurnSnapshotDto(updatedGame, ctx.playerId),
    });
  }

  /**
   * Pauses the active game (Host only).
   */
  async pauseGame(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<PauseGameResponse, AppError>> {
    authorize(ctx, 'game:pause');

    const roomRes = await roomRepository.findByCode(roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);
    if (!gameRes.ok || !gameRes.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game not found.'));
    }

    const game = gameRes.value;
    const pauseTransition = transitionGame(game, { type: 'PAUSE' });

    if (!pauseTransition.ok) {
      return err(new ConflictError(pauseTransition.error.code, pauseTransition.error.message));
    }

    const nextState = pauseTransition.value;
    const updateRes = await gameRepository.updateWithVersion(game.id, game.version, () => ({
      status: 'PAUSED',
      pausedAt: nextState.pausedAt,
      pauseRemainingMs: nextState.pauseRemainingMs,
    }));

    if (!updateRes.ok) {
      return err(updateRes.error);
    }

    const remainingSec = Math.ceil((nextState.pauseRemainingMs ?? 0) / 1000);
    await eventPublisher.gamePaused(
      room.id,
      ctx.type !== 'anonymous' && ctx.playerId ? ctx.playerId : 'host',
      remainingSec,
      updateRes.value.version
    );

    return ok({
      version: updateRes.value.version,
      status: 'PAUSED',
      pausedAt: nextState.pausedAt?.toISOString() || new Date().toISOString(),
      remainingSeconds: remainingSec,
    });
  }

  /**
   * Resumes a paused game (Host only).
   */
  async resumeGame(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<ResumeGameResponse, AppError>> {
    authorize(ctx, 'game:pause');

    const roomRes = await roomRepository.findByCode(roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);
    if (!gameRes.ok || !gameRes.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game not found.'));
    }

    const game = gameRes.value;
    const resumeTransition = transitionGame(game, { type: 'RESUME' });

    if (!resumeTransition.ok) {
      return err(new ConflictError(resumeTransition.error.code, resumeTransition.error.message));
    }

    const nextState = resumeTransition.value;
    const updateRes = await gameRepository.updateWithVersion(game.id, game.version, () => ({
      status: 'IN_PROGRESS',
      pausedAt: null,
      pauseRemainingMs: null,
      turnEndsAt: nextState.turnEndsAt,
    }));

    if (!updateRes.ok) {
      return err(updateRes.error);
    }

    const remainingSec = Math.ceil((nextState.turnEndsAt.getTime() - Date.now()) / 1000);

    await eventPublisher.gameResumed(
      room.id,
      nextState.turnEndsAt,
      remainingSec,
      updateRes.value.version
    );

    return ok({
      version: updateRes.value.version,
      status: 'IN_PROGRESS',
      turnEndsAt: nextState.turnEndsAt.toISOString(),
      remainingSeconds: remainingSec,
    });
  }

  /**
   * Processes timer expiry automatically if turn deadline has passed.
   */
  async processTimerExpiry(gameId: string): Promise<Result<GameEntity, AppError>> {
    const gameRes = await gameRepository.findById(gameId);
    if (!gameRes.ok) return gameRes;

    const game = gameRes.value;
    if (game.status !== 'IN_PROGRESS') {
      return ok(game);
    }

    const now = new Date();
    if (game.turnEndsAt.getTime() > now.getTime()) {
      return ok(game);
    }

    const roomRes = await roomRepository.findById(game.roomId);
    const settings = roomRes.ok
      ? roomRes.value.settings
      : { describeTimerSec: 60, drawTimerSec: 90 };

    const expiryTransition = transitionGame(game, {
      type: 'TIMER_EXPIRED',
      describeTimerSec: settings.describeTimerSec,
      drawTimerSec: settings.drawTimerSec,
    });

    if (!expiryTransition.ok) {
      return ok(game);
    }

    const nextState = expiryTransition.value;
    const updateRes = await gameRepository.updateWithVersion(game.id, game.version, () => ({
      currentRoundIndex: nextState.currentRoundIndex,
      currentChainIndex: nextState.currentChainIndex,
      currentTurnIndex: nextState.currentTurnIndex,
      turnPhase: nextState.turnPhase,
      activePlayerId: nextState.activePlayerId,
      turnStartedAt: nextState.turnStartedAt,
      turnEndsAt: nextState.turnEndsAt,
      status: nextState.status,
      chains: chainsToPrisma(nextState.chains),
    }));

    if (updateRes.ok) {
      await eventPublisher.turnChanged(game.roomId, updateRes.value, {
        chainIndex: game.currentChainIndex,
        turnIndex: game.currentTurnIndex,
      });
    }

    return updateRes;
  }

  /**
   * Fetches the current game snapshot filtered for the viewer.
   */
  async getSnapshot(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<GameSnapshotDto, AppError>> {
    const roomRes = await roomRepository.findByCode(roomCode);
    if (!roomRes.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomRes.value;
    const gameRes = await gameRepository.findActiveByRoomId(room.id);
    if (!gameRes.ok || !gameRes.value) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Active game not found.'));
    }

    const viewerPlayerId = ctx.type !== 'anonymous' && ctx.playerId ? ctx.playerId : 'spectator';

    return ok(toGameSnapshotDto(gameRes.value, viewerPlayerId));
  }
}

export const gameService = new GameService();
